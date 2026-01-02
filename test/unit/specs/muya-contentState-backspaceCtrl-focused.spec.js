import { expect } from 'chai'
import backspaceCtrl from '../../../src/muya/lib/contentState/backspaceCtrl'
import selection from '../../../src/muya/lib/selection'
import { CLASS_OR_ID } from '../../../src/muya/lib/config'

function createDummy () {
  class DummyContentState {
    constructor () {
      this.blockMap = {}
      this.parentMap = {}
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
  }
  return DummyContentState
}

describe('backspaceCtrl focused branches', () => {
  let Dummy, cs, origGetSelectionStart, origGetCaretOffsets

  before(() => {
    Dummy = createDummy()
    backspaceCtrl(Dummy)
    origGetSelectionStart = selection.getSelectionStart
    origGetCaretOffsets = selection.getCaretOffsets
  })

  after(() => {
    selection.getSelectionStart = origGetSelectionStart
    selection.getCaretOffsets = origGetCaretOffsets
  })

  it('checkBackspaceCase returns LI REPLACEMENT when only child', () => {
    cs = new Dummy()
    // DOM setup
    const editor = document.createElement('div')
    editor.id = CLASS_OR_ID.AG_EDITOR_ID
    const para = document.createElement('span')
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    para.id = 'p1'
    editor.appendChild(para)
    document.body.appendChild(editor)

    // block structure: li -> p(span)
    // create paragraph block containing the span, then li -> p
    const pBlock = cs.createBlock('p', { key: 'p1', type: 'p' })
    const span = cs.createBlock('span', { type: 'span' })
    cs.appendChild(pBlock, span)
    const li = cs.createBlock('li')
    cs.appendChild(li, pBlock)

    // make li only child of its parent (grandparent ul)
    const ul = cs.createBlock('ul')
    cs.appendChild(ul, li)

    // stub selection
    selection.getSelectionStart = () => para
    selection.getCaretOffsets = () => ({ left: 0 })

    const res = cs.checkBackspaceCase()
    expect(res).to.be.an('object')
    expect(res.type).to.equal('LI')
    expect(res.info).to.equal('REPLACEMENT')
  })

  it('checkBackspaceCase returns STOP when outmost has no preSibling and outLeft === 0', () => {
    cs = new Dummy()
    const editor = document.createElement('div')
    editor.id = CLASS_OR_ID.AG_EDITOR_ID
    const para = document.createElement('span')
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    para.id = 'p2'
    editor.appendChild(para)
    document.body.appendChild(editor)

    const span = cs.createBlock('span', { key: 'p2', type: 'span' })
    const root = cs.createBlock('root')
    cs.appendChild(root, span)

    // ensure outmost block has no preSibling
    selection.getSelectionStart = () => para
    // For outMostParagraph and paragraph both return left 0
    selection.getCaretOffsets = () => ({ left: 0 })

    const res = cs.checkBackspaceCase()
    expect(res).to.be.an('object')
    expect(res.type).to.equal('STOP')
  })

  it('checkBackspaceCase returns BLOCKQUOTE REPLACEMENT when blockquote only child', () => {
    cs = new Dummy()
    const editor = document.createElement('div')
    editor.id = CLASS_OR_ID.AG_EDITOR_ID
    const para = document.createElement('span')
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    para.id = 'p3'
    editor.appendChild(para)
    document.body.appendChild(editor)

    const span = cs.createBlock('span', { key: 'p3', type: 'span' })
    const p = cs.createBlock('p')
    cs.appendChild(p, span)
    const blockquote = cs.createBlock('blockquote')
    cs.appendChild(blockquote, p)

    selection.getSelectionStart = () => para
    selection.getCaretOffsets = () => ({ left: 0 })

    const res = cs.checkBackspaceCase()
    expect(res).to.be.an('object')
    expect(res.type).to.equal('BLOCKQUOTE')
    expect(res.info).to.equal('REPLACEMENT')
  })
})
