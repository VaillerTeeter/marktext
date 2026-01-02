/* global sinon */
import { expect } from 'chai'
import enterCtrl from '../../../src/muya/lib/contentState/enterCtrl'
import selection from '../../../src/muya/lib/selection'

const createSpy = (impl = () => {}) => {
  const spy = (...args) => {
    spy.called = true
    spy.callCount += 1
    spy.calls.push(args)
    return impl(...args)
  }
  spy.called = false
  spy.callCount = 0
  spy.calls = []
  Object.defineProperty(spy, 'calledOnce', { get: () => spy.callCount === 1 })
  spy.calledWith = (...expected) => spy.calls.some(args => args.length === expected.length && args.every((val, idx) => val === expected[idx]))
  return spy
}

class MiniContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.blocks = []
    this.cursor = { start: null, end: null }
    this.muya = { options: {}, container: document.createElement('div'), eventCenter: { dispatch: createSpy() } }
    this.tabSize = 2
  }

  createBlock (type, props = {}) {
    const key = props.key || `${type}-${Math.random().toString(36).slice(2, 6)}`
    const block = Object.assign({ key, type, children: [] }, props)
    this.blockMap[key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children.push(child)
    child.parent = parent.key
    this.parentMap[child.key] = parent
  }

  prependChild (parent, child) {
    parent.children.unshift(child)
    child.parent = parent.key
    this.parentMap[child.key] = parent
  }

  createBlockP (text = '') {
    const p = this.createBlock('p')
    const span = this.createBlock('span', { type: 'span', text, functionType: 'paragraphContent' })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }

  createBlockLi (paragraphInListItem) {
    const li = this.createBlock('li')
    if (!paragraphInListItem) paragraphInListItem = this.createBlockP()
    this.appendChild(li, paragraphInListItem)
    return li
  }

  createTaskItemBlock (paragraphInListItem, checked = false) {
    const li = this.createBlock('li')
    const input = this.createBlock('input')
    li.listItemType = 'task'
    input.checked = checked
    if (!paragraphInListItem) paragraphInListItem = this.createBlockP()
    this.appendChild(li, input)
    this.appendChild(li, paragraphInListItem)
    return li
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  getParent (block) {
    return this.parentMap[block.key]
  }

  firstInDescendant (block) {
    return block.children[0]
  }

  isOnlyChild (block) {
    const parent = this.getParent(block)
    return parent && parent.children.length === 1
  }

  isFirstChild (block) {
    const parent = this.getParent(block)
    if (!parent) return false
    return parent.children[0] && parent.children[0].key === block.key
  }

  isLastChild (block) {
    const parent = this.getParent(block)
    if (!parent) return false
    const len = parent.children.length
    return parent.children[len - 1] && parent.children[len - 1].key === block.key
  }

  findIndex (children, block) {
    return children.findIndex(c => c.key === block.key)
  }

  closest (block, type) {
    let parent = this.getParent(block)
    while (parent) {
      if (parent.type === type) return parent
      parent = this.getParent(parent)
    }
    return null
  }

  isCollapse () {
    const range = selection.getCursorRange && selection.getCursorRange()
    if (!range) return true
    const { start, end } = range
    if (!start || !end) return true
    return start.key === end.key && start.offset === end.offset
  }

  insertAfter (block, reference) {
    const idx = this.blocks.indexOf(reference)
    this.blocks.splice(idx + 1, 0, block)
  }

  insertBefore (block, reference) {
    const idx = this.blocks.indexOf(reference)
    this.blocks.splice(idx, 0, block)
  }

  removeBlock (block, children) {
    // remove from blocks array if present
    const idx = this.blocks.indexOf(block)
    if (idx > -1) this.blocks.splice(idx, 1)
    // also remove from parent children if applicable
    const parent = this.getParent(block)
    if (parent) {
      const ci = parent.children.findIndex(c => c.key === block.key)
      if (ci > -1) parent.children.splice(ci, 1)
    }
  }

  chopBlockByCursor (block, key, offset) {
    // simple split: return a new paragraph with remainder
    const newBlock = this.createBlock('p')
    const activeLine = this.getBlock(key)
    const text = activeLine ? activeLine.text : ''
    if (offset < text.length) {
      activeLine.text = text.substring(0, offset)
      const newLine = this.createBlock('span', { text: text.substring(offset), functionType: 'paragraphContent' })
      this.appendChild(newBlock, newLine)
    }
    return newBlock
  }

  codeBlockUpdate () { return false }
  tableBlockUpdate () { return false }
  updateHtmlBlock () { return false }
  updateMathBlock () { return false }
  checkInlineUpdate () { return false }
  partialRender () { return 'partial' }
  render () { return 'render' }
}

enterCtrl(MiniContentState)

describe('contentState enterCtrl', () => {
  afterEach(() => { document.body.innerHTML = ''; selection.getCursorRange = () => ({ start: null, end: null }); selection.getSelectionStart = () => null })

  it('inserts soft line break on Shift+Enter inside paragraphContent', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('hello')
    const start = { key: p.children[0].key, offset: 3 }
    selection.getCursorRange = () => ({ start, end: start })

    const ev = { shiftKey: true, preventDefault: () => {}, stopPropagation: () => {} }
    const res = cs.enterHandler(ev)
    expect(res).to.equal('partial')
    expect(p.children[0].text).to.include('\n')
    expect(cs.cursor.start.offset).to.equal(4) // inserted one char (\n)
  })

  it('inserts auto-indent inside code block when applicable', () => {
    const cs = new MiniContentState()
    const pre = cs.createBlock('pre')
    const span = cs.createBlock('span', { type: 'span', text: '{}', functionType: 'codeContent' })
    cs.appendChild(pre, span)
    cs.blocks.push(pre)
    // place cursor between the pair to trigger autoIndent
    const start = { key: span.key, offset: 1 }
    selection.getCursorRange = () => ({ start, end: start })

    const ev = { shiftKey: false, preventDefault: () => {}, stopPropagation: () => {} }
    const res = cs.enterHandler(ev)
    expect(res).to.equal('partial')
    expect(span.text).to.include('\n')
    // offset should advance by at least 1 + indent; here tabSize = 2
    expect(cs.cursor.start.offset).to.be.at.least(1 + cs.tabSize)
  })

  it('handles Enter on empty paragraph inside list (enterInEmptyParagraph)', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('')
    const ul = cs.createBlock('ul')
    cs.appendChild(ul, p)
    cs.blocks.push(ul)
    const start = { key: p.children[0].key, offset: 0 }
    selection.getCursorRange = () => ({ start, end: start })

    const ev = { preventDefault: () => {}, stopPropagation: () => {} }
    const res = cs.enterHandler(ev)
    expect(res).to.equal('partial')
    // after entering, cursor should be set to new block (start key exists)
    expect(cs.cursor.start).to.exist
  })

  it('merges multiple selected blocks on Enter', () => {
    const cs = new MiniContentState()
    const p1 = cs.createBlockP('one')
    const p2 = cs.createBlockP('two')
    const start = { key: p1.children[0].key, offset: 1 }
    const end = { key: p2.children[0].key, offset: 1 }
    // make selection return a ranged selection once, then collapse to avoid recursion
    let calls = 0
    selection.getCursorRange = () => {
      calls += 1
      if (calls === 1) return { start, end }
      return { start: null, end: null }
    }
    // implement minimal removeBlocks used by enterHandler
    cs.removeBlocks = function (startSpan, endSpan) {
      const startParent = this.getParent(startSpan)
      const endParent = this.getParent(endSpan)
      const si = this.blocks.indexOf(startParent)
      const ei = this.blocks.indexOf(endParent)
      if (si > -1 && ei > -1 && ei >= si) {
        this.blocks.splice(si + 1, ei - si)
      }
    }

    const ev = { preventDefault: () => {}, stopPropagation: () => {} }
    const res = cs.enterHandler(ev)
    // enterHandler may recurse and return undefined; assert side-effects
    expect(cs.cursor.start.key).to.equal(start.key)
    // ensure the second paragraph was removed (merged)
    expect(cs.blocks.indexOf(p2)).to.equal(-1)
  })

  it('removes selection inside same block on Enter then proceeds', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('abcdef')
    const start = { key: p.children[0].key, offset: 1 }
    const end = { key: p.children[0].key, offset: 4 }
    // return a selection that first reports a range (removal), then returns
    // null to short-circuit the recursive enterHandler call
    let calls2 = 0
    selection.getCursorRange = () => {
      calls2 += 1
      if (calls2 === 1) return { start, end }
      return { start: null, end: null }
    }

    const ev = { preventDefault: () => {}, stopPropagation: () => {} }
    const res = cs.enterHandler(ev)
    // assert side-effects (return value may be undefined due to short-circuit)
    expect(cs.cursor.start.offset).to.equal(start.offset)
  })

  it('splits paragraph in middle (chopBlockByCursor path)', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('hello world')
    const start = { key: p.children[0].key, offset: 5 }
    selection.getCursorRange = () => ({ start, end: start })
    // stub chopHtmlByCursor to avoid using DOM Selection APIs
    selection.chopHtmlByCursor = (paragraph) => {
      const span = cs.getBlock(start.key)
      const text = span && span.text ? span.text : ''
      return { pre: text.substring(0, start.offset), post: text.substring(start.offset) }
    }

    const ev = { preventDefault: () => {}, stopPropagation: () => {} }
    const res = cs.enterHandler(ev)
    // enterHandler may not return a value when short-circuited; verify effects
    // ensure a new block was inserted after original
    const idx = cs.blocks.indexOf(p)
    expect(idx).to.be.at.least(0)
    const next = cs.blocks[idx + 1]
    expect(next).to.exist
    // cursor should be at start of new block
    expect(cs.cursor.start.key).to.equal(next.children[0].key)
  })
})
