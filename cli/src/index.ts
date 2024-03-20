#!/usr/bin/env node
import path from 'path'
import { execa } from 'execa'
import fs from 'fs-extra'
import { type PackageJson } from 'type-fest'

import { runCli } from '~/cli/index.js'
import { createProject } from '~/helpers/createProject.js'
import { initializeGit } from '~/helpers/git.js'
import { logNextSteps } from '~/helpers/logNextSteps.js'
import { setImportAlias } from '~/helpers/setImportAlias.js'
import { buildPkgInstallerMap } from '~/installers/index.js'
import { getUserPkgManager } from '~/utils/getUserPkgManager.js'
import { logger } from '~/utils/logger.js'
import { parseNameAndPath } from '~/utils/parseNameAndPath.js'
import { renderTitle } from '~/utils/renderTitle.js'
import { PKG_ROOT } from './consts.js'
import { installDependencies } from './helpers/installDependencies.js'
import { getVersion } from './utils/getBsmntVersion.js'
import {
  getNpmVersion,
  renderVersionWarning,
} from './utils/renderVersionWarning.js'

type BsmntPackageJSON = PackageJson & {
  bsmntMetadata?: {
    initVersion: string
  }
}

const main = async () => {
  const npmVersion = await getNpmVersion()
  const pkgManager = getUserPkgManager()
  renderTitle()
  npmVersion && renderVersionWarning(npmVersion)

  const {
    appName,
    packages,
    flags: { noGit, noInstall, importAlias, appRouter },
  } = await runCli()

  const usePackages = buildPkgInstallerMap(packages)

  // e.g. dir/@mono/app returns ["@mono/app", "dir/app"]
  const [scopedAppName, appDir] = parseNameAndPath(appName)

  const projectDir = await createProject({
    projectName: appDir,
    scopedAppName,
    packages: usePackages,
    importAlias,
    noInstall,
    appRouter,
  })

  // Write name to package.json
  const pkgJson = fs.readJSONSync(
    path.join(projectDir, 'package.json')
  ) as BsmntPackageJSON
  pkgJson.name = scopedAppName
  pkgJson.bsmntMetadata = { initVersion: getVersion() }

  // ? Bun doesn't support this field (yet)
  if (pkgManager !== 'bun') {
    const { stdout } = await execa(pkgManager, ['-v'], {
      cwd: projectDir,
    })
    pkgJson.packageManager = `${pkgManager}@${stdout.trim()}`
  }

  fs.writeJSONSync(path.join(projectDir, 'package.json'), pkgJson, {
    spaces: 2,
  })

  // update import alias in any generated files if not using the default
  if (importAlias !== '~/') {
    setImportAlias(projectDir, importAlias)
  }

  if (!noInstall) {
    await installDependencies({ projectDir })
  }

  // Rename _eslintrc.json to .eslintrc.json - we use _eslintrc.json to avoid conflicts with the monorepos linter
  fs.renameSync(
    path.join(projectDir, '_eslintrc.cjs'),
    path.join(projectDir, '.eslintrc.cjs')
  )

  // do the same for stylelint
  fs.renameSync(
    path.join(projectDir, '_stylelintrc.cjs'),
    path.join(projectDir, '.stylelintrc.cjs')
  )

  // if tailwind is included, copy the prettier config from the extras folder
  if (packages.includes('tailwind')) {
    const extrasDir = path.join(PKG_ROOT, 'template/extras')
    const prettierSrc = path.join(extrasDir, 'config/_prettierrc.js')
    const prettierDest = path.join(projectDir, '_prettierrc.js')
    fs.copySync(prettierSrc, prettierDest)
  }

  // rename the prettier config
  fs.renameSync(
    path.join(projectDir, '_prettierrc.js'),
    path.join(projectDir, '.prettierrc.js')
  )

  if (!noGit) {
    await initializeGit(projectDir)
  }

  await logNextSteps({
    projectName: appDir,
    packages: usePackages,
    appRouter,
    noInstall,
    projectDir,
  })

  process.exit(0)
}

main().catch((err) => {
  logger.error('Aborting installation...')
  if (err instanceof Error) {
    logger.error(err)
  } else {
    logger.error(
      'An unknown error has occurred. Please open an issue on github with the below:'
    )
    console.log(err)
  }
  process.exit(1)
})
