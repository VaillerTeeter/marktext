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

class DummyContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.blocks = []
    this.cursor = { start: null, end: null }
    this.muya = {
      eventCenter: { dispatch: createSpy() },
      dispatchChange: createSpy(),
      dispatchSelectionChange: () => {},
      dispatchSelectionFormats: () => {},
      options: {}
    }
    this.partialRender = createSpy()
    this.singleRender = createSpy()
    this.render = createSpy()
  }

  createBlock (type, props = {}) {
    const key = props.key || `${type}-${Math.random().toString(36).slice(2, 6)}`
    const block = { key, type, children: [], ...props }
    this.blockMap[key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children.push(child)
    child.parent = parent.key
    this.parentMap[child.key] = parent
  }

  createBlockP (text = '') {
    const p = this.createBlock('p', { text })
    const span = this.createBlock('span', { type: 'span', text, functionType: 'paragraphContent' })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }

  getBlock (key) { return this.blockMap[key] }
  getParent (block) { return this.parentMap[block.key] || { type: '' } }
  findOutMostBlock (block) { let cur = block; while (this.parentMap[cur.key]) cur = this.parentMap[cur.key]; return cur }
  isSelectAll () { return false }
  deleteImage () { this.deleteImageCalled = true }
  deleteSelectedTableCells () { this.deleteTableCalled = true }
  init () { this.initCalled = true }
}

backspaceCtrl(DummyContentState)

describe('backspaceCtrl targeted cases', () => {
  let origGetCursorRange

  before(() => {
    origGetCursorRange = selection.getCursorRange
  })

  after(() => {
    selection.getCursorRange = origGetCursorRange
  })

  it('backspaceHandler deletes selectedImage when present', () => {
    const cs = new DummyContentState()
    cs.deleteImage = createSpy()
    cs.selectedImage = { key: 'img' }
    selection.getCursorRange = () => ({ start: { key: 'k', offset: 0 }, end: { key: 'k', offset: 0 } })
    const event = { preventDefault: createSpy(), stopPropagation: createSpy() }
    cs.backspaceHandler(event)
    expect(cs.deleteImage.called).to.equal(true)
    expect(event.preventDefault.called).to.equal(true)
  })

  it('backspaceHandler handles selectAll by resetting to single paragraph', () => {
    const cs = new DummyContentState()
    cs.isSelectAll = () => true
    selection.getCursorRange = () => ({ start: { key: 'k', offset: 0 }, end: { key: 'k', offset: 0 } })
    const event = { preventDefault: createSpy() }
    cs.backspaceHandler(event)
    expect(cs.blocks.length).to.equal(1)
    expect(cs.muya.dispatchChange.called).to.equal(true)
  })

  it('backspaceHandler handles codeContent trailing newline by singleRender', () => {
    const cs = new DummyContentState()
    const code = cs.createBlock('span', { type: 'span', text: '\n', functionType: 'codeContent' })
    cs.blockMap[code.key] = code
    cs.cursor = { start: { key: code.key, offset: 1 }, end: { key: code.key, offset: 1 } }
    selection.getCursorRange = () => ({ start: { key: code.key, offset: 1 }, end: { key: code.key, offset: 1 } })
    const event = { preventDefault: createSpy(), stopPropagation: createSpy() }
    cs.backspaceHandler(event)
    expect(cs.singleRender.called).to.equal(true)
  })
})
