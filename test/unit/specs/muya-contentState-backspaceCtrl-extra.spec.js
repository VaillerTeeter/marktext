import { expect } from 'chai'
import backspaceCtrl from '../../../src/muya/lib/contentState/backspaceCtrl'
import selection from '../../../src/muya/lib/selection'
import { CLASS_OR_ID } from '../../../src/muya/lib/config'

function createDummy () {
  class DummyContentState {
    constructor () {
      this.blockMap = {}
      this.parentMap = {}
      this.muya = { options: {}, dispatchSelectionChange: () => {}, dispatchSelectionFormats: () => {}, dispatchChange: () => {} }
    }
    createBlock (type, props = {}) {
      const key = props.key || `${type}-${Math.random().toString(36).slice(2,6)}`
      const block = Object.assign({ key, type, children: [], parent: null, text: '' }, props)
      this.blockMap[key] = block
      return block
    }
    appendChild (parent, child) {
      parent.children = parent.children || []
      const prev = parent.children[parent.children.length - 1]
      if (prev) { prev.nextSibling = child; child.preSibling = prev }
      child.parent = parent.key
      this.parentMap[child.key] = parent
      parent.children.push(child)
    }
    getBlock (key) { return this.blockMap[key] }
    getParent (block) { return this.parentMap[block.key] }
    findOutMostBlock (block) { let cur = block; while (this.getParent(cur)) cur = this.getParent(cur); return cur }
    getPreSibling (block) { return block.preSibling ? this.getBlock(block.preSibling.key || block.preSibling) : undefined }
    findPreBlockInLocation (block) { return undefined }
    isFirstChild (block) {
      const p = this.getParent(block)
      if (!p) return false
      return p.children[0] === block
    }
    isOnlyChild (block) {
      const p = this.getParent(block)
      if (!p) return false
      return p.children.length === 1
    }
    isSelectAll () { return false }
    // minimal stubs used by backspaceCtrl flows
    createBlockP () { const p = this.createBlock('p'); const span = this.createBlock('span'); this.appendChild(p, span); return p }
    init () {}
    render () {}
    partialRender () {}
  }
  return DummyContentState
}

describe('backspaceCtrl extra focused cases', () => {
  let Dummy, cs, origGetSelectionStart, origGetCaretOffsets, origGetCursorRange

  before(() => {
    Dummy = createDummy()
    backspaceCtrl(Dummy)
    origGetSelectionStart = selection.getSelectionStart
    origGetCaretOffsets = selection.getCaretOffsets
    origGetCursorRange = selection.getCursorRange
  })

  after(() => {
    selection.getSelectionStart = origGetSelectionStart
    selection.getCaretOffsets = origGetCaretOffsets
    selection.getCursorRange = origGetCursorRange
  })

  it('docBackspaceHandler deletes selected image when selectedImage present', () => {
    cs = new Dummy()
    let deleted = false
    cs.deleteImage = () => { deleted = true }
    // ensure isSelectAll exists to avoid early return in backspaceHandler
    cs.isSelectAll = () => false
    // ensure isSelectAll exists to avoid early return in backspaceHandler
    cs.isSelectAll = () => false
    const fakeEvent = { preventDefault () { this._p = true }, stopPropagation () { this._s = true } }
    cs.selectedImage = { src: 'x' }
    cs.docBackspaceHandler(fakeEvent)
    expect(deleted).to.equal(true)
  })

  it('backspaceHandler deletes inline image when caret left === 0', () => {
    cs = new Dummy()
    // DOM setup
    const editor = document.createElement('div')
    editor.id = CLASS_OR_ID.AG_EDITOR_ID
    const para = document.createElement('span')
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    para.id = 'pimg'
    editor.appendChild(para)
    document.body.appendChild(editor)

    // Block setup: p -> span (content) under block key 'pimg'
    const pBlock = cs.createBlock('p', { key: 'pimg', type: 'p' })
    const span = cs.createBlock('span', { key: 'b1', type: 'span', text: '' })
    cs.appendChild(pBlock, span)

    // inline image DOM: wrapper has class 'ag-inline-image'
    const wrapper = document.createElement('div')
    wrapper.classList.add('ag-inline-image')
    wrapper.setAttribute('data-raw', '![img](x)')
    wrapper.id = 'img1'
    const inner = document.createElement('span')
    wrapper.appendChild(inner)
    para.appendChild(wrapper)

    // selection stubs so backspaceHandler proceeds
    selection.getSelectionStart = () => inner
    selection.getCaretOffsets = () => ({ left: 0, right: 0 })
    selection.getCursorRange = () => ({ start: { key: 'b1', offset: 0 }, end: { key: 'b1', offset: 0 } })

    let deleted = false
    cs.deleteImage = () => { deleted = true }

    const fakeEvent = { preventDefault () { this._p = true }, stopPropagation () { this._s = true } }
    cs.backspaceHandler(fakeEvent)
    expect(deleted).to.equal(true)
  })
})
