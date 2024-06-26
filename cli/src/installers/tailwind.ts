import path from 'path'
import fs from 'fs-extra'
import { type PackageJson } from 'type-fest'

import { PKG_ROOT } from '~/consts.js'
import { type Installer } from '~/installers/index.js'
import { addPackageDependency } from '~/utils/addPackageDependency.js'

export const tailwindInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: [
      'tailwindcss',
      'postcss',
      'autoprefixer',
      'prettier',
      'prettier-plugin-tailwindcss',
    ],
    devMode: true,
  })

  const extrasDir = path.join(PKG_ROOT, 'template/extras')

  const twCfgSrc = path.join(extrasDir, 'config/tailwind.config.ts')
  const twCfgDest = path.join(projectDir, 'tailwind.config.ts')

  const postcssCfgSrc = path.join(extrasDir, 'config/postcss.config.cjs')
  const postcssCfgDest = path.join(projectDir, 'postcss.config.cjs')

  const cssSrc = path.join(extrasDir, 'src/css/global.scss')
  const cssDest = path.join(projectDir, 'src/css/global.scss')

  // add this line to /.vscode/settings.json
  // "css.customData": [".vscode/tailwind.json"]
  const settingsJsonPath = path.join(projectDir, '.vscode/settings.json')
  const settingsJson = fs.readJSONSync(settingsJsonPath) as PackageJson

  settingsJson['css.customData'] = ['.vscode/tailwind.json']

  // so we can add these custom css rules for tailwind utilities
  const tailwindJsonSrc = path.join(extrasDir, '/config/tailwind.json')
  const tailwindJsonDest = path.join(projectDir, '.vscode/tailwind.json')

  fs.copySync(twCfgSrc, twCfgDest)
  fs.copySync(postcssCfgSrc, postcssCfgDest)
  fs.copySync(cssSrc, cssDest)
  fs.copySync(tailwindJsonSrc, tailwindJsonDest)
}
