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

describe('contentState tableBlockCtrl deep', () => {
  it('initTable converts paragraph into figure/table and returns tbody first cell', () => {
    const cs = new DummyContentState()
    // paragraph with a span child containing table header syntax
    const p = cs.createBlock('p')
    const span = cs.createBlock('span', { text: '|a|b|' })
    cs.appendChild(p, span)

    const firstCell = cs.initTable(p)

    // paragraph transformed to figure
    expect(p.type).to.equal('figure')
    expect(p.functionType).to.equal('table')
    // figure should have one child (the table)
    expect(p.children.length).to.equal(1)
    const table = p.children[0]
    expect(table.type).to.equal('table')
    // tbody should exist as second child of table
    expect(table.children.length).to.be.at.least(2)
    const tbody = table.children[1]
    // returned first cell content should be a descendant inside tbody
    expect(firstCell).to.equal(cs.firstInDescendant(tbody))
  })

  it('tableToolBarClick delete turns figure into paragraph and resets cursor', () => {
    const cs = new DummyContentState()
    // build a small table inside a figure
    const figure = cs.createBlock('figure')
    const table = cs.createTableInFigure({ rows: 2, columns: 2 })
    cs.appendChild(figure, table)
    // attach figure into blockMap but not in a higher parent
    cs.blockMap[figure.key] = figure

    // simulate cursor on a cell content
    const th = table.children[0].children[0]
    const cellContent = th.children[0]
    // ensure functionType is cellContent
    cellContent.functionType = 'cellContent'
    cs.cursor = { start: { key: cellContent.key }, end: { key: cellContent.key } }

    // hook eventCenter dispatch and partialRender
    let dispatched = false
    cs.muya.eventCenter.dispatch = (name) => { if (name === 'stateChange') dispatched = true }

    cs.tableToolBarClick('delete')

    // figure should be converted to paragraph (p) with one span child
    expect(figure.type).to.equal('p')
    expect(figure.children.length).to.equal(1)
    const newSpan = figure.children[0]
    expect(newSpan.type).to.equal('span')
    // cursor should be reset to new span
    expect(cs.cursor.start.key).to.equal(newSpan.key)
    expect(dispatched).to.equal(true)
    expect(cs.partialRenderCalled).to.be.at.least(1)
  })
})
