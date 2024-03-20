/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  semi: false,
  singleQuote: true,
  arrowParens: 'always',
  tabWidth: 2,
  printWidth: 80,
  trailingComma: 'none',
  endOfLine: 'auto',
}

export default config
