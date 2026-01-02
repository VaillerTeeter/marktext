import {
  isOsx,
  isWindows,
  isLinux,
  editorWinOptions,
  preferencesWinOptions,
  PANDOC_EXTENSIONS,
  BLACK_LIST,
  EXTENSION_HASN,
  TITLE_BAR_HEIGHT,
  LINE_ENDING_REG,
  URL_REG
} from '../../../src/main/config'

describe('main config', () => {
  it('detects platform flags', () => {
    expect([isOsx, isWindows, isLinux].filter(Boolean).length).to.equal(1)
  })

  it('exposes window defaults', () => {
    expect(editorWinOptions.webPreferences.spellcheck).to.equal(true)
    expect(preferencesWinOptions.webPreferences.spellcheck).to.equal(true)
    expect(preferencesWinOptions.thickFrame).to.equal(!isOsx)
  })

  it('provides constants for integrations', () => {
    expect(PANDOC_EXTENSIONS).to.include('html')
    expect(BLACK_LIST).to.include('$RECYCLE.BIN')
    expect(EXTENSION_HASN.pdf).to.equal('.pdf')
    expect(TITLE_BAR_HEIGHT).to.be.a('number')
  })

  it('exposes reusable regexes', () => {
    expect(LINE_ENDING_REG.test('a\n')).to.equal(true)
    expect(URL_REG.test('https://example.com')).to.equal(true)
  })
})
