import { addToDictionary, removeFromDictionary, getAvailableDictionaries, getCustomDictionaryWords, setSpellCheckerEnabled, switchLanguage } from '../../../src/main/spellchecker'

describe('main spellchecker helpers', () => {
  const buildWin = (sessionOverrides = {}) => {
    const session = Object.assign({
      added: [],
      removed: [],
      enabled: true,
      spellCheckerLanguages: [],
      addWordToSpellCheckerDictionary (word) { this.added.push(word); return true },
      removeWordFromSpellCheckerDictionary (word) { this.removed.push(word); return true },
      listWordsInSpellCheckerDictionary () { return Promise.resolve(['foo', 'bar']) },
      setSpellCheckerEnabled (flag) { this.enabled = flag },
      isSpellCheckerEnabled () { return this.enabled },
      setSpellCheckerLanguages (langs) { this.spellCheckerLanguages = langs }
    }, sessionOverrides)

    return { webContents: { session } }
  }

  it('adds and removes words through session APIs', () => {
    const win = buildWin()
    expect(addToDictionary(win, 'hello')).to.equal(true)
    expect(removeFromDictionary(win, 'hello')).to.equal(true)
    expect(win.webContents.session.added).to.deep.equal(['hello'])
    expect(win.webContents.session.removed).to.deep.equal(['hello'])
  })

  it('returns available dictionaries when spellchecker is enabled', () => {
    const win = buildWin({ availableSpellCheckerLanguages: ['en-US', 'de-DE'] })
    win.webContents.session.enabled = true
    const expected = process.platform === 'darwin' ? [] : ['en-US', 'de-DE']
    expect(getAvailableDictionaries(win)).to.deep.equal(expected)
  })

  it('returns empty list if spellchecker capabilities are missing', () => {
    const win = buildWin({ isSpellCheckerEnabled: null })
    expect(getAvailableDictionaries(win)).to.deep.equal([])
  })

  it('toggles spellchecker enable flag and retrieves custom words', async () => {
    const win = buildWin()
    expect(setSpellCheckerEnabled(win, false)).to.equal(true)
    expect(win.webContents.session.enabled).to.equal(false)
    switchLanguage(win, 'fr')
    expect(win.webContents.session.spellCheckerLanguages).to.deep.equal(['fr'])
    const words = await getCustomDictionaryWords(win)
    expect(words).to.deep.equal(['foo', 'bar'])
  })

  it('warns when spellchecker missing outside test env', () => {
    const originalKarma = globalThis.__karma__
    globalThis.__karma__ = null
    const warns = []
    const originalWarn = console.warn
    console.warn = (...args) => warns.push(args)

    const win = buildWin({ isSpellCheckerEnabled: undefined })
    const result = getAvailableDictionaries(win)

    expect(result).to.deep.equal([])
    expect(warns.length).to.equal(1)

    console.warn = originalWarn
    globalThis.__karma__ = originalKarma
  })

  it('registers ipc handlers for all spellchecker actions', async () => {
    const electronId = require.resolve('electron')
    const logId = require.resolve('electron-log/main')
    const originalElectron = require.cache[electronId]
    const originalLog = require.cache[logId]
    const ipcStub = { handlers: {}, handle (channel, fn) { this.handlers[channel] = fn } }
    const win = buildWin({ availableSpellCheckerLanguages: ['en-US'] })
    const warnings = []

    require.cache[electronId] = { exports: { ipcMain: ipcStub, BrowserWindow: { fromWebContents: () => win } } }
    require.cache[logId] = { exports: { warn: msg => warnings.push(msg) } }
    delete require.cache[require.resolve('../../../src/main/spellchecker')]
    const setup = require('../../../src/main/spellchecker').default
    setup()

    await ipcStub.handlers['mt::spellchecker-remove-word']({ sender: {} }, 'bad')
    await ipcStub.handlers['mt::spellchecker-switch-language']({ sender: {} }, 'de')
    const available = await ipcStub.handlers['mt::spellchecker-get-available-dictionaries']({ sender: {} })
    const enabledResult = await ipcStub.handlers['mt::spellchecker-set-enabled']({ sender: {} }, true)
    const words = await ipcStub.handlers['mt::spellchecker-get-custom-dictionary-words']({ sender: {} })

    const expected = process.platform === 'darwin' ? [] : ['en-US']
    expect(available).to.deep.equal(expected)
    expect(enabledResult).to.equal(true)
    expect(words).to.deep.equal(['foo', 'bar'])
    expect(win.webContents.session.spellCheckerLanguages).to.deep.equal(['de'])
    expect(warnings.length).to.equal(0)

    if (originalElectron) {
      require.cache[electronId] = originalElectron
    } else {
      delete require.cache[electronId]
    }
    if (originalLog) {
      require.cache[logId] = originalLog
    } else {
      delete require.cache[logId]
    }
  })
})
