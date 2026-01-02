import { expect } from 'chai'
import ContentState from '../../../src/muya/lib/contentState'

describe('contentState index glue', () => {
  it('constructs with stateRender, history and cursor', () => {
    const muya = { eventCenter: { dispatch: () => {} }, dispatchChange: () => {}, dispatchSelectionChange: () => {} }
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    expect(cs.stateRender).to.exist
    expect(cs.history).to.exist
    expect(cs.cursor).to.exist
    expect(Array.isArray(cs.blocks)).to.equal(true)
  })

  it('attaches controller methods to prototype', () => {
    const muya = { eventCenter: { dispatch: () => {} }, dispatchChange: () => {}, dispatchSelectionChange: () => {} }
    const cs = new ContentState(muya, {})
    // core API
    expect(typeof cs.createBlock).to.equal('function')
    expect(typeof cs.createBlockP).to.equal('function')
    // image controller
    expect(typeof cs.insertImage).to.equal('function')
    expect(typeof cs.deleteImage).to.equal('function')
    expect(typeof cs.updateImage).to.equal('function')
    // backspace controller
    expect(typeof cs.backspaceHandler).to.equal('function')
    expect(typeof cs.docBackspaceHandler).to.equal('function')
    // table controllers
    expect(typeof cs.tableBlockUpdate).to.equal('function')
    expect(typeof cs.initTable).to.equal('function')
    // render helpers
    expect(typeof cs.render).to.equal('function')
    expect(typeof cs.partialRender).to.equal('function')
    expect(typeof cs.singleRender).to.equal('function')
  })
})
