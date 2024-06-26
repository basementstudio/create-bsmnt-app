import * as p from '@clack/prompts'
import chalk from 'chalk'
import { Command } from 'commander'

import { CREATE_BSMNT_APP, DEFAULT_APP_NAME } from '~/consts.js'
import { type AvailablePackages } from '~/installers/index.js'
import { getVersion } from '~/utils/getBsmntVersion.js'
import { getUserPkgManager } from '~/utils/getUserPkgManager.js'
import { IsTTYError } from '~/utils/isTTYError.js'
import { logger } from '~/utils/logger.js'
import { validateAppName } from '~/utils/validateAppName.js'
import { validateImportAlias } from '~/utils/validateImportAlias.js'

interface CliFlags {
  noGit: boolean
  noInstall: boolean
  default: boolean
  importAlias: string

  /** @internal Used in CI. */
  CI: boolean
  /** @internal Used in CI. */
  tailwind: boolean
  /** @internal Used in CI. */
  basehub: boolean
  /** @internal Used in CI. */
  appRouter: boolean
  creativeStack: boolean
}

interface CliResults {
  appName: string
  packages: AvailablePackages[]
  flags: CliFlags
}

const defaultOptions: CliResults = {
  appName: DEFAULT_APP_NAME,
  packages: ['basehub', 'tailwind'],
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
    CI: false,
    tailwind: false,
    basehub: false,
    importAlias: '~/',
    appRouter: false,
    creativeStack: false,
  },
}

