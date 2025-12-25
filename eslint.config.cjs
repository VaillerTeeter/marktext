// eslint.config.cjs (ESLint 9 flat config，最小改动版)
const js = require('@eslint/js')
const pluginVue = require('eslint-plugin-vue')
const pluginImport = require('eslint-plugin-import')
const pluginHtml = require('eslint-plugin-html')
const babelParser = require('@babel/eslint-parser')
const globals = require('globals')

module.exports = [
  // 1. ESLint 推荐基础
  js.configs.recommended,

  // 2. 主源码配置（原 .eslintrc.js）
  {
    name: 'Main source',
    files: ['src/**/*.{js,vue}', '**/*.js'],   // 覆盖原规则范围
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { impliedStrict: true }
      },
      globals: {
        ...require('globals').browser,
        ...require('globals').node,
        ...require('globals').es2020,
        __static: 'readonly'
      }
    },
    plugins: {
      vue: pluginVue,
      html: pluginHtml,
      import: pluginImport
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1, ignoreComments: true }],
      semi: ['error', 'never'],
      'no-return-await': 'error',
      'no-return-assign': 'error',
      'no-new': 'error',
      'arrow-parens': 'off',
      'no-console': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'require-atomic-updates': 'off',
      'prefer-const': 'off',
      'no-mixed-operators': 'off',
      'no-prototype-builtins': 'off',
      'no-unused-vars': 'off'
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['common', './src/common'],
            ['@', './src/renderer'],
            ['muya', './src/muya']
          ],
          extensions: ['.js', '.vue', '.json', '.css', '.node']
        }
      }
    }
  },

  // 3. Vue 基础规则（原 plugin:vue/base）
  ...pluginVue.configs['flat/base'],

  // 4. 测试文件（原 test/.eslintrc）
  {
    name: 'Test files',
    files: ['test/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...require('globals').mocha,
        assert: 'readonly',
        expect: 'readonly',
        should: 'readonly',
        __static: 'readonly'
      }
    }
  },

  // 5. 全局忽略（原 ignorePatterns）
  {
    ignores: [
      'node_modules/**',
      'src/muya/dist/**',
      'src/muya/webpack.config.js'
    ]
  },

  // 6. 全局目录忽略（原 .eslintignore）
  {
    name: 'Old .eslintignore rules',
    ignores: [
      'test/unit/coverage/**',
      'test/unit/*.js',
      'test/e2e/*.js',
      'src/renderer/assets/symbolIcon/index.js',
      'src/muya/lib/assets/libs/*.js'
    ]
  },

  {
    name: 'import recommended rules',
    plugins: { import: pluginImport },
    rules: {
      ...pluginImport.configs.recommended.rules
    }
  }
]
