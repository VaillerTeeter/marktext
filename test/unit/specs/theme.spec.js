import { addThemeStyle, addCommonStyle, setEditorWidth, addElementStyle, addStyles } from '../../../src/renderer/util/theme'
import { THEME_STYLE_ID, COMMON_STYLE_ID } from '../../../src/renderer/config'

const removeElementById = id => {
  const el = document.querySelector(`#${id}`)
  if (el && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const cleanup = () => {
  removeElementById(THEME_STYLE_ID)
  removeElementById(COMMON_STYLE_ID)
  removeElementById('editor-width')
  removeElementById('mt-el-style')
  document.body.classList.remove('dark')
  const cm = document.querySelector('.CodeMirror')
  if (cm && cm.parentNode) {
    cm.parentNode.removeChild(cm)
  }
}

describe('renderer theme utilities', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  it('addStyles calls theme and common style helpers', () => {
    addStyles({ theme: 'graphite', codeFontFamily: 'JetBrains Mono', codeFontSize: 15, hideScrollbar: false })

    const themeEl = document.querySelector(`#${THEME_STYLE_ID}`)
    const commonEl = document.querySelector(`#${COMMON_STYLE_ID}`)

    expect(themeEl).to.not.equal(null)
    expect(themeEl.innerHTML.length > 0).to.equal(true)
    expect(commonEl).to.not.equal(null)
    expect(commonEl.innerHTML.includes('JetBrains Mono')).to.equal(true)
  })

  it('applies dark theme and toggles CodeMirror class', () => {
    const cm = document.createElement('div')
    cm.className = 'CodeMirror cm-s-default'
    document.body.appendChild(cm)

    addThemeStyle('one-dark')

    const styleEl = document.querySelector(`#${THEME_STYLE_ID}`)
    expect(styleEl).to.not.equal(null)
    expect(styleEl.innerHTML.includes('@media')).to.equal(true)
    expect(document.body.classList.contains('dark')).to.equal(true)
    expect(cm.classList.contains('cm-s-one-dark')).to.equal(true)
    expect(cm.classList.contains('cm-s-default')).to.equal(false)
  })

  it('clears theme style on light theme', () => {
    addThemeStyle('light')
    const styleEl = document.querySelector(`#${THEME_STYLE_ID}`)
    expect(styleEl.innerHTML).to.equal('')
    expect(document.body.classList.contains('dark')).to.equal(false)
  })

  it('sets editor width when value matches pattern', () => {
    setEditorWidth('80ch')
    const styleEl = document.querySelector('#editor-width')
    expect(styleEl.innerHTML.includes('80ch')).to.equal(true)

    setEditorWidth('invalid')
    expect(styleEl.innerHTML).to.equal('')
  })

  it('adds common style with font and scrollbar settings', () => {
    addCommonStyle({ codeFontFamily: 'Fira Code', codeFontSize: 16, hideScrollbar: true })
    const styleEl = document.querySelector(`#${COMMON_STYLE_ID}`)
    expect(styleEl.innerHTML.includes('Fira Code')).to.equal(true)
    expect(styleEl.innerHTML.includes('16px')).to.equal(true)
    expect(styleEl.innerHTML.includes('::-webkit-scrollbar')).to.equal(true)
  })

  it('inserts element-ui themed style only once', () => {
    addElementStyle()
    const first = document.querySelector('#mt-el-style')
    addElementStyle()
    const second = document.querySelector('#mt-el-style')
    expect(first).to.equal(second)
    expect(first.innerHTML.includes('var(--themeColor)')).to.equal(true)
  })
})
