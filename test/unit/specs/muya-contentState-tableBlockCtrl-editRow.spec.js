import { expect } from 'chai'
import tableBlockCtrl from '../../../src/muya/lib/contentState/tableBlockCtrl'

class DummyContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.cursor = { start: null, end: null }
    this._id = 0
    this.muya = { eventCenter: { dispatch: () => { this._dispatched = true } } }
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
    // set sibling links
    const prev = parent.children[parent.children.length - 1]
    if (prev) {
      prev.nextSibling = child
      child.preSibling = prev
    }
    child.parent = parent.key
    this.parentMap[child.key] = parent
    parent.children.push(child)
    return child
  }

  createRow (templateRow, useHeader) {
    const row = this.createBlock('tr')
    const cells = templateRow.children || []
    cells.forEach((cell, i) => {
      const type = useHeader ? 'th' : (cell.type || 'td')
      const cellBlock = this.createBlock(type, { column: i, align: cell.align || '' })
      const cellContent = this.createBlock('span', { functionType: 'cellContent', text: '' })
      this.appendChild(cellBlock, cellContent)
      this.appendChild(row, cellBlock)
    })
    return row
  }

  getBlock (key) { return this.blockMap[key] }
  getParent (block) { return this.parentMap[block.key] }
  firstInDescendant (block) {
    if (!block.children || !block.children.length) return block
    let cur = block
    while (cur.children && cur.children.length) cur = cur.children[0]
    return cur
  }
  getPreSibling (block) { return block.preSibling }
  getNextSibling (block) { return block.nextSibling }
  closest (block, type) {
    let cur = block
    while (cur) {
      if (cur.type === type) return cur
      cur = this.getParent(cur)
    }
  }
  insertBefore (newBlock, anchor) {
    const parent = this.getParent(anchor)
    const idx = parent.children.indexOf(anchor)
    parent.children.splice(idx, 0, newBlock)
    // update siblings
    const prev = parent.children[idx - 1]
    if (prev) { prev.nextSibling = newBlock; newBlock.preSibling = prev }
    anchor.preSibling = newBlock; newBlock.nextSibling = anchor
    newBlock.parent = parent.key
    this.parentMap[newBlock.key] = parent
  }
  insertAfter (newBlock, anchor) {
    const parent = this.getParent(anchor)
    const idx = parent.children.indexOf(anchor)
    parent.children.splice(idx + 1, 0, newBlock)
    const next = parent.children[idx + 2]
    anchor.nextSibling = newBlock; newBlock.preSibling = anchor
    if (next) { next.preSibling = newBlock; newBlock.nextSibling = next }
    newBlock.parent = parent.key
    this.parentMap[newBlock.key] = parent
  }
  removeBlock (block) {
    const parent = this.getParent(block)
    if (!parent) return
    const idx = parent.children.indexOf(block)
    if (idx !== -1) parent.children.splice(idx, 1)
    // fix sibling links
    const prev = parent.children[idx - 1]
    const next = parent.children[idx]
    if (prev) prev.nextSibling = next
    if (next) next.preSibling = prev
    delete this.blockMap[block.key]
    delete this.parentMap[block.key]
  }
  partialRender () { this.partialRenderCalled += 1 }
}

tableBlockCtrl(DummyContentState)

describe('contentState tableBlockCtrl edit row', () => {
  it('insert a new row after current row (current location)', () => {
    const cs = new DummyContentState()
    // create a figure with a table of 3 rows (1 head + 2 body)
    const figure = cs.createBlock('figure')
    const table = cs.createTableInFigure({ rows: 3, columns: 2 })
    cs.appendChild(figure, table)
    // pick a tbody cell (first body row)
    const tbody = table.children[1]
    const currentRow = tbody.children[0]
    const cellBlock = currentRow.children[0]
    const cellContent = cellBlock.children[0]
    cellContent.functionType = 'cellContent'
    cs.cursor = { start: { key: cellContent.key }, end: { key: cellContent.key } }

    const originalBodyRows = tbody.children.length

    cs.editTable({ location: 'current', action: 'insert', target: 'row' }, null)

    // tbody should have one more row
    expect(tbody.children.length).to.equal(originalBodyRows + 1)
    // cursor should be set into the new row at same column
    const newRow = tbody.children[1] // inserted after first
    const cursorBlock = cs.firstInDescendant(newRow)
    expect(cs.cursor.start.key).to.equal(cursorBlock.key)
    expect(cs.partialRenderCalled).to.be.at.least(1)
  })

  it('remove current row when td and siblings exist', () => {
    const cs = new DummyContentState()
    const figure = cs.createBlock('figure')
    const table = cs.createTableInFigure({ rows: 3, columns: 2 })
    cs.appendChild(figure, table)
    const tbody = table.children[1]
    const currentRow = tbody.children[0]
    const cellBlock = currentRow.children[0]
    const cellContent = cellBlock.children[0]
    cellContent.functionType = 'cellContent'
    // ensure there is a next sibling row so removal path triggers
    expect(tbody.children.length).to.be.at.least(2)
    cs.cursor = { start: { key: cellContent.key }, end: { key: cellContent.key } }

    const beforeRows = tbody.children.length

    cs.editTable({ location: 'current', action: 'remove', target: 'row' }, null)

    // one row removed
    expect(tbody.children.length).to.equal(beforeRows - 1)
    expect(cs.partialRenderCalled).to.be.at.least(1)
  })
})
