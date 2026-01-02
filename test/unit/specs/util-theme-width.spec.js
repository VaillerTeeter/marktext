import { setEditorWidth } from '../../../src/renderer/util/theme'

describe('util theme width', () => {
  afterEach(() => {
    const style = document.querySelector('#editor-width')
    if (style) {
      style.remove()
    }
  })

  it('writes css variable when value matches pattern', () => {
    setEditorWidth('120ch')
    const sheet = document.querySelector('#editor-width')
    expect(sheet.innerHTML).to.include('--editorAreaWidth')
  })

  it('clears style when invalid value provided', () => {
    setEditorWidth('bad')
    const sheet = document.querySelector('#editor-width')
    expect(sheet.innerHTML).to.equal('')
  })
})
