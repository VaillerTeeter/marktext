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
    const prev = parent.children[parent.children.length - 1]
    if (prev) { prev.nextSibling = child; child.preSibling = prev }
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
    const prev = parent.children[idx - 1]
    const next = parent.children[idx]
    if (prev) prev.nextSibling = next
    if (next) next.preSibling = prev
    delete this.blockMap[block.key]
    delete this.parentMap[block.key]
  }
  partialRender () { this.partialRenderCalled += 1 }

  // this is the branch we want to exercise: return a replacement cursor block
  findNextBlockInLocation (block) { return this._fallbackCursor }
}

tableBlockCtrl(DummyContentState)

describe('contentState tableBlockCtrl remove column cursor fallback', () => {
  it('uses findNextBlockInLocation when removed cell equals current cell', () => {
    const cs = new DummyContentState()

    // build a table with 3 columns so removal proceeds
    const figure = cs.createBlock('figure')
    const table = cs.createBlock('table')
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const theadRow = cs.createBlock('tr')
    // create 3 th cells with content
    const ths = []
    for (let i = 0; i < 3; i++) {
      const th = cs.createBlock('th')
      const thContent = cs.createBlock('span', { functionType: 'cellContent', text: '' })
      cs.appendChild(th, thContent)
      cs.appendChild(theadRow, th)
      ths.push({ th, thContent })
    }
    cs.appendChild(thead, theadRow)
    cs.appendChild(table, thead)

    const tbody = cs.createBlock('tbody')
    const row = cs.createBlock('tr')
    const tds = []
    for (let i = 0; i < 3; i++) {
      const td = cs.createBlock('td')
      const tdContent = cs.createBlock('span', { functionType: 'cellContent', text: '' })
      cs.appendChild(td, tdContent)
      cs.appendChild(row, td)
      tds.push({ td, tdContent })
    }
    cs.appendChild(tbody, row)
    cs.appendChild(table, tbody)

    // simulate the fallback target block returned by findNextBlockInLocation
    const fallback = cs.createBlock('span', { functionType: 'cellContent', text: 'fb' })
    cs._fallbackCursor = fallback

    // call editTable to remove current column where the removed cell equals the cellBlock
    // pick column index 1 (middle column) and pass the corresponding cell content key
    const targetContentKey = tds[1].tdContent.key
    cs.editTable({ target: 'column', action: 'remove', location: 'current' }, targetContentKey)

    // cursor should have been set to fallback returned by findNextBlockInLocation
    expect(cs.cursor.start.key).to.equal(fallback.key)
  })
})
