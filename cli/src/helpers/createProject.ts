import fs from 'fs'
import path from 'path'

import { PKG_ROOT } from '~/consts.js'
import { installPackages } from '~/helpers/installPackages.js'
import { scaffoldProject } from '~/helpers/scaffoldProject.js'
import {
  selectAppFile,
  selectIndexFile,
  selectLayoutFile,
  selectPageFile,
} from '~/helpers/selectBoilerplate.js'
import { type PkgInstallerMap } from '~/installers/index.js'
import { getUserPkgManager } from '~/utils/getUserPkgManager.js'

interface CreateProjectOptions {
  projectName: string
  packages: PkgInstallerMap
  scopedAppName: string
  noInstall: boolean
  importAlias: string
  appRouter: boolean
}

export const createProject = async ({
  projectName,
  scopedAppName,
  packages,
  noInstall,
  appRouter,
}: CreateProjectOptions) => {
  const pkgManager = getUserPkgManager()
  const projectDir = path.resolve(process.cwd(), projectName)

  // Bootstraps the base Next.js application
  await scaffoldProject({
    projectName,
    projectDir,
    pkgManager,
    scopedAppName,
    noInstall,
    appRouter,
  })

  // Install the selected packages
  installPackages({
    projectName,
    scopedAppName,
    projectDir,
    pkgManager,
    packages,
    noInstall,
    appRouter,
  })

  // Select necessary _app,index / layout,page files
  if (appRouter) {
    if (packages.basehub.inUse) {
      fs.copyFileSync(
        path.join(
          PKG_ROOT,
          'template/extras/config/next-config-appdir-basehub.js'
        ),
        path.join(projectDir, 'next.config.js')
      )
    } else {
      // Replace next.config
      fs.copyFileSync(
        path.join(PKG_ROOT, 'template/extras/config/next-config-appdir.js'),
        path.join(projectDir, 'next.config.js')
      )
    }

    selectLayoutFile({ projectDir, packages })
    selectPageFile({ projectDir, packages })
  } else {
    selectAppFile({ projectDir, packages })
    selectIndexFile({ projectDir, packages })

    if (packages.basehub.inUse) {
      // Replace tailwind.config
      fs.copyFileSync(
        path.join(
          PKG_ROOT,
          'template/extras/config/next-config-pages-basehub.js'
        ),
        path.join(projectDir, 'next.config.js')
      )
    }
  }

  return projectDir
}
