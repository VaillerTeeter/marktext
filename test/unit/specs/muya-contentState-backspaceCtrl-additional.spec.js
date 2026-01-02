import { expect } from 'chai'
import backspaceCtrl from '../../../src/muya/lib/contentState/backspaceCtrl'
import selection from '../../../src/muya/lib/selection'

const createSpy = () => {
  const fn = (...args) => {
    fn.called = true
    fn.callCount += 1
    fn.args = args
  }
  fn.called = false
  fn.callCount = 0
  return fn
}

const createMuya = () => ({
  options: {},
  dispatchSelectionChange: createSpy(),
  dispatchSelectionFormats: createSpy(),
  dispatchChange: createSpy()
})

class DummyContentState {
  constructor () {
    this.muya = createMuya()
    this.blocks = []
    this.blockMap = {}
    this.cursor = { start: null, end: null }
    this.init = createSpy()
    this.render = createSpy()
    this.partialRender = createSpy()
    this.singleRender = createSpy()
  }

  createBlockP (text = '') {
    const p = { key: `p-${Math.random().toString(36).slice(2,8)}`, type: 'p', children: [] }
    const span = { key: `s-${Math.random().toString(36).slice(2,8)}`, type: 'span', functionType: 'paragraphContent', text }
    p.children.push(span)
    this.blockMap[p.key] = p
    this.blockMap[span.key] = span
    return p
  }

  insertBefore (block, target) {
    this.blocks.splice(this.blocks.indexOf(target), 0, block)
  }

  removeBlock (block) {
    const idx = this.blocks.indexOf(block)
    if (idx !== -1) this.blocks.splice(idx, 1)
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  // minimal helpers used by backspaceCtrl in tests
  closest () { return null }
}

backspaceCtrl(DummyContentState)

describe('contentState backspaceCtrl additional', () => {
  let originalGetCursorRange

  beforeEach(() => {
    originalGetCursorRange = selection.getCursorRange
  })

  afterEach(() => {
    selection.getCursorRange = originalGetCursorRange
    document.body.innerHTML = ''
  })

  it('docBackspaceHandler deletes selectedImage when present', () => {
    const cs = new DummyContentState()
    const event = { preventDefault: createSpy() }
    cs.selectedImage = { id: 'img1' }
    cs.deleteImage = createSpy()

    cs.docBackspaceHandler(event)

    expect(event.preventDefault.callCount).to.equal(1)
    expect(cs.deleteImage.callCount).to.equal(1)
  })

  it('backspaceHandler handles select-all by resetting document', () => {
    const cs = new DummyContentState()
    const event = { preventDefault: createSpy() }
    selection.getCursorRange = () => ({ start: { key: 'a', offset: 0 }, end: { key: 'a', offset: 1 } })
    cs.isSelectAll = () => true

    cs.backspaceHandler(event)

    expect(event.preventDefault.callCount).to.equal(1)
    expect(cs.blocks.length).to.equal(1)
    expect(cs.muya.dispatchChange.callCount).to.equal(1)
  })
})