export const runCli = async (): Promise<CliResults> => {
  const cliResults = defaultOptions

  const program = new Command()
    .name(CREATE_BSMNT_APP)
    .description('A CLI for creating cool websites with the basement stack')
    .argument(
      '[dir]',
      'The name of the application, as well as the name of the directory to create'
    )
    .option(
      '--no-git',
      'Explicitly tell the CLI to not initialize a new git repo in the project',
      false
    )
    .option(
      '--no-install',
      "Explicitly tell the CLI to not run the package manager's install command",
      false
    )
    .option(
      '-y, --default',
      'Bypass the CLI and use all default options to bootstrap a new basement app',
      false
    )
    /** START CI-FLAGS */
    /**
     * @experimental Used for CI E2E tests. If any of the following option-flags are provided, we
     *               skip prompting.
     */
    .option('--CI', "Boolean value if we're running in CI", false)
    /** @experimental - Used for CI E2E tests. Used in conjunction with `--CI` to skip prompting. */
    .option(
      '--tailwind [boolean]',
      'Experimental: Boolean value if we should install Tailwind CSS. Must be used in conjunction with `--CI`.',
      (value) => !!value && value !== 'false'
    )
    /** @experimental Used for CI E2E tests. Used in conjunction with `--CI` to skip prompting. */
    .option(
      '--creative-stack [boolean]',
      'Experimental: Boolean value if we should install the 3D creative stack. Must be used in conjunction with `--creactiveStack`.',
      (value) => !!value && value !== 'false'
    )
    /** @experimental Used for CI E2E tests. Used in conjunction with `--CI` to skip prompting. */
    .option(
      '--basehub [boolean]',
      'Experimental: Boolean value if we should install BaseHub. Must be used in conjunction with `--basehub`.',
      (value) => !!value && value !== 'false'
    )
    /** @experimental - Used for CI E2E tests. Used in conjunction with `--CI` to skip prompting. */
    .option(
      '-i, --import-alias',
      'Explicitly tell the CLI to use a custom import alias',
      defaultOptions.flags.importAlias
    )
    .option(
      '--app-router [boolean]',
      'Explicitly tell the CLI to use the new Next.js app router',
      (value) => !!value && value !== 'false'
    )
    /** END CI-FLAGS */

    .version(getVersion(), '-v, --version', 'Display the version number')

    .parse(process.argv)

  // FIXME: TEMPORARY WARNING WHEN USING YARN 3. SEE ISSUE #57
  if (process.env.npm_config_user_agent?.startsWith('yarn/3')) {
    logger.warn(`  WARNING: It looks like you are using Yarn 3. This is currently not supported,
  and likely to result in a crash. Please run create-bsmnt-app with another
  package manager such as pnpm, npm, or Yarn Classic.`)
  }

  // Needs to be separated outside the if statement to correctly infer the type as string | undefined
  const cliProvidedName = program.args[0]
  if (cliProvidedName) {
    cliResults.appName = cliProvidedName
  }

  cliResults.flags = program.opts()

  /** @internal Used for CI E2E tests. */
  if (cliResults.flags.CI) {
    cliResults.packages = []
    if (cliResults.flags.tailwind) cliResults.packages.push('tailwind')
    if (cliResults.flags.basehub) cliResults.packages.push('basehub')
    if (cliResults.flags.creativeStack)
      cliResults.packages.push('creativeStack')

    // example how to deal with incompatible flags
    // if (cliResults.flags.prisma && cliResults.flags.drizzle) {
    //   // We test a matrix of all possible combination of packages in CI. Checking for impossible
    //   // combinations here and exiting gracefully is easier than changing the CI matrix to exclude
    //   // invalid combinations. We are using an "OK" exit code so CI continues with the next combination.
    //   logger.warn("Incompatible combination Prisma + Drizzle. Exiting.");
    //   process.exit(0);
    // }

    return cliResults
  }

  if (cliResults.flags.default) {
    return cliResults
  }

  // Explained below why this is in a try/catch block
  try {
    if (process.env.TERM_PROGRAM?.toLowerCase().includes('mintty')) {
      logger.warn(`  WARNING: It looks like you are using MinTTY, which is non-interactive. This is most likely because you are 
  using Git Bash. If that's that case, please use Git Bash from another terminal, such as Windows Terminal. Alternatively, you 
  can provide the arguments from the CLI directly: https://create.t3.gg/en/installation#experimental-usage to skip the prompts.`)

      throw new IsTTYError('Non-interactive environment')
    }

    // if --CI flag is set, we are running in CI mode and should not prompt the user

    const pkgManager = getUserPkgManager()

    const project = await p.group(
      {
        ...(!cliProvidedName && {
          name: () =>
            p.text({
              message: 'What will your project be called?',
              defaultValue: cliProvidedName,
              validate: validateAppName,
            }),
        }),
        language: () => {
          return p.select({
            message: 'Will you be using TypeScript or JavaScript?',
            options: [
              { value: 'typescript', label: 'TypeScript' },
              { value: 'javascript', label: 'JavaScript' },
            ],
            initialValue: 'typescript',
          })
        },
        _: ({ results }) =>
          results.language === 'javascript'
            ? p.note(chalk.redBright('Wrong answer, using TypeScript instead'))
            : undefined,
        styling: () => {
          return p.confirm({
            message: 'Will you be using Tailwind CSS for styling?',
          })
        },
        appRouter: () => {
          return p.confirm({
            message: ' Would you like to use Next.js App Router?',
            initialValue: true,
          })
        },
        basehub: () => {
          return p.confirm({
            message: 'Will you be using BaseHub as CMS?',
          })
        },
        creativeStack: () => {
          return p.confirm({
            message: 'Will you be using the 3D creative stack?',
          })
        },
        ...(!cliResults.flags.noGit && {
          git: () => {
            return p.confirm({
              message:
                'Should we initialize a Git repository and stage the changes?',
              initialValue: !defaultOptions.flags.noGit,
            })
          },
        }),
        ...(!cliResults.flags.noInstall && {
          install: () => {
            return p.confirm({
              message:
                `Should we run '${pkgManager}` +
                (pkgManager === 'yarn' ? `'?` : ` install' for you?`),
              initialValue: !defaultOptions.flags.noInstall,
            })
          },
        }),
        importAlias: () => {
          return p.text({
            message: 'What import alias would you like to use?',
            defaultValue: defaultOptions.flags.importAlias,
            placeholder: defaultOptions.flags.importAlias,
            validate: validateImportAlias,
          })
        },
      },
      {
        onCancel() {
          process.exit(1)
        },
      }
    )

    const packages: AvailablePackages[] = []
    if (project.styling) packages.push('tailwind')
    if (project.basehub) packages.push('basehub')
    if (project.creativeStack) packages.push('creativeStack')

    return {
      appName: project.name ?? cliResults.appName,
      packages,
      flags: {
        ...cliResults.flags,
        appRouter: project.appRouter ?? cliResults.flags.appRouter,
        noGit: !project.git ?? cliResults.flags.noGit,
        noInstall: !project.install ?? cliResults.flags.noInstall,
        importAlias: project.importAlias ?? cliResults.flags.importAlias,
      },
    }
  } catch (err) {
    // If the user is not calling create-bsmnt-app from an interactive terminal, inquirer will throw an IsTTYError
    // If this happens, we catch the error, tell the user what has happened, and then continue to run the program with a default bsmnt app
    if (err instanceof IsTTYError) {
      logger.warn(`
  ${CREATE_BSMNT_APP} needs an interactive terminal to provide options`)

      const shouldContinue = await p.confirm({
        message: `Continue scaffolding a default bsmnt-app?`,
        initialValue: true,
      })

      if (!shouldContinue) {
        logger.info('Exiting...')
        process.exit(0)
      }

      logger.info(
        `Bootstrapping a default bsmnt-app app in ./${cliResults.appName}`
      )
    } else {
      throw err
    }
  }

  return cliResults
}
