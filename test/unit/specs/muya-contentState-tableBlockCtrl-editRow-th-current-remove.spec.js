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

  getBlock (key) { return this.blockMap[key] }
  getParent (block) { return this.parentMap[block.key] }
  firstInDescendant (block) {
    if (!block.children || !block.children.length) return block
    let cur = block
    while (cur.children && cur.children.length) cur = cur.children[0]
    return cur
  }
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
}

tableBlockCtrl(DummyContentState)

describe('contentState tableBlockCtrl edit row th-current remove', () => {
  it('removes current header row and swaps first tbody row into thead', () => {
    const cs = new DummyContentState()
    // build table: thead with one head row, tbody with at least 2 rows
    const figure = cs.createBlock('figure')
    const table = cs.createBlock('table')
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const headRow = cs.createBlock('tr')
    const th = cs.createBlock('th')
    const thContent = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th, thContent)
    cs.appendChild(headRow, th)
    cs.appendChild(thead, headRow)
    cs.appendChild(table, thead)

    const tbody = cs.createBlock('tbody')
    // first body row
    const b1 = cs.createBlock('tr')
    const b1c = cs.createBlock('td')
    const b1cContent = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(b1c, b1cContent)
    cs.appendChild(b1, b1c)
    // second body row
    const b2 = cs.createBlock('tr')
    const b2c = cs.createBlock('td')
    const b2cContent = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(b2c, b2cContent)
    cs.appendChild(b2, b2c)

    cs.appendChild(tbody, b1)
    cs.appendChild(tbody, b2)
    cs.appendChild(table, tbody)

    // cursor on header cell content
    cs.cursor = { start: { key: thContent.key }, end: { key: thContent.key } }

    // call editTable to remove current row (header)
    cs.editTable({ location: 'current', action: 'remove', target: 'row' }, null)

    // after operation, thead should contain the former first tbody row (b1) converted to th
    expect(thead.children.length).to.be.at.least(1)
    const newHeadRow = thead.children[0]
    expect(newHeadRow.type).to.equal('tr')
    expect(newHeadRow.children[0].type).to.equal('th')

    // tbody should have one less row
    expect(tbody.children.length).to.equal(1)

    // cursor should be moved into the new head row's corresponding cell content
    const cursorBlock = cs.firstInDescendant(newHeadRow)
    expect(cs.cursor.start.key).to.equal(cursorBlock.key)
  })
})
