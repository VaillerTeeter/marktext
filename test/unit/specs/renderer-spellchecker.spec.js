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

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')
const originalInvoke = ipcRenderer.invoke

const setPlatform = value => {
  Object.defineProperty(process, 'platform', { value })
  delete require.cache[require.resolve('../../../src/renderer/util/index')]
  delete require.cache[require.resolve('../../../src/renderer/spellchecker')]
}

const restorePlatform = () => {
  if (originalPlatform && originalPlatform.value) {
    Object.defineProperty(process, 'platform', originalPlatform)
    delete require.cache[require.resolve('../../../src/renderer/util/index')]
    delete require.cache[require.resolve('../../../src/renderer/spellchecker')]
  }
}

describe('renderer spellchecker', () => {
  afterEach(() => {
    ipcRenderer.invoke = originalInvoke
    restorePlatform()
  })

  it('throws when switching without language on non-mac', async () => {
    if (process.platform === 'darwin') return
    setPlatform('linux')
    const { SpellChecker } = require('../../../src/renderer/spellchecker')
    const checker = new SpellChecker(true)
    let err
    try {
      await checker.switchLanguage('')
    } catch (e) {
      err = e
    }
    expect(err).to.be.an('error')
  })

  it('returns false when disabled spellchecker tries to switch language', async () => {
    if (process.platform === 'darwin') return
    setPlatform('linux')
    const { SpellChecker } = require('../../../src/renderer/spellchecker')
    const checker = new SpellChecker(false)
    const result = await checker.switchLanguage('en-US')
    expect(result).to.equal(false)
  })

  it('activates on mac without language using ipc invoke', async () => {
    setPlatform('darwin')
    const { SpellChecker } = require('../../../src/renderer/spellchecker')
    const checker = new SpellChecker(true)
    const invokeSpy = createSpy(() => Promise.resolve(true))
    ipcRenderer.invoke = invokeSpy
    const result = await checker.activateSpellchecker()
    expect(result).to.equal(true)
    expect(invokeSpy.calledWith('mt::spellchecker-set-enabled', true)).to.equal(true)
  })
})
