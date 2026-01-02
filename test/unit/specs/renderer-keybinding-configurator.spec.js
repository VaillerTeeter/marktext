import { ipcRenderer } from 'electron'

const createSpy = returnValue => {
  const spy = (...args) => {
    spy.called = true
    spy.callCount += 1
    spy.calls.push(args)
    return typeof returnValue === 'function' ? returnValue(...args) : returnValue
  }
  spy.called = false
  spy.callCount = 0
  spy.calls = []
  Object.defineProperty(spy, 'calledOnce', { get: () => spy.callCount === 1 })
  spy.calledWith = (...expected) => spy.calls.some(args => args.length === expected.length && args.every((val, idx) => val === expected[idx]))
  return spy
}

const originalInvoke = ipcRenderer.invoke
const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')

const clearModuleCache = () => {
  delete require.cache[require.resolve('../../../src/renderer/prefComponents/keybindings/KeybindingConfigurator')]
  delete require.cache[require.resolve('../../../src/renderer/util/index')]
}

const setPlatform = value => {
  Object.defineProperty(process, 'platform', { value })
  clearModuleCache()
}

const restorePlatform = () => {
  if (originalPlatform && originalPlatform.value) {
    Object.defineProperty(process, 'platform', originalPlatform)
    clearModuleCache()
  }
}

const loadConfigurator = platform => {
  setPlatform(platform)
  const mod = require('../../../src/renderer/prefComponents/keybindings/KeybindingConfigurator')
  return mod.default || mod
}

