import { expect } from 'chai'
import arrowCtrl from '../../../src/muya/lib/contentState/arrowCtrl'
import tabCtrl from '../../../src/muya/lib/contentState/tabCtrl'
import formatCtrl from '../../../src/muya/lib/contentState/formatCtrl'
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
    this.blocks = []
    this.blockMap = {}
    this.parentMap = {}
    this.cursor = { start: null, end: null }
    this.partialRender = createSpy()
    this.singleRender = createSpy()
    this.tabSize = 2
    this.stateRender = { labels: [] }
    this.muya = { options: {}, keyboard: { hideAllFloatTools: createSpy() }, eventCenter: { dispatch: () => {} } }
  }

  createBlock (type, props = {}) {
    const block = { key: props.key || `${type}-${Math.random().toString(36).slice(2, 8)}`, type, children: [], ...props }
    this.blockMap[block.key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children.push(child)
    child.parent = parent.key
    this.parentMap[child.key] = parent
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  getParent (block) {
    return this.parentMap[block.key]
  }

  getNextSibling (block) {
    const parent = this.getParent(block)
    if (!parent) return null
    const idx = parent.children.indexOf(block)
    return parent.children[idx + 1] || null
  }

  getPreSibling (block) {
    const parent = this.getParent(block)
    if (!parent) return null
    const idx = parent.children.indexOf(block)
    return parent.children[idx - 1] || null
  }

  firstInDescendant (block) {
    if (block.children && block.children.length) return this.firstInDescendant(block.children[0])
    return block
  }

  lastInDescendant (block) {
    if (block.children && block.children.length) return this.lastInDescendant(block.children[block.children.length - 1])
    return block
  }

  closest (block, matcher) {
    let cur = block
    while (cur) {
      if (typeof matcher === 'string' && cur.type === matcher) return cur
      if (matcher instanceof RegExp && matcher.test(cur.type)) return cur
      cur = this.getParent(cur)
    }
    return null
  }

  isOnlyChild (block) {
    const parent = this.getParent(block)
    return parent && parent.children.length === 1
  }

  getLastChild (block) {
    return block.children[block.children.length - 1]
  }

  findPreBlockInLocation (block) {
    const idx = this.blocks.indexOf(block)
    return idx > 0 ? this.blocks[idx - 1] : null
  }

  findNextBlockInLocation (block) {
    const idx = this.blocks.indexOf(block)
    return idx >= 0 ? this.blocks[idx + 1] : null
  }

  insertAfter (block, target) {
    const idx = this.blocks.indexOf(target)
    this.blocks.splice(idx + 1, 0, block)
  }

  insertBefore (block, target) {
    const idx = this.blocks.indexOf(target)
    this.blocks.splice(idx, 0, block)
  }

  removeBlock (block) {
    const parent = this.getParent(block)
    if (parent) {
      parent.children = parent.children.filter(c => c !== block)
    }
    this.blocks = this.blocks.filter(b => b !== block)
  }

  isCollapse () {
    const { start, end } = this.cursor
    return start && end && start.key === end.key && start.offset === end.offset
  }

  createBlockP () {
    const span = this.createBlock('span', { type: 'span', text: '', functionType: 'paragraphContent' })
    const p = this.createBlock('p', { type: 'p', children: [] })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }
}

tabCtrl(DummyContentState)
arrowCtrl(DummyContentState)
formatCtrl(DummyContentState)

describe('contentState tabCtrl helpers', () => {
  it('findNextCell and findPreviousCell walk rows and sections', () => {
    const cs = new DummyContentState()
    const headContent = cs.createBlock('span', { functionType: 'cellContent', text: 'h' })
    const headTd = cs.createBlock('td', { nextSibling: null })
    const headRow = cs.createBlock('tr', { parent: null })
    cs.appendChild(headTd, headContent)
    cs.appendChild(headRow, headTd)

    const bodyContent = cs.createBlock('span', { functionType: 'cellContent', text: 'b' })
    const bodyTd = cs.createBlock('td', { preSibling: null })
    const bodyRow = cs.createBlock('tr', { parent: null, preSibling: headRow.key })
    cs.appendChild(bodyTd, bodyContent)
    cs.appendChild(bodyRow, bodyTd)

    const thead = cs.createBlock('thead', { children: [] })
    const tbody = cs.createBlock('tbody', { children: [], preSibling: thead.key })
    cs.appendChild(thead, headRow)
    cs.appendChild(tbody, bodyRow)
    const table = cs.createBlock('table', { children: [] })
    cs.appendChild(table, thead)
    cs.appendChild(table, tbody)

    cs.blocks = [table]
    cs.parentMap[headRow.key] = thead
    cs.parentMap[bodyRow.key] = tbody
    headTd.nextSibling = bodyTd.key
    bodyTd.preSibling = headTd.key

    expect(cs.findNextCell(headContent).key).to.equal(bodyContent.key)
    expect(cs.findPreviousCell(bodyContent).key).to.equal(headContent.key)
  })

  it('list indent and unindent helpers respond to list structure', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', text: 'item', functionType: 'paragraphContent' })
    const p = cs.createBlock('p', { children: [] })
    cs.appendChild(p, span)
    const li = cs.createBlock('li', { children: [] })
    cs.appendChild(li, p)
    const list = cs.createBlock('ul', { children: [], preSibling: null })
    cs.appendChild(list, li)
    const listParent = cs.createBlock('li', { children: [] })
    cs.appendChild(listParent, list)
    cs.parentMap[list.key] = listParent

    cs.cursor = { start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 0 } }
    expect(cs.isUnindentableListItem(span)).to.equal('REPLACEMENT')
    list.preSibling = 'prev'
    expect(cs.isUnindentableListItem(span)).to.equal('INDENT')

    const prevLi = cs.createBlock('li', { children: [] })
    cs.appendChild(list, prevLi)
    li.preSibling = prevLi
    expect(Boolean(cs.isIndentableListItem())).to.equal(true)
  })

  it('unindentListItem and indentListItem adjust structure and render', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', text: 'i', functionType: 'paragraphContent' })
    const p = cs.createBlock('p', { children: [] })
    cs.appendChild(p, span)
    const li = cs.createBlock('li', { children: [] })
    cs.appendChild(li, p)
    const list = cs.createBlock('ul', { children: [] })
    cs.appendChild(list, li)
    const outer = cs.createBlock('p', { children: [] })
    cs.blocks = [outer, list]
    cs.parentMap[list.key] = outer
    cs.cursor = { start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 0 } }

    cs.unindentListItem(span, 'REPLACEMENT')
    expect(cs.partialRender.called).to.equal(true)

    // reset for INDENT path
    const li2 = cs.createBlock('li', { children: [] })
    const p2 = cs.createBlock('p', { children: [] })
    cs.appendChild(p2, cs.createBlock('span', { type: 'span', text: 'x', functionType: 'paragraphContent' }))
    cs.appendChild(li2, p2)
    cs.appendChild(list, li2)
    li2.preSibling = li
    cs.unindentListItem(span, 'INDENT')
    expect(cs.partialRender.callCount).to.be.greaterThan(1)
  })

  it('indentListItem nests item into previous sibling list', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', text: 'i', functionType: 'paragraphContent' })
    const p = cs.createBlock('p', { children: [] })
    cs.appendChild(p, span)
    const liPrev = cs.createBlock('li', { children: [] })
    const li = cs.createBlock('li', { children: [] })
    cs.appendChild(li, p)
    const list = cs.createBlock('ul', { children: [] })
    cs.appendChild(list, liPrev)
    cs.appendChild(list, li)
    cs.blocks = [list]
    li.preSibling = liPrev
    cs.parentMap[list.key] = null
    cs.cursor = { start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 0 } }

    cs.indentListItem()
    expect(cs.partialRender.callCount).to.equal(1)
  })

  it('insertTab inserts nbsp sequence and updates cursor', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: 'abc' })
    cs.blocks = [span]
    cs.cursor = { start: { key: span.key, offset: 1 }, end: { key: span.key, offset: 1 } }
    cs.insertTab()
    expect(span.text).to.contain(String.fromCharCode(160))
    expect(cs.cursor.start.offset).to.equal(1 + cs.tabSize)
  })

  it('tabHandler auto-completes simple html tag', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', functionType: undefined, text: 'img' })
    const p = cs.createBlock('p', { type: 'p', children: [] })
    cs.appendChild(p, span)
    cs.blocks = [p]
    cs.cursor = { start: { key: span.key, offset: 3 }, end: { key: span.key, offset: 3 } }
    selection.getCursorRange = () => ({ start: { key: span.key, offset: 3 }, end: { key: span.key, offset: 3 } })
    const event = { preventDefault: () => {}, shiftKey: false }
    cs.tabHandler(event)
    expect(span.text.startsWith('<img')).to.equal(true)
    expect(cs.partialRender.callCount).to.equal(1)
  })

  it('tabHandler jumps out of inline format', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: '**ab**' })
    cs.blocks = [span]
    selection.getCursorRange = () => ({ start: { key: span.key, offset: 4 }, end: { key: span.key, offset: 4 } })
    const event = { preventDefault: () => {}, shiftKey: false, key: 'Tab' }
    cs.tabHandler(event)
    expect(cs.cursor.start.offset).to.equal(6)
    expect(cs.partialRender.callCount).to.equal(1)
  })
})

