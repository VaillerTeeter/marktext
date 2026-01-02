import path from 'path'
import { PATH_SEPARATOR, DEFAULT_STYLE, railscastsThemes, oneDarkThemes, DEFAULT_EDITOR_FONT_FAMILY, DEFAULT_CODE_FONT_FAMILY, THEME_STYLE_ID, COMMON_STYLE_ID } from '../../../src/renderer/config'

describe('renderer config', () => {
  it('exposes default font configuration', () => {
    expect(DEFAULT_STYLE.codeFontFamily).to.equal(DEFAULT_CODE_FONT_FAMILY)
    expect(DEFAULT_STYLE.codeFontSize).to.equal('14px')
    expect(DEFAULT_STYLE.hideScrollbar).to.equal(false)
    expect(DEFAULT_STYLE.theme).to.equal('light')
    expect(DEFAULT_EDITOR_FONT_FAMILY.includes('Open Sans')).to.equal(true)
  })

  it('contains theme constants and ids', () => {
    expect(Array.isArray(railscastsThemes)).to.equal(true)
    expect(railscastsThemes).to.include('dark')
    expect(oneDarkThemes).to.deep.equal(['one-dark'])
    expect(THEME_STYLE_ID).to.equal('ag-theme')
    expect(COMMON_STYLE_ID).to.equal('ag-common-style')
    expect(PATH_SEPARATOR).to.equal(path.sep)
  })
})
