import { expect } from 'chai'
import tableBlockCtrl from '../../../src/muya/lib/contentState/tableBlockCtrl'

class DummyContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.cursor = { start: null, end: null }
    this._id = 0
    this.muya = {
      eventCenter: { dispatch: () => { this._dispatched = true } },
      dispatchSelectionChange: () => {},
      dispatchSelectionFormats: () => {},
      dispatchChange: () => {}
    }
    this.partialRenderCalled = 0
  }

  createBlock (type, props = {}) {
    const key = `k_${++this._id}`
    const block = Object.assign({ key, type, children: [], parent: null }, props)
    this.blockMap[key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children = parent.children || []
    child.parent = parent.key
    this.parentMap[child.key] = parent
    parent.children.push(child)
    return child
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  getParent (block) {
    return this.parentMap[block.key]
  }

  firstInDescendant (block) {
    if (!block.children || !block.children.length) return block
    let cur = block
    while (cur.children && cur.children.length) {
      cur = cur.children[0]
    }
    return cur
  }

  closest (block, type) {
    let cur = block
    while (cur) {
      if (cur.type === type) return cur
      cur = this.getParent(cur)
    }
  }

  insertAfter (newBlock, anchor) {
    const parent = this.getParent(anchor)
    const idx = parent.children.indexOf(anchor)
    parent.children.splice(idx + 1, 0, newBlock)
    newBlock.parent = parent.key
    this.parentMap[newBlock.key] = parent
  }

  removeBlock (block) {
    const parent = this.getParent(block)
    if (!parent) return
    const idx = parent.children.indexOf(block)
    if (idx !== -1) parent.children.splice(idx, 1)
    delete this.blockMap[block.key]
    delete this.parentMap[block.key]
  }

  partialRender () {
    this.partialRenderCalled += 1
  }
}

tableBlockCtrl(DummyContentState)

describe('contentState tableBlockCtrl initTable edge', () => {
  it('initTable handles escaped pipes in header cells', () => {
    const cs = new DummyContentState()
    const p = cs.createBlock('p')
    // header contains an escaped pipe so token should include a literal '|'
    const span = cs.createBlock('span', { text: '|a\\|b|c|' })
    cs.appendChild(p, span)

    const firstCell = cs.initTable(p)

    // paragraph transformed to figure/table
    expect(p.type).to.equal('figure')
    const table = p.children[0]
    const headerRow = table.children[0].children[0]
    const firstHeaderContent = headerRow.children[0].children[0]
    // the parsed header token should preserve the escaped pipe
    expect(firstHeaderContent.text).to.include('|')
    // returned value should be a descendant inside tbody
    const tbody = table.children[1]
    expect(firstCell).to.equal(cs.firstInDescendant(tbody))
  })
})
