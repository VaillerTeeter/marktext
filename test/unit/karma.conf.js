'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const { merge } = require('webpack-merge')
const webpack = require('webpack')

// Suppress noisy Node warnings that originate from third-party deps used only in tests.
process.env.NODE_NO_WARNINGS = process.env.NODE_NO_WARNINGS || '1'

// Silence util._extend deprecation noise on Node 22 during Karma bootstrap.
if (typeof util._extend === 'function' && util._extend !== Object.assign) {
  util._extend = Object.assign
}
const originalWarn = console.warn
console.warn = (...args) => {
  if (args.some(arg => typeof arg === 'string' && arg.includes('util._extend'))) return
  originalWarn(...args)
}
const originalEmitWarning = typeof process.emitWarning === 'function' ? process.emitWarning : null
if (originalEmitWarning) {
  // Short-circuit util._extend warnings emitted before the test bundle runs.
  process.emitWarning = (warning, ...rest) => {
    if ((warning && warning.code === 'DEP0060') || (typeof warning === 'string' && warning.includes('util._extend'))) return
    return originalEmitWarning.call(process, warning, ...rest)
  }
}
process.on('warning', warning => {
  if (warning && warning.code === 'DEP0060') return
  console.warn(warning)
})

const baseConfig = require('../../.electron-vue/webpack.renderer.config')

// Set BABEL_ENV to use proper preset config
process.env.BABEL_ENV = 'test'

// We need to create the build directory before launching Karma.
try {
  fs.mkdirSync(path.join('dist', 'electron'), { recursive: true })
  // Avoid noisy filelist warnings by ensuring font directories exist with a placeholder file.
  const fontRoots = [
    path.join('dist', 'electron', 'fonts'),
    path.join('dist', 'electron', 'static', 'themes', 'fonts')
  ]
  fontRoots.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true })
    const keepFile = path.join(dir, 'placeholder.woff')
    if (!fs.existsSync(keepFile)) {
      fs.writeFileSync(keepFile, '')
    }
  })
} catch(e) {
  if (e.code !== 'EEXIST') {
    throw e
  }
}

let webpackConfig = merge(baseConfig, {
  devtool: 'inline-source-map',
  cache: false,
  output: {
    // Point asset public path to the built folder Karma serves under /base
    publicPath: '/base/dist/electron/'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      // Silence noisy DOM crash warnings that are surfaced only during automated tests.
      'process.env.SILENCE_MUTATION_WARNINGS': '"true"'
    })
  ]
})

// don't treat dependencies as externals
delete webpackConfig.entry
delete webpackConfig.externals
delete webpackConfig.output.libraryTarget
delete webpackConfig.optimization

webpackConfig.resolve = webpackConfig.resolve || {}
webpackConfig.resolve.alias = webpackConfig.resolve.alias || {}
webpackConfig.resolve.alias.axios = require.resolve('axios/dist/node/axios.cjs')
webpackConfig.resolve.alias.ced = path.resolve(__dirname, 'mocks/ced.js')
webpackConfig.resolve.alias['electron-log/main'] = path.resolve(__dirname, 'mocks/electron-log.js')
webpackConfig.resolve.alias['native-keymap'] = path.resolve(__dirname, 'mocks/native-keymap.js')

// BUG: TypeError: Cannot read property 'loaders' of undefined
// // apply vue option to apply isparta-loader on js
// webpackConfig.module.rules
//   .find(rule => rule.use.loader === 'vue-loader').use.options.loaders.js = 'babel-loader'

module.exports = config => {
  config.set({
    basePath: path.resolve(__dirname, '..', '..'),
    browserNoActivityTimeout: 120000,
    browserDisconnectTimeout: 60000,
    browsers: ['CustomElectron'],
    customLaunchers: {
      CustomElectron: {
        base: 'Electron',
        browserWindowOptions: {
          webPreferences: {
            contextIsolation: false,
            spellcheck: false,
            nodeIntegration: true,
            webSecurity: false,
            sandbox: false
          }
        }
      }
    },
    mode: 'development',
    client: {
      useIframe: false
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    },
    frameworks: ['mocha', 'webpack'],
    files: [
      'test/unit/setup-chai.js',
      'test/unit/index.js',
      // Serve built font assets so css-loader emitted URLs resolve without 404
      { pattern: 'dist/electron/fonts/**/*', watched: false, included: false, served: true, nocache: true },
      { pattern: 'dist/electron/static/themes/fonts/**/*', watched: false, included: false, served: true, nocache: true },
      // Stub static assets requested by the renderer during tests to avoid 404 noise
      { pattern: 'test/unit/mocks/static/**/*', watched: false, included: false, served: true, nocache: true },
      // Serve CodeMirror mode stubs so loader requests resolve without 404s
      { pattern: 'test/unit/mocks/mode/**/*', watched: false, included: false, served: true, nocache: true },
      { pattern: 'test/unit/mocks/images/**/*', watched: false, included: false, served: true, nocache: true }
    ],
    preprocessors: {
      'test/unit/setup-chai.js': ['webpack', 'sourcemap'],
      'test/unit/index.js': ['webpack', 'sourcemap']
    },
    reporters: ['spec', 'coverage'],
    singleRun: true,
    // Proxy font requests to the built assets to avoid 404s during tests
    proxies: {
      '/fonts/': '/base/dist/electron/fonts/',
      '/static/themes/fonts/': '/base/dist/electron/static/themes/fonts/',
      '/static/': '/base/test/unit/mocks/static/',
      '/thumb': '/base/test/unit/mocks/images/thumb.svg'
      ,
      // Serve codemirror mode stubs and avoid noisy 404s for tests requesting
      // non-existent modes.
      '/mode/': '/base/test/unit/mocks/mode/'
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  })
}