describe('contentState formatCtrl basics', () => {
  let originalRange
  beforeEach(() => {
    originalRange = selection.getCursorRange
  })
  afterEach(() => {
    selection.getCursorRange = originalRange
  })

  it('wraps selection with strong markers and clears them', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: 'ab' })
    cs.blocks = [span]
    cs.cursor = { start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 2 } }
    selection.getCursorRange = () => ({ start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 2 } })

    cs.format('strong')
    expect(span.text).to.equal('**ab**')

    // clear the added format
    selection.getCursorRange = () => ({ start: { key: span.key, offset: 0 }, end: { key: span.key, offset: span.text.length } })
    cs.format('clear')
    expect(span.text.includes('*')).to.equal(false)
  })

  it('applies image format and schedules selector', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: 'img' })
    cs.blocks = [span]
    selection.getCursorRange = () => ({ start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 3 } })
    const raf = global.requestAnimationFrame
    let rafCalled = false
    global.requestAnimationFrame = () => { rafCalled = true }

    cs.format('image')

    expect(span.text).to.equal('![img]()')
    expect(cs.partialRender.callCount).to.equal(1)
    expect(rafCalled).to.equal(true)
    global.requestAnimationFrame = raf
  })

  it('formats across multiple blocks', () => {
    const cs = new DummyContentState()
    const startSpan = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: 'start' })
    const endSpan = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: 'end' })
    cs.blocks = [startSpan, endSpan]
    selection.getCursorRange = () => ({ start: { key: startSpan.key, offset: 0 }, end: { key: endSpan.key, offset: 3 } })
    cs.format('em')
    expect(startSpan.text.startsWith('*')).to.equal(true)
    expect(endSpan.text.endsWith('*')).to.equal(true)
    expect(cs.partialRender.callCount).to.be.greaterThan(0)
  })
})
