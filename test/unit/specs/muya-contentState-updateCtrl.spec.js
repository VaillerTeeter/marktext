import { expect } from 'chai'
import updateCtrl from '../../../src/muya/lib/contentState/updateCtrl'

class MiniContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.blocks = []
    this.cursor = { start: null, end: null }
    this.muya = { options: { footnote: true, bulletListMarker: '*' } }
    this.stateRender = { labels: {} }
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

  createBlockP (text = '') {
    const p = this.createBlock('p')
    const span = this.createBlock('span', { type: 'span', text, functionType: 'paragraphContent' })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }

  getBlock (key) { return this.blockMap[key] }

  getParent (block) { return this.parentMap[block.key] }

  // simple document tree helpers for tests
  getPreSibling (block) {
    const parent = this.getParent(block)
    if (!parent) {
      const i = this.blocks.indexOf(block)
      return i > 0 ? this.blocks[i - 1] : null
    }
    const idx = parent.children.indexOf(block)
    return idx > 0 ? parent.children[idx - 1] : null
  }

  getNextSibling (block) {
    const parent = this.getParent(block)
    if (!parent) {
      const i = this.blocks.indexOf(block)
      return (i >= 0 && i < this.blocks.length - 1) ? this.blocks[i + 1] : null
    }
    const idx = parent.children.indexOf(block)
    return (idx >= 0 && idx < parent.children.length - 1) ? parent.children[idx + 1] : null
  }

  insertBefore (newBlock, refBlock) {
    const parent = this.getParent(refBlock)
    if (!parent) {
      const i = this.blocks.indexOf(refBlock)
      this.blocks.splice(i, 0, newBlock)
    } else {
      const idx = parent.children.indexOf(refBlock)
      parent.children.splice(idx, 0, newBlock)
      newBlock.parent = parent.key
      this.parentMap[newBlock.key] = parent
    }
    this.blockMap[newBlock.key] = newBlock
    return newBlock
  }

  insertAfter (newBlock, refBlock) {
    const parent = this.getParent(refBlock)
    if (!parent) {
      const i = this.blocks.indexOf(refBlock)
      this.blocks.splice(i + 1, 0, newBlock)
    } else {
      const idx = parent.children.indexOf(refBlock)
      parent.children.splice(idx + 1, 0, newBlock)
      newBlock.parent = parent.key
      this.parentMap[newBlock.key] = parent
    }
    this.blockMap[newBlock.key] = newBlock
    return newBlock
  }

  removeBlock (block) {
    const parent = this.getParent(block)
    if (!parent) {
      const i = this.blocks.indexOf(block)
      if (i >= 0) this.blocks.splice(i, 1)
    } else {
      const idx = parent.children.indexOf(block)
      if (idx >= 0) parent.children.splice(idx, 1)
      delete this.parentMap[block.key]
    }
    delete this.blockMap[block.key]
  }

  isOnlyChild (parent) { return parent && parent.children && parent.children.length === 1 }
  isFirstChild (parent) { return parent && parent.children && parent.children[0] && parent.children[0].key }
  isLastChild (parent) { return parent && parent.children && parent.children[parent.children.length - 1] && parent.children[parent.children.length - 1].key }
}

updateCtrl(MiniContentState)

describe('contentState updateCtrl', () => {
  it('checkSameMarkerOrDelimiter returns true for matching list', () => {
    const cs = new MiniContentState()
    const ul = cs.createBlock('ul', { type: 'ul' })
    const li = cs.createBlock('li', { bulletMarkerOrDelimiter: '-' })
    cs.appendChild(ul, li)
    expect(cs.checkSameMarkerOrDelimiter(ul, '-')).to.equal(true)
  })

  it('checkNeedRender returns true when cursor is inside an inline token change', () => {
    const cs = new MiniContentState()
    const span = cs.createBlock('span', { type: 'span', text: '**a**', functionType: 'paragraphContent' })
    cs.blockMap[span.key] = span
    cs.cursor = { start: { key: span.key, offset: 2 }, end: { key: span.key, offset: 2 } }
    cs.stateRender.labels = {}
    expect(cs.checkNeedRender()).to.equal(true)
  })

  it('updateThematicBreak splits paragraph into hr and surrounding paragraphs', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('pre\n---\npost')
    const line = p.children[0]
    cs.cursor = { start: { key: line.key, offset: 6 }, end: { key: line.key, offset: 6 } }

    const res = cs.updateThematicBreak(p, '---', line)
    expect(res).to.be.ok
    expect(res.type).to.equal('hr')
    expect(res.children[0].functionType).to.equal('thematicBreakLine')
  })

  it('checkInlineUpdate converts bullet list paragraph into list item', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('- item')
    const span = p.children[0]
    cs.cursor = { start: { key: span.key, offset: 2 }, end: { key: span.key, offset: 2 } }

    const res = cs.checkInlineUpdate(span)
    expect(res).to.be.ok
    // the paragraph should become child of a list item
    const parent = cs.getParent(res)
    expect(parent).to.be.ok
    expect(parent.type).to.equal('li')
  })

  it('checkInlineUpdate converts ATX header into heading block', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('# hello')
    const span = p.children[0]
    cs.cursor = { start: { key: span.key, offset: 1 }, end: { key: span.key, offset: 1 } }

    const res = cs.checkInlineUpdate(span)
    expect(res).to.be.ok
    expect(res.type).to.equal('h1')
  })

  it('checkInlineUpdate converts setext heading when underline present', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('title\n---')
    const span = p.children[0]
    cs.cursor = { start: { key: span.key, offset: 1 }, end: { key: span.key, offset: 1 } }

    const res = cs.checkInlineUpdate(span)
    expect(res).to.be.ok
    expect(res.type).to.equal('h2')
  })

  it('checkInlineUpdate converts blockquote paragraph', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('> quoted')
    const span = p.children[0]
    cs.cursor = { start: { key: span.key, offset: 2 }, end: { key: span.key, offset: 2 } }

    const res = cs.checkInlineUpdate(span)
    expect(res).to.be.ok
    expect(res.type).to.equal('blockquote')
  })

  it('checkInlineUpdate converts indented code to pre/code block', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('    code line')
    const span = p.children[0]
    cs.cursor = { start: { key: span.key, offset: 4 }, end: { key: span.key, offset: 4 } }

    const res = cs.checkInlineUpdate(span)
    expect(res).to.be.ok
    expect(res.type).to.equal('pre')
    expect(res.functionType).to.equal('indentcode')
  })

  it('updateToParagraph replaces non-setext heading with paragraph', () => {
    const cs = new MiniContentState()
    const h = cs.createBlock('h1', { type: 'h1', headingStyle: 'atx' })
    const span = cs.createBlock('span', { text: 'text', functionType: 'paragraphContent' })
    cs.appendChild(h, span)
    cs.blocks.push(h)
    cs.cursor = { start: { key: span.key, offset: 1 }, end: { key: span.key, offset: 1 } }

    const res = cs.updateToParagraph(h, span)
    expect(res).to.equal(h)
  })
})
