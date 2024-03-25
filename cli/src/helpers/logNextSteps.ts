import { DEFAULT_APP_NAME } from '~/consts.js'
import { type InstallerOptions } from '~/installers/index.js'
import { getUserPkgManager } from '~/utils/getUserPkgManager.js'
import { logger } from '~/utils/logger.js'
import { isInsideGitRepo, isRootGitRepo } from './git.js'

// This logs the next steps that the user should take in order to advance the project
export const logNextSteps = async ({
  projectName = DEFAULT_APP_NAME,
  packages,
  noInstall,
  projectDir,
}: Pick<
  InstallerOptions,
  'projectName' | 'packages' | 'noInstall' | 'projectDir' | 'appRouter'
>) => {
  const pkgManager = getUserPkgManager()

  logger.info('Next steps:')
  projectName !== '.' && logger.info(`  cd ${projectName}`)
  if (noInstall) {
    // To reflect yarn's default behavior of installing packages when no additional args provided
    if (pkgManager === 'yarn') {
      logger.info(`  ${pkgManager}`)
    } else {
      logger.info(`  ${pkgManager} install`)
    }
  }

  if (['npm', 'bun'].includes(pkgManager)) {
    logger.info(`  ${pkgManager} run dev`)
  } else {
    logger.info(`  ${pkgManager} dev`)
  }

  if (!(await isInsideGitRepo(projectDir)) && !isRootGitRepo(projectDir)) {
    logger.info(`  git init`)
  }

  if (packages?.basehub.inUse) {
    logger.info(`  change the BASEHUB_TOKEN in .env file`)
  }
}