describe('renderer KeybindingConfigurator', () => {
  afterEach(() => {
    ipcRenderer.invoke = originalInvoke
    restorePlatform()
  })

  it('builds UI list, filters mac-only on non-mac, and sorts by description', () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const defaults = new Map([
      ['mt.hide', 'Cmd+H'],
      ['file.save', 'Ctrl+S'],
      ['edit.copy', 'Ctrl+C']
    ])
    const cfg = new KeybindingConfigurator(defaults, new Map())
    const ids = cfg.getKeybindings().map(entry => entry.id)
    expect(ids).to.deep.equal(['edit.copy', 'file.save'])

    const KeybindingConfiguratorMac = loadConfigurator('darwin')
    const cfgMac = new KeybindingConfiguratorMac(defaults, new Map())
    const macIds = cfgMac.getKeybindings().map(entry => entry.id)
    expect(macIds).to.include('mt.hide')
  })

  it('converts to UI bindings with user overrides and description fallback', () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const defaults = new Map([
      ['custom.action', 'Ctrl+X'],
      ['file.save', 'Ctrl+S']
    ])
    const user = new Map([['custom.action', 'Alt+X']])
    const cfg = new KeybindingConfigurator(defaults, user)
    const bindings = cfg.getKeybindings()

    const custom = bindings.find(entry => entry.id === 'custom.action')
    expect(custom.accelerator).to.equal('Alt+X')
    expect(custom.type).to.equal(1)
    expect(custom.description).to.equal('custom.action')

    const fileSave = bindings.find(entry => entry.id === 'file.save')
    expect(fileSave.accelerator).to.equal('Ctrl+S')
    expect(fileSave.type).to.equal(0)
    expect(fileSave.description).to.equal('File: Save')
  })

  it('exposes default accelerators', () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const defaults = new Map([
      ['cmd.a', 'Ctrl+A']
    ])
    const cfg = new KeybindingConfigurator(defaults, new Map())
    expect(cfg.getDefaultAccelerator('cmd.a')).to.equal('Ctrl+A')
    expect(cfg.getDefaultAccelerator('missing')).to.equal(undefined)
  })

  it('rejects duplicate accelerator changes', () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const defaults = new Map([
      ['cmd.a', 'Ctrl+A'],
      ['cmd.b', 'Ctrl+B']
    ])
    const cfg = new KeybindingConfigurator(defaults, new Map())

    const result = cfg.change('cmd.b', 'Ctrl+A')
    expect(result).to.equal(false)
    const entryB = cfg.getKeybindings().find(entry => entry.id === 'cmd.b')
    expect(entryB.accelerator).to.equal('Ctrl+B')
    expect(cfg.isDirty).to.equal(false)
  })

  it('changes bindings, marks dirty, and updates types', () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const defaults = new Map([
      ['cmd.a', 'Ctrl+A']
    ])
    const cfg = new KeybindingConfigurator(defaults, new Map())

    const entry = cfg.getKeybindings()[0]
    const setUser = cfg.change('cmd.a', 'Ctrl+Alt+A')
    expect(setUser).to.equal(true)
    expect(entry.accelerator).to.equal('Ctrl+Alt+A')
    expect(entry.type).to.equal(1)
    expect(cfg.isDirty).to.equal(true)

    const missing = cfg.change('missing', 'Ctrl+Z')
    expect(missing).to.equal(false)
  })

  it('save short-circuits when clean', async () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const cfg = new KeybindingConfigurator(new Map([['cmd.a', 'Ctrl+A']]), new Map())
    const invokeSpy = createSpy(Promise.resolve(true))
    ipcRenderer.invoke = invokeSpy
    const result = await cfg.save()
    expect(result).to.equal(true)
    expect(invokeSpy.called).to.equal(false)
  })

  it('save persists user bindings and clears dirty flag on success', async () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const cfg = new KeybindingConfigurator(new Map([['cmd.a', 'Ctrl+A']]), new Map())
    cfg.change('cmd.a', 'Ctrl+Alt+A')

    const invokeSpy = createSpy(() => Promise.resolve(true))
    ipcRenderer.invoke = invokeSpy
    const result = await cfg.save()

    expect(result).to.equal(true)
    expect(invokeSpy.calledOnce).to.equal(true)
    expect(invokeSpy.calls[0][0]).to.equal('mt::keybinding-save-user-keybindings')
    const sentMap = invokeSpy.calls[0][1]
    expect(sentMap instanceof Map).to.equal(true)
    expect(sentMap.get('cmd.a')).to.equal('Ctrl+Alt+A')
    expect(cfg.isDirty).to.equal(false)
  })

  it('save returns false and keeps dirty when persistence fails', async () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const cfg = new KeybindingConfigurator(new Map([['cmd.a', 'Ctrl+A']]), new Map())
    cfg.change('cmd.a', 'Ctrl+Alt+A')

    ipcRenderer.invoke = () => Promise.resolve(false)
    const result = await cfg.save()
    expect(result).to.equal(false)
    expect(cfg.isDirty).to.equal(true)
  })

  it('unbinds, resets to default, and handles missing defaults', () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const cfg = new KeybindingConfigurator(new Map([['cmd.a', 'Ctrl+A']]), new Map())

    cfg.change('cmd.a', 'Ctrl+Alt+A')
    cfg.unbind('cmd.a')
    const entry = cfg.getKeybindings()[0]
    expect(entry.accelerator).to.equal('')
    expect(entry.type).to.equal(1)
    expect(cfg.isDirty).to.equal(true)

    const resetResult = cfg.resetToDefault('cmd.a')
    expect(resetResult).to.equal(true)
    expect(entry.accelerator).to.equal('Ctrl+A')
    expect(entry.type).to.equal(0)

    const missing = cfg.resetToDefault('missing')
    expect(missing).to.equal(false)
  })

  it('resetAll restores defaults, clears empties, and delegates to save', async () => {
    const KeybindingConfigurator = loadConfigurator('linux')
    const defaults = new Map([
      ['cmd.a', 'Ctrl+A'],
      ['cmd.empty', '']
    ])
    const cfg = new KeybindingConfigurator(defaults, new Map([['cmd.a', 'Alt+A']]))
    cfg.change('cmd.a', 'Alt+A')

    const saveSpy = createSpy(() => Promise.resolve('saved'))
    cfg.save = saveSpy
    const result = await cfg.resetAll()

    const entries = cfg.getKeybindings()
    const entryA = entries.find(entry => entry.id === 'cmd.a')
    const entryEmpty = entries.find(entry => entry.id === 'cmd.empty')
    expect(entryA.accelerator).to.equal('Ctrl+A')
    expect(entryA.type).to.equal(0)
    expect(entryEmpty.accelerator).to.equal('')
    expect(entryEmpty.type).to.equal(0)
    expect(cfg.isDirty).to.equal(true)
    expect(saveSpy.calledOnce).to.equal(true)
    expect(result).to.equal('saved')
  })
})
