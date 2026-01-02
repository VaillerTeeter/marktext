const { expect } = require('chai')
const _tableBlockCtrl = require('../../../src/muya/lib/contentState/tableBlockCtrl')
const tableBlockCtrl = _tableBlockCtrl && _tableBlockCtrl.default ? _tableBlockCtrl.default : _tableBlockCtrl

describe('muya contentState: tableBlockCtrl insert-row focused', function() {
  function Dummy () {
    this.blockMap = {}
    this.parentMap = {}
    this.cursor = { start: null, end: null }
    this._id = 0
    this.muya = { eventCenter: { dispatch: () => {} }, dispatchSelectionChange: () => {}, dispatchSelectionFormats: () => {}, dispatchChange: () => {} }
  }

  Dummy.prototype.createBlock = function (type, props = {}) {
    const key = `k_${++this._id}`
    const block = Object.assign({ key, type, children: [], parent: null, text: '' }, props)
    this.blockMap[key] = block
    return block
  }
  Dummy.prototype.appendChild = function (parent, child) {
    parent.children = parent.children || []
    const prev = parent.children[parent.children.length - 1]
    if (prev) { prev.nextSibling = child; child.preSibling = prev }
    child.parent = parent.key
    this.parentMap[child.key] = parent
    parent.children.push(child)
  }
  Dummy.prototype.createRow = function (templateRow, useHeader) {
    const row = this.createBlock('tr')
    const cells = templateRow.children || []
    cells.forEach((cell, i) => {
      const type = useHeader ? 'th' : (cell.type || 'td')
      const cellBlock = this.createBlock(type, { column: i, align: cell.align || '' })
      const cellContent = this.createBlock('span', { functionType: 'cellContent', text: cell.text || '' })
      this.appendChild(cellBlock, cellContent)
      this.appendChild(row, cellBlock)
    })
    return row
  }
  Dummy.prototype.getBlock = function (key) { return this.blockMap[key] }
  Dummy.prototype.getParent = function (block) { return this.parentMap[block.key] }
  Dummy.prototype.firstInDescendant = function (block) {
    if (!block.children || !block.children.length) return block
    let cur = block
    while (cur.children && cur.children.length) cur = cur.children[0]
    return cur
  }
  Dummy.prototype.closest = function (block, type) {
    let cur = block
    while (cur) {
      const p = this.getParent(cur)
      if (!p) return null
      if (p.type === type) return p
      cur = p
    }
    return null
  }
  Dummy.prototype.getPreSibling = function (block) { return block.preSibling }
  Dummy.prototype.getNextSibling = function (block) { return block.nextSibling }
  Dummy.prototype.insertBefore = function (newBlock, anchor) {
    const parent = this.getParent(anchor)
    const idx = parent.children.indexOf(anchor)
    parent.children.splice(idx, 0, newBlock)
    const prev = parent.children[idx - 1]
    if (prev) { prev.nextSibling = newBlock; newBlock.preSibling = prev }
    anchor.preSibling = newBlock; newBlock.nextSibling = anchor
    newBlock.parent = parent.key
    this.parentMap[newBlock.key] = parent
  }
  Dummy.prototype.insertAfter = function (newBlock, anchor) {
    const parent = this.getParent(anchor)
    const idx = parent.children.indexOf(anchor)
    parent.children.splice(idx + 1, 0, newBlock)
    const next = parent.children[idx + 2]
    anchor.nextSibling = newBlock; newBlock.preSibling = anchor
    if (next) { next.preSibling = newBlock; newBlock.nextSibling = next }
    newBlock.parent = parent.key
    this.parentMap[newBlock.key] = parent
  }
  Dummy.prototype.removeBlock = function (block) {
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
  Dummy.prototype.partialRender = function () {}

  it('insert row (current) does not throw and updates tbody rows', function() {
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    // build a table: figure -> table -> thead(tr(th,th)) + tbody(tr(td,td))
    const fig = cs.createBlock('figure', { functionType: 'table' })
    const table = cs.createBlock('table', { row: 1, column: 1 })
    cs.appendChild(fig, table)

    const thead = cs.createBlock('thead')
    const headRow = cs.createBlock('tr')
    const th1 = cs.createBlock('th', { column: 0 })
    const th1c = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th1, th1c)
    const th2 = cs.createBlock('th', { column: 1 })
    const th2c = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th2, th2c)
    cs.appendChild(headRow, th1); cs.appendChild(headRow, th2)
    cs.appendChild(thead, headRow)
    cs.appendChild(table, thead)

    const tbody = cs.createBlock('tbody')
    const brow = cs.createBlock('tr')
    const td1 = cs.createBlock('td', { column: 0 })
    const td1c = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td1, td1c)
    const td2 = cs.createBlock('td', { column: 1 })
    const td2c = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td2, td2c)
    cs.appendChild(brow, td1); cs.appendChild(brow, td2)
    cs.appendChild(tbody, brow)
    cs.appendChild(table, tbody)

    // set cursor inside td1 content
    cs.cursor = { start: { key: td1c.key, offset: 0 }, end: { key: td1c.key, offset: 0 } }

    // ensure initial tbody rows is 1
    expect(table.children[1]).to.equal(tbody)
    expect(tbody.children.length).to.equal(1)

    // call editTable to insert current row
    expect(() => cs.editTable({ target: 'row', action: 'insert', location: 'current' })).to.not.throw()

    // after insert, tbody should have increased rows (>=2)
    const newTbody = table.children[1]
    expect(newTbody.children.length).to.be.at.least(2)
    // cursor moved to the newly inserted row's corresponding cell content
    const cur = cs.cursor.start
    expect(cur).to.exist
    expect(cs.getBlock(cur.key).functionType).to.equal('cellContent')
  })
})
