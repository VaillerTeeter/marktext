/* global __webpack_require__ */
import path from 'path'

const electronLocalShortcutId = require.resolve('@hfelix/electron-localshortcut')
const electronId = require.resolve('electron')
const fsId = require.resolve('fs')
const fsPromisesId = require.resolve('fs/promises')
const filesystemId = require.resolve('../../../src/common/filesystem')
const keybindingId = require.resolve('../../../src/common/keybinding')
const configId = require.resolve('../../../src/main/config')
const keyboardId = require.resolve('../../../src/main/keyboard')
const handlerModuleId = require.resolve('../../../src/main/keyboard/shortcutHandler')

const originals = {
  electronLocalShortcut: require.cache[electronLocalShortcutId],
  electron: require.cache[electronId],
  fs: require.cache[fsId],
  fsPromises: require.cache[fsPromisesId],
  filesystem: require.cache[filesystemId],
  keybinding: require.cache[keybindingId],
  config: require.cache[configId],
  keyboard: require.cache[keyboardId]
}

describe('main keyboard shortcutHandler', () => {
  let els
  let fsStub
  let fsPromisesStub
  let isFile2Stub
  let isEqualAcceleratorStub
  let configStub
  let keyboardStub

  const loadKeybindings = () => {
    delete __webpack_require__.c[handlerModuleId]
    return require('../../../src/main/keyboard/shortcutHandler').default
  }

  beforeEach(() => {
    els = {
      registered: [],
      register (win, accelerator, cb) { this.registered.push({ win, accelerator }); cb(win) },
      unregister: () => {},
      setKeyboardLayout: () => {}
    }
    fsStub = {
      writeFileSync: (...args) => { fsStub.lastWrite = args }
    }
    fsPromisesStub = {
      writeFile: async (p, content) => { fsPromisesStub.last = { p, content } }
    }
    isFile2Stub = () => false
    isEqualAcceleratorStub = () => false
    configStub = { isLinux: true, isOsx: false }
    keyboardStub = {
      info: { layout: 'us', keymap: {} },
      getKeyboardInfo: () => keyboardStub.info,
      keyboardLayoutMonitor: {
        addListener: cb => { keyboardStub.listener = cb }
      }
    }

    require.cache[electronLocalShortcutId] = { exports: { electronLocalshortcut: els, isValidElectronAccelerator: () => true } }
    require.cache[electronId] = { exports: { shell: { openPath: () => Promise.resolve() } } }
    require.cache[fsId] = { exports: fsStub }
    require.cache[fsPromisesId] = { exports: fsPromisesStub }
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    require.cache[keybindingId] = { exports: { isEqualAccelerator: isEqualAcceleratorStub } }
    require.cache[configId] = { exports: configStub }
    require.cache[keyboardId] = { exports: { getKeyboardInfo: keyboardStub.getKeyboardInfo, keyboardLayoutMonitor: keyboardStub.keyboardLayoutMonitor } }
    delete __webpack_require__.c[handlerModuleId]
  })

  afterEach(() => {
    for (const [id, original] of Object.entries({
      [electronLocalShortcutId]: originals.electronLocalShortcut,
      [electronId]: originals.electron,
      [fsId]: originals.fs,
      [fsPromisesId]: originals.fsPromises,
      [filesystemId]: originals.filesystem,
      [keybindingId]: originals.keybinding,
      [configId]: originals.config,
      [keyboardId]: originals.keyboard
    })) {
      if (original) {
        require.cache[id] = original
      } else {
        delete require.cache[id]
      }
    }
    global.MARKTEXT_SAFE_MODE = false
    global.MARKTEXT_DEBUG = false
    delete process.env.MARKTEXT_DEBUG_KEYBOARD
  })

  it('registers editor shortcuts and saves user keybindings', async () => {
    const Keybindings = loadKeybindings()
    const manager = {
      has: () => true,
      execute: () => {}
    }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    const win = {}
    kb.registerEditorKeyHandlers(win)
    expect(els.registered.length).to.be.greaterThan(0)

    await kb.setUserKeybindings(new Map([['file.save', 'Ctrl+S']]))
    expect(fsPromisesStub.last.content.includes('Ctrl+S')).to.equal(true)

    kb.openConfigInFileManager()
    expect(fsStub.lastWrite[0].endsWith('keybindings.json')).to.equal(true)
  })

  it('logs when opening config fails', async () => {
    require.cache[electronId].exports.shell.openPath = () => Promise.reject(new Error('fail'))
    const errors = []
    const originalError = console.error
    console.error = (...args) => errors.push(args)

    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)
    kb.openConfigInFileManager()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(errors.length).to.be.greaterThan(0)
    console.error = originalError
  })

  it('returns null accelerator for unknown command', () => {
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    expect(kb.getAccelerator('missing')).to.equal(null)
  })

  it('returns known accelerators and unregisters handlers', () => {
    els.unregister = (win, accelerator) => { els.lastUnregister = { win, accelerator } }
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    const accel = kb.getAccelerator('file.save')
    expect(accel).to.be.a('string')
    kb.unregisterAccelerator({}, accel)
    expect(els.lastUnregister.accelerator).to.equal(accel)
    expect(kb.getUserKeybindings()).to.be.instanceOf(Map)
  })

  it('throws on invalid registerAccelerator arguments', () => {
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    expect(() => kb.registerAccelerator(null, null, null)).to.throw()
  })

  it('logs missing commands in dev mode and reacts to layout changes', async () => {
    const Keybindings = loadKeybindings()
    const manager = {
      has: () => false,
      execute: () => {}
    }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: true }
    global.MARKTEXT_DEBUG = true
    process.env.MARKTEXT_DEBUG_KEYBOARD = '1'
    let logCalled = false
    let errorCalled = false
    const originalLog = console.log
    const originalError = console.error
    console.log = () => { logCalled = true }
    console.error = () => { errorCalled = true }

    const kb = new Keybindings(manager, env)
    keyboardStub.info = { layout: 'de', keymap: { A: 'a' } }
    keyboardStub.listener({ layout: keyboardStub.info.layout, keymap: keyboardStub.info.keymap })
    await new Promise(resolve => setTimeout(resolve, 10))

    kb.registerEditorKeyHandlers({})

    expect(errorCalled).to.equal(true)
    expect(logCalled).to.equal(true)
    console.log = originalLog
    console.error = originalError
  })

  it('skips missing-command logs when commands exist in dev mode', () => {
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: true }
    let errorCalled = false
    const originalError = console.error
    console.error = () => { errorCalled = true }

    const kb = new Keybindings(manager, env)
    expect(kb.keys.size).to.be.greaterThan(0)
    expect(errorCalled).to.equal(false)
    console.error = originalError
  })

  it('chooses platform specific defaults', () => {
    configStub.isLinux = false
    configStub.isOsx = true
    const KeybindingsOsx = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kbOsx = new KeybindingsOsx(manager, env)
    expect(kbOsx.keys.get('file.save')).to.equal('Command+S')

    configStub.isLinux = false
    configStub.isOsx = false
    const KeybindingsWin = loadKeybindings()
    const kbWin = new KeybindingsWin(manager, env)
    expect(kbWin.keys.get('file.save')).to.equal('Ctrl+S')
  })

  it('updates keyboard layout without debug logging', () => {
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    let logged = false
    const originalLog = console.log
    console.log = () => { logged = true }

    const kb = new Keybindings(manager, env)
    keyboardStub.info = { layout: 'fr', keymap: { A: 'q' } }
    keyboardStub.listener({ layout: keyboardStub.info.layout, keymap: keyboardStub.info.keymap })
    expect(logged).to.equal(false)
    console.log = originalLog
  })

  it('skips writing when keybindings file already exists', () => {
    isFile2Stub = () => true
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)
    kb.openConfigInFileManager()
    expect(fsStub.lastWrite).to.equal(undefined)
  })

  it('warns when user keybindings cannot be parsed', () => {
    isFile2Stub = () => true
    fsStub.readFileSync = () => '{"oops":' // force JSON parse error
    const warnings = []
    const originalLog = require.cache[require.resolve('electron-log/main')]
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    require.cache[require.resolve('electron-log/main')] = { exports: { warn: (...args) => warnings.push(args) } }
    delete __webpack_require__.c[handlerModuleId]
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)
    expect(kb.userKeybindings.size).to.equal(0)
    expect(warnings.length).to.equal(1)

    if (originalLog) {
      require.cache[require.resolve('electron-log/main')] = originalLog
    } else {
      delete require.cache[require.resolve('electron-log/main')]
    }
  })

  it('handles empty and invalid user accelerators', () => {
    isFile2Stub = () => true
    const validAccelerator = accel => accel !== 'bad'
    fsStub.readFileSync = () => JSON.stringify({ 'file.save': '', 'file.save-as': 'bad' })
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    require.cache[electronLocalShortcutId] = { exports: { electronLocalshortcut: els, isValidElectronAccelerator: validAccelerator } }
    const errors = []
    const originalError = console.error
    console.error = (...args) => errors.push(args)

    delete __webpack_require__.c[handlerModuleId]
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    expect(kb.userKeybindings.get('file.save')).to.equal('')
    expect(kb.keys.get('file.save')).to.equal('')
    expect(errors.length).to.be.greaterThan(0)
    console.error = originalError
  })

  it('ignores non-string user accelerators', () => {
    isFile2Stub = () => true
    fsStub.readFileSync = () => JSON.stringify({ 'file.save': 123 })
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    delete __webpack_require__.c[handlerModuleId]
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    expect(kb.userKeybindings.size).to.equal(0)
    expect(kb.keys.get('file.save')).to.be.a('string')
  })

  it('unsets default accelerators when user overrides them', () => {
    isFile2Stub = () => true
    isEqualAcceleratorStub = (a, b) => a.toLowerCase() === b.toLowerCase()
    fsStub.readFileSync = () => JSON.stringify({ 'file.save': 'Ctrl+Z' })
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    require.cache[keybindingId] = { exports: { isEqualAccelerator: isEqualAcceleratorStub } }
    delete __webpack_require__.c[handlerModuleId]
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    expect(kb.keys.get('edit.undo')).to.equal('')
    expect(kb.userKeybindings.get('edit.undo')).to.equal('')
    expect(kb.userKeybindings.get('file.save')).to.equal('Ctrl+Z')
  })

  it('returns false when saving user keybindings fails', async () => {
    fsPromisesStub.writeFile = async () => { throw new Error('fail') }
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    const ok = await kb.setUserKeybindings(new Map([['file.save', 'Ctrl+S']]))
    expect(ok).to.equal(false)
  })

  it('drops non-object user keybinding files', () => {
    isFile2Stub = () => true
    fsStub.readFileSync = () => JSON.stringify('hello')
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    delete __webpack_require__.c[handlerModuleId]
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    expect(kb.userKeybindings.size).to.equal(0)
  })

  it('ignores loading when in safe mode', () => {
    global.MARKTEXT_SAFE_MODE = true
    isFile2Stub = () => true
    let readCalled = false
    fsStub.readFileSync = () => { readCalled = true; return '{}' }
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)
    expect(kb.userKeybindings.size).to.equal(0)
    expect(readCalled).to.equal(false)
  })

  it('aborts when duplicate user accelerators are found', () => {
    isFile2Stub = () => true
    isEqualAcceleratorStub = (a, b) => a === b
    fsStub.readFileSync = () => JSON.stringify({ 'file.save': 'Ctrl+S', 'file.save-as': 'Ctrl+S' })
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    require.cache[keybindingId] = { exports: { isEqualAccelerator: isEqualAcceleratorStub } }
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    expect(kb.userKeybindings.size).to.equal(0)
  })

  it('returns early when user file has only unknown commands', () => {
    isFile2Stub = () => true
    fsStub.readFileSync = () => JSON.stringify({ 'unknown.command': 'Ctrl+X' })
    require.cache[filesystemId] = { exports: { isFile2: isFile2Stub } }
    delete __webpack_require__.c[handlerModuleId]
    const Keybindings = loadKeybindings()
    const manager = { has: () => true, execute: () => {} }
    const env = { paths: { userDataPath: path.join(process.cwd(), 'tmp-keybindings') }, isDevMode: false }
    const kb = new Keybindings(manager, env)

    expect(kb.userKeybindings.size).to.equal(0)
    expect(kb.keys.get('file.save')).to.be.a('string')
  })
})
