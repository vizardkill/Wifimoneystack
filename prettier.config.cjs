module.exports = {
  trailingComma: 'none',
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  printWidth: 160,
  bracketSpacing: true,
  endOfLine: 'auto',
  jsxSingleQuote: false,
  bracketSameLine: false,
  arrowParens: 'always',
  quoteProps: 'as-needed',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  importOrder: [
    '^react$',
    '^react-dom$',
    '^next(/.*)?$',
    '^@remix-run(/.*)?$',
    '^redux(/.*)?$',
    '^@reduxjs(/.*)?$',
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^@modules/(.*)$',
    '^@components/(.*)$',
    '^@ui/(.*)$',
    '^@lib/(.*)$',
    '^@hooks/(.*)$',
    '^@utils$',
    '^@types$',
    '^@functions/(.*)$',
    '^@server/(.*)$',
    '^@routes/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  importOrderGroupNamespaceSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs'],
      options: {
        parser: 'typescript',
        plugins: ['@trivago/prettier-plugin-sort-imports']
      }
    },
    {
      files: ['*.css', '*.scss'],
      options: {
        parser: 'css',
        singleQuote: false
      }
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        parser: 'json',
        tabWidth: 2,
        trailingComma: 'none'
      }
    },
    {
      files: '*.html',
      options: {
        parser: 'html'
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'always'
      }
    }
  ]
}
