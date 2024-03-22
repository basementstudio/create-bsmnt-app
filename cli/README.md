# Create-Bsmnt-App CLI

Welcome to `create-bsmnt-app`, the CLI tool designed to kickstart your project with the Basement team's stack, honed from years of experience in creating outstanding websites. This tool provides an opinionated yet customizable starter for Next.js applications, integrating the tools and libraries we trust and recommend.

## Quick Start

To create a new project, run:

```bash
npx create-bsmnt-app <project-name>
```

## Customization Options

During the setup, you will be prompted to choose various options to tailor the project to your needs:

### Tailwind CSS

Add Tailwind CSS for styling.

### BaseHub CMS Integration

Integrate with BaseHub CMS, our preferred content management system.<br/>
See [BaseHub docs](https://basehub.com/docs/basics/introduction) for more info.

### App Router

Choose between Next.js pages router or app router.

### Creative Stack

Include libraries and setup necessary for working with Three.js and related tools:

- `three`
- `@react-three/drei`
- `@react-three/fiber`
- `leva`
- `three-stdlib`

### Other options:

- **Git Repository**: Initialize a Git repository for version control.
- **NPM Install**: Automatically install NPM packages.
- **Import Alias**: Modify the import alias, default is "~/".

### Using without prompts

Alternatively, you can bypass the interactive prompts and use flags to directly specify your preferences:
| Flag | Description |
|--------------------|--------------------------------------------------------------|
| `--tailwind` | Include Tailwind CSS. Accepts `true` or `false`. |
| `--basehub` | Integrate BaseHub CMS. Accepts `true` or `false`. |
| `--app-router` | Use a custom app router instead of Next.js pages router. |
| `--creative-stack` | Include the creative stack for Three.js development. |
| `--no-git` | Skip initializing a Git repository. |
| `--no-install` | Skip automatic NPM package installation. |

### Example

```bash
npx create-bsmnt-app my-next-app --tailwind=true --basehub=true --app-router=true --creative-stack=true --no-git
```
