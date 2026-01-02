import { expect } from 'chai'
import ContentState from '../../../src/muya/lib/contentState'
import selection from '../../../src/muya/lib/selection'

describe('muya contentState paragraphCtrl (basic)', () => {
  let originalGetCursorCoords

  before(() => {
    originalGetCursorCoords = selection.getCursorCoords
    selection.getCursorCoords = () => ({ x: 1, y: 2 })
  })

  after(() => {
    selection.getCursorCoords = originalGetCursorCoords
  })

  it('selectionChange throws when start or end missing', () => {
    const cs = {}
    expect(() => ContentState.prototype.selectionChange.call(cs, { start: null, end: null })).to.throw()
  })

  it('selectionChange returns start/end blocks and affiliation', () => {
    const parent = { key: 'p1', type: 'p' }
    const blockA = { key: 'a', type: 'span' }
    const blockB = { key: 'b', type: 'span' }
    const cs = {
      muya: { options: {} },
      getBlock: key => (key === 'a' ? blockA : blockB),
      getParents: b => [parent]
    }

    const res = ContentState.prototype.selectionChange.call(cs, { start: { key: 'a' }, end: { key: 'b' } })
    expect(res).to.have.property('start')
    expect(res.start.block).to.equal(blockA)
    expect(res.end.block).to.equal(blockB)
    expect(res.affiliation).to.be.an('array')
    expect(res.cursorCoords).to.deep.equal({ x: 1, y: 2 })
  })
})
