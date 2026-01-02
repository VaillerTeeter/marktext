import path from 'path'

const electronId = require.resolve('electron')
const originalElectron = require.cache[electronId]

const buildElectronStub = () => {
  return {
    ipcRenderer: {
      sent: [],
      send (channel, payload) { this.sent.push({ channel, payload }) }
    }
  }
}

describe('renderer bootstrap', () => {
  let electronStub
  let logStub

  beforeEach(() => {
    electronStub = buildElectronStub()
    require.cache[electronId] = { exports: electronStub }
    logStub = {
      transports: {
        console: {},
        file: { resolvePath: () => path.join('/tmp/user/logs', `editor-5.log`), level: 'debug' },
        mainConsole: {}
      },
      error: () => {}
    }
    const logId = require.resolve('electron-log/renderer')
    require.cache[logId] = { exports: logStub }
    delete global.marktext
    global.window.history.replaceState({}, '', 'index.html?wid=5&type=editor&udp=/tmp/user&theme=dark&cfs=16px&cff=monospace&debug=1&hsb=1&tbs=custom')
  })

  afterEach(() => {
    if (originalElectron) {
      require.cache[electronId] = originalElectron
    } else {
      delete require.cache[electronId]
    }
  })

  it('bootstraps renderer environment and configures logger', () => {
    const bootstrapRenderer = require('../../../src/renderer/bootstrap').default
    bootstrapRenderer()
    logStub.error('boom')

    expect(global.marktext.env.windowId).to.equal(5)
    expect(global.marktext.env.type).to.equal('editor')
    expect(global.marktext.initialState.theme).to.equal('dark')
    expect(logStub.transports.file.resolvePath()).to.equal(path.join('/tmp/user/logs', `editor-5.log`))
    expect(logStub.transports.file.level).to.equal('debug')
  })
})
