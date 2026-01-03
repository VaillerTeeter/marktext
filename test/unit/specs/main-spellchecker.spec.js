import { addToDictionary, removeFromDictionary, getCustomDictionaryWords, setSpellCheckerEnabled, switchLanguage, getAvailableDictionaries } from '../../../src/main/spellchecker'
const electronId = require.resolve('electron')
const logId = require.resolve('electron-log/main')

describe('main spellchecker utilities', () => {
  const createWin = () => {
    let enabled = true
    const words = new Set()
    return {
      webContents: {
        session: {
          addWordToSpellCheckerDictionary: word => { words.add(word); return true },
          removeWordFromSpellCheckerDictionary: word => { return words.delete(word) },
          listWordsInSpellCheckerDictionary: () => Array.from(words),
          setSpellCheckerEnabled: flag => { enabled = flag },
          isSpellCheckerEnabled: () => enabled,
          setSpellCheckerLanguages: langs => { enabled = true; return langs },
          availableSpellCheckerLanguages: ['en-US', 'de-DE']
        }
      }
    }
  }

  const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')

  afterEach(() => {
    if (originalPlatform && originalPlatform.value) {
      Object.defineProperty(process, 'platform', originalPlatform)
    }
    delete require.cache[require.resolve('../../../src/main/config')]
    delete require.cache[require.resolve('../../../src/main/spellchecker')]
  })

  it('adds and removes words from custom dictionary', async () => {
    const win = createWin()
    expect(addToDictionary(win, 'hello')).to.equal(true)
    expect(removeFromDictionary(win, 'hello')).to.equal(true)
    expect(await getCustomDictionaryWords(win)).to.deep.equal([])
  })

  it('enables spellchecker and sets languages', () => {
    const win = createWin()
    expect(setSpellCheckerEnabled(win, false)).to.equal(true)
    switchLanguage(win, 'fr-FR')
    expect(setSpellCheckerEnabled(win, true)).to.equal(true)
  })

  it('returns available dictionaries when supported', () => {
    const win = createWin()
    const expected = process.platform === 'darwin' ? [] : ['en-US', 'de-DE']
    expect(getAvailableDictionaries(win)).to.deep.equal(expected)

    const noDictWin = createWin()
    noDictWin.webContents.session.availableSpellCheckerLanguages = []
    expect(getAvailableDictionaries(noDictWin)).to.deep.equal([])
  })

  it('returns empty dictionaries when spell checker unavailable or on mac', () => {
    const missing = createWin()
    delete missing.webContents.session.isSpellCheckerEnabled
    expect(getAvailableDictionaries(missing)).to.deep.equal([])

    Object.defineProperty(process, 'platform', { value: 'darwin' })
    delete require.cache[require.resolve('../../../src/main/spellchecker')]
    const { getAvailableDictionaries: macDicts } = require('../../../src/main/spellchecker')
    const macWin = createWin()
    expect(macDicts(macWin)).to.deep.equal([])
  })

  it('registers ipc handlers and warns when toggling fails', async () => {
    const originalElectron = require.cache[electronId]
    const originalLog = require.cache[logId]
    const ipcStub = { handlers: {}, handle (channel, fn) { this.handlers[channel] = fn } }
    const warnings = []
    const win = {
      id: 7,
      webContents: { session: { setSpellCheckerEnabled: () => {}, isSpellCheckerEnabled: () => false } }
    }
    require.cache[electronId] = { exports: { ipcMain: ipcStub, BrowserWindow: { fromWebContents: () => win } } }
    require.cache[logId] = { exports: { warn: msg => warnings.push(msg) } }

    delete require.cache[require.resolve('../../../src/main/spellchecker')]
    const setup = require('../../../src/main/spellchecker').default
    setup()

    const result = await ipcStub.handlers['mt::spellchecker-set-enabled']({ sender: {} }, true)
    expect(result).to.equal(false)
    expect(warnings.length).to.equal(1)

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
