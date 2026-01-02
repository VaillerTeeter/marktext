import { defaultFileState, getFileStateFromData, getBlankFileState, getSingleFileState, createDocumentState, getOptionsFromState } from '../../../src/renderer/store/help'

describe('store help utilities', () => {
  it('clones defaultFileState when creating file state from data', () => {
    const data = {
      markdown: '# title',
      filename: 'doc.md',
      pathname: '/tmp/doc.md',
      encoding: { encoding: 'utf16le', isBom: true },
      lineEnding: 'crlf',
      adjustLineEndingOnSave: true,
      trimTrailingNewline: 0
    }
    const fileState = getFileStateFromData(data)
    expect(fileState.id).to.exist
    expect(fileState.filename).to.equal('doc.md')
    expect(fileState.history.stack).to.deep.equal([])
  })

  it('creates blank file state with incremented untitled name', () => {
    const tabs = [{ pathname: '', filename: 'Untitled-1' }]
    const blank = getBlankFileState(tabs, 'utf8', 'lf', null)
    expect(blank.filename).to.equal('Untitled-2')
    expect(blank.encoding.encoding).to.equal('utf8')
    expect(blank.lineEnding).to.equal('lf')
  })

  it('creates document state preserving cursor and options', () => {
    const doc = {
      markdown: 'text',
      filename: 'a.md',
      pathname: '/a.md',
      encoding: { encoding: 'utf8', isBom: false },
      lineEnding: 'lf',
      adjustLineEndingOnSave: false,
      trimTrailingNewline: 3,
      cursor: { line: 1, ch: 2 }
    }
    const state = createDocumentState(doc, 'custom')
    expect(state.id).to.equal('custom')
    expect(state.cursor).to.deep.equal({ line: 1, ch: 2 })
  })

  it('derives options from state and single file state builder', () => {
    const opts = getOptionsFromState(defaultFileState)
    expect(opts).to.have.keys(['encoding', 'lineEnding', 'adjustLineEndingOnSave', 'trimTrailingNewline'])

    const single = getSingleFileState({ markdown: '', filename: 'b.md', pathname: '/b.md', options: opts })
    expect(single.filename).to.equal('b.md')
    expect(single.adjustLineEndingOnSave).to.equal(defaultFileState.adjustLineEndingOnSave)
  })
})
