import * as chai from 'chai'
import util from 'util'

const globalObj = (typeof window !== 'undefined') ? window : globalThis

// Patch deprecated util._extend calls in dependencies to avoid noisy warnings on Node 22+.
if (util && typeof util._extend === 'function' && util._extend !== Object.assign) {
  util._extend = Object.assign
}
const originalWarn = console.warn
console.warn = (...args) => {
  if (args.some(arg => typeof arg === 'string' && arg.includes('util._extend'))) return
  originalWarn(...args)
}
const originalLog = console.log
console.log = (...args) => {
  // Drop noisy debug logs emitted only in tests.
  if (args.length === 3 && args[0] === ' ' && args[1] === 'e' && args[2] === 'u') return
  if (args.some(arg => typeof arg === 'string' && arg.includes('Keyboard information written'))) return
  if (args.some(arg => typeof arg === 'string' && arg.includes('Invalid keybindings.json configuration'))) return
  if (args.some(arg => typeof arg === 'string' && arg.includes('Unknown directory watch type'))) return
  if (args.some(arg => typeof arg === 'string' && arg.includes('LOG LOG'))) return
  originalLog(...args)
}
if (typeof process !== 'undefined') {
  const originalEmitWarning = typeof process.emitWarning === 'function' ? process.emitWarning : null
  if (originalEmitWarning) {
    // Guard against DEP0060 spam emitted by dependencies running under Node 22.
    process.emitWarning = (warning, ...rest) => {
      if ((warning && warning.code === 'DEP0060') || (typeof warning === 'string' && warning.includes('util._extend'))) return
      return originalEmitWarning.call(process, warning, ...rest)
    }
  }
  if (typeof process.on === 'function') {
    process.on('warning', warning => {
      if (warning && warning.code === 'DEP0060') return
      console.warn(warning)
    })
  }
}

// Provide a minimal structuredClone polyfill for the Electron/Karma runtime
// so ESLint config parsing does not fail in environments missing the builtin.
if (typeof globalObj.structuredClone !== 'function') {
  globalObj.structuredClone = value => JSON.parse(JSON.stringify(value))
}

globalObj.chai = chai

globalObj.expect = chai.expect
globalObj.assert = chai.assert

if (typeof chai.should === 'function') {
  chai.should()
}

// Prevent CodeMirror from attempting to load external mode scripts during tests
// which causes noisy 404s in Karma's web-server. Use a data URI and a no-op
// requireMode that calls the callback immediately.
try {
  globalObj.CodeMirror = globalObj.CodeMirror || {}
  if (!globalObj.CodeMirror.modeURL) {
    globalObj.CodeMirror.modeURL = 'data:text/javascript,/*%N.js*/'
  }
  if (typeof globalObj.CodeMirror.requireMode !== 'function') {
    globalObj.CodeMirror.requireMode = (name, cb) => {
      if (typeof cb === 'function') cb()
    }
  }
} catch (e) {
  // harmless if the global cannot be modified
}

// Further filter noisy console warnings and errors emitted by third-party
// modules during tests so test output focuses on failures only.
const origWarn = console.warn
console.warn = (...args) => {
  const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
  if (msg.includes('baseUrl') || msg.includes('translateBlocks2Markdown') || msg.includes('Unknown block type')) return
  if (msg.includes('Unknown directory watch type')) return
  origWarn(...args)
}
const origError = console.error
console.error = (...args) => {
  const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
  if (msg.includes('Unexpected error on image action') || msg.includes('Unknown block type')) return
  origError(...args)
}
