const nativeKeymapId = require.resolve('native-keymap')
const electronId = require.resolve('electron')
const fsPromisesId = require.resolve('fs/promises')
const logId = require.resolve('electron-log/main')

const originalNative = require.cache[nativeKeymapId]
const originalElectron = require.cache[electronId]
const originalFsPromises = require.cache[fsPromisesId]
const originalLog = require.cache[logId]

describe('main keyboard index', () => {
  let nativeStub
  let ipcStub
  let fsStub

  beforeEach(() => {
    delete require.cache[require.resolve('../../../src/main/keyboard')]
    nativeStub = {
      layout: { lang: 'en' },
      keymap: { A: 'a' },
      getCurrentKeyboardLayout: () => nativeStub.layout,
      getKeyMap: () => nativeStub.keymap,
      onDidChangeKeyboardLayout: cb => { nativeStub._listener = cb }
    }
    ipcStub = {
      handlers: {},
      listeners: {},
      handle (channel, fn) { this.handlers[channel] = fn },
      on (channel, fn) { this.listeners[channel] = fn }
    }
    fsStub = {
      writeFile: async (p, data) => { fsStub.last = { p, data } }
    }
    require.cache[nativeKeymapId] = { exports: nativeStub }
    require.cache[electronId] = { exports: { ipcMain: ipcStub, shell: { openPath: () => {} } } }
    require.cache[fsPromisesId] = { exports: fsStub }
    require.cache[logId] = { exports: { error: () => {} } }
  })

  afterEach(() => {
    delete require.cache[require.resolve('../../../src/main/keyboard')]
    for (const [id, original] of [[nativeKeymapId, originalNative], [electronId, originalElectron], [fsPromisesId, originalFsPromises], [logId, originalLog]]) {
      if (original) {
        require.cache[id] = original
      } else {
        delete require.cache[id]
      }
    }
  })

  it('registers keyboard listeners and exposes keyboard info', async () => {
    const keyboard = require('../../../src/main/keyboard')
    keyboard.registerKeyboardListeners()

    const info = await ipcStub.handlers['mt::keybinding-get-keyboard-info']()
    expect(info.layout.lang).to.equal('en')

    await ipcStub.listeners['mt::keybinding-debug-dump-keyboard-info']()
    expect(fsStub.last.p).to.include('marktext_keyboard_info.json')
  })

  it('logs when keyboard dump fails', async () => {
    fsStub.writeFile = async () => { throw new Error('boom') }
    const errors = []
    require.cache[logId] = { exports: { error: (...args) => errors.push(args) } }

    const keyboard = require('../../../src/main/keyboard')
    keyboard.registerKeyboardListeners()

    await ipcStub.listeners['mt::keybinding-debug-dump-keyboard-info']()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(errors.length).to.equal(1)
  })

  it('emits layout changes through monitor listeners', async () => {
    const keyboard = require('../../../src/main/keyboard')
    const events = []
    const cb = info => events.push(info)

    keyboard.keyboardLayoutMonitor.addListener(cb)
    nativeStub.layout = { lang: 'fr' }
    nativeStub.keymap = { B: 'b' }

    nativeStub._listener()
    await new Promise(resolve => setTimeout(resolve, 200))

    expect(events[0].layout.lang).to.equal('fr')
    keyboard.keyboardLayoutMonitor.removeListener(cb)
  })

  it('avoids duplicate native subscriptions and reuses cached info', () => {
    nativeStub.subscribeCount = 0
    nativeStub.onDidChangeKeyboardLayout = cb => { nativeStub._listener = cb; nativeStub.subscribeCount += 1 }

    const keyboard = require('../../../src/main/keyboard')
    const monitor = keyboard.keyboardLayoutMonitor
    monitor.addListener(() => {})
    monitor.addListener(() => {})

    expect(nativeStub.subscribeCount).to.equal(1)
    const first = keyboard.getKeyboardInfo()
    nativeStub.layout = { lang: 'jp' }
    const second = keyboard.getKeyboardInfo()
    expect(second).to.equal(first)
  })
})
