import path from 'path'
import { ipcRenderer } from 'electron'
import log from 'electron-log/renderer'
import RendererPaths from './node/paths'

let exceptionLogger = s => console.error(s)

const formatLogArg = (arg) => {
  if (arg instanceof Error) {
    return arg.stack || arg.message || String(arg)
  }
  if (typeof arg === 'string') return arg
  if (arg === null) return 'null'
  if (arg === undefined) return 'undefined'
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg)
    } catch {
      return String(arg)
    }
  }
  return String(arg)
}

const forwardRendererLogsToMain = ({ windowId, debug }) => {
  const levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'log']
  for (const level of levels) {
    const original = log[level]
    if (typeof original !== 'function') continue

    log[level] = (...args) => {
      try {
        ipcRenderer.send('mt::renderer-log', {
          windowId,
          debug: !!debug,
          level,
          args: args.map(formatLogArg)
        })
      } catch {
        // ignore IPC failures
      }

      return original.apply(log, args)
    }
  }
}

const configureLogger = () => {
  const { debug, paths, windowId } = global.marktext.env
  if (log.transports?.console) {
    log.transports.console.level = process.env.NODE_ENV === 'development' ? 'info' : false // mirror to window console
  }

  // electron-log@5 removed/changed some transports and may freeze the transports object.
  if (log.transports && Object.prototype.hasOwnProperty.call(log.transports, 'mainConsole')) {
    log.transports.mainConsole = null
  }

  if (log.transports?.file) {
    if (Object.prototype.hasOwnProperty.call(log.transports.file, 'resolvePathFn')) {
      log.transports.file.resolvePathFn = () => path.join(paths.logPath, `editor-${windowId}.log`)
    } else {
      log.transports.file.resolvePath = () => path.join(paths.logPath, `editor-${windowId}.log`)
    }

    log.transports.file.level = debug ? 'debug' : 'info'
    log.transports.file.sync = false
  }
  exceptionLogger = log.error

  // Keep the legacy behavior (per-window log files) by forwarding renderer logs to main via IPC.
  forwardRendererLogsToMain({ windowId, debug })
}

const parseUrlArgs = () => {
  const params = new URLSearchParams(window.location.search)
  const codeFontFamily = params.get('cff')
  const codeFontSize = params.get('cfs')
  const debug = params.get('debug') === '1'
  const hideScrollbar = params.get('hsb') === '1'
  const theme = params.get('theme')
  const titleBarStyle = params.get('tbs')
  const userDataPath = params.get('udp')
  const windowId = Number(params.get('wid'))
  const type = params.get('type')

  if (Number.isNaN(windowId)) {
    throw new Error('Error while parsing URL arguments: windowId!')
  }

  return {
    type,
    debug,
    userDataPath,
    windowId,
    initialState: {
      codeFontFamily,
      codeFontSize,
      hideScrollbar,
      theme,
      titleBarStyle
    }
  }
}

const bootstrapRenderer = () => {
  // Register renderer exception handler
  window.addEventListener('error', event => {
    if (event.error) {
      const { message, name, stack } = event.error
      const copy = {
        message,
        name,
        stack
      }

      exceptionLogger(event.error)

      // Pass exception to main process exception handler to show a error dialog.
      ipcRenderer.send('mt::handle-renderer-error', copy)
    } else {
      console.error(event)
    }
  })

  const {
    debug,
    initialState,
    userDataPath,
    windowId,
    type
  } = parseUrlArgs()
  const paths = new RendererPaths(userDataPath)
  const marktext = {
    initialState,
    env: {
      debug,
      paths,
      windowId,
      type
    },
    paths
  }
  global.marktext = marktext

  configureLogger()
}

export default bootstrapRenderer
