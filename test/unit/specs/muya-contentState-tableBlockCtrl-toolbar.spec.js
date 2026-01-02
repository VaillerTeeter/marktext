const { expect } = require('chai')
const _tableBlockCtrl = require('../../../src/muya/lib/contentState/tableBlockCtrl')
const tableBlockCtrl = _tableBlockCtrl && _tableBlockCtrl.default ? _tableBlockCtrl.default : _tableBlockCtrl

describe('muya contentState: tableBlockCtrl toolbar actions (align and delete)', function() {
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
  Dummy.prototype.partialRender = function () {}

  it('toggles column alignment with left/center/right', function() {
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    // build a simple table with thead and tbody
    const figure = cs.createBlock('figure', { functionType: 'table' })
    const table = cs.createBlock('table', { row: 1, column: 1 })
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const headRow = cs.createBlock('tr')
    const th1 = cs.createBlock('th', { column: 0, align: '' })
    const th1c = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th1, th1c)
    const th2 = cs.createBlock('th', { column: 1, align: '' })
    const th2c = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th2, th2c)
    cs.appendChild(headRow, th1); cs.appendChild(headRow, th2)
    cs.appendChild(thead, headRow)
    cs.appendChild(table, thead)

    const tbody = cs.createBlock('tbody')
    const brow = cs.createBlock('tr')
    const td1 = cs.createBlock('td', { column: 0, align: '' })
    const td1c = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td1, td1c)
    const td2 = cs.createBlock('td', { column: 1, align: '' })
    const td2c = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td2, td2c)
    cs.appendChild(brow, td1); cs.appendChild(brow, td2)
    cs.appendChild(tbody, brow)
    cs.appendChild(table, tbody)

    // set cursor inside second column cell content
    cs.cursor = { start: { key: th2c.key, offset: 0 }, end: { key: th2c.key, offset: 0 } }

    // call left align
    cs.tableToolBarClick('left')
    // all rows' column 1 should now have align 'left'
    const headerAlign = headRow.children[1].align
    const bodyAlign = brow.children[1].align
    expect(headerAlign).to.equal('left')
    expect(bodyAlign).to.equal('left')

    // calling same align toggles it off
    cs.tableToolBarClick('left')
    expect(headRow.children[1].align).to.equal('')
  })

  it('delete action converts figure to paragraph and resets cursor', function() {
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    const figure = cs.createBlock('figure', { functionType: 'table' })
    const table = cs.createBlock('table', { row: 1, column: 1 })
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const headRow = cs.createBlock('tr')
    const th = cs.createBlock('th', { column: 0 })
    const thc = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th, thc)
    cs.appendChild(headRow, th)
    cs.appendChild(thead, headRow)
    cs.appendChild(table, thead)

    // set cursor and ensure parent mapping
    cs.cursor = { start: { key: thc.key, offset: 0 }, end: { key: thc.key, offset: 0 } }

    // call delete
    cs.tableToolBarClick('delete')

    // figure should become paragraph with a new span child
    expect(figure.type).to.equal('p')
    expect(figure.children).to.have.lengthOf(1)
    const newSpan = figure.children[0]
    expect(newSpan.type).to.equal('span')
    expect(newSpan.text).to.equal('')

    // cursor moved to new span
    expect(cs.cursor.start.key).to.equal(newSpan.key)
  })
})
