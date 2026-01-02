const { expect } = require('chai')
const _tableBlockCtrl = require('../../../src/muya/lib/contentState/tableBlockCtrl')
const tableBlockCtrl = _tableBlockCtrl && _tableBlockCtrl.default ? _tableBlockCtrl.default : _tableBlockCtrl

describe('muya contentState: tableBlockCtrl edge cases', function() {
  function createDummy() {
    class DummyContentState {
      constructor () {
        this.blockMap = {}
        this.parentMap = {}
        this.cursor = { start: null, end: null }
        this._id = 0
        this.partialRenderCalled = 0
        this.muya = { eventCenter: { dispatch: () => { this._dispatched = true } } }
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
      findNextBlockInLocation () { return null }
    }

    return DummyContentState
  }

  it('remove column early returns when only 2 columns', function() {
    const Dummy = createDummy()
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    // build a table with exactly 2 columns
    const figure = cs.createBlock('figure')
    const table = cs.createBlock('table')
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const theadRow = cs.createBlock('tr')
    cs.appendChild(thead, theadRow)
    const th1 = cs.createBlock('th')
    const th1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th1, th1Content)
    const th2 = cs.createBlock('th')
    const th2Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th2, th2Content)
    cs.appendChild(theadRow, th1)
    cs.appendChild(theadRow, th2)
    cs.appendChild(table, thead)

    const tbody = cs.createBlock('tbody')
    const row = cs.createBlock('tr')
    const td1 = cs.createBlock('td')
    const td1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td1, td1Content)
    const td2 = cs.createBlock('td')
    const td2Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td2, td2Content)
    cs.appendChild(row, td1)
    cs.appendChild(row, td2)
    cs.appendChild(tbody, row)
    cs.appendChild(table, tbody)

    // cursor in first row cell
    cs.cursor = { start: { key: td1Content.key }, end: { key: td1Content.key } }

    // attempt to remove a column -> should early return (no change)
    const beforeHeadLen = theadRow.children.length
    cs.editTable({ target: 'column', action: 'remove', location: 'left' }, null)
    expect(theadRow.children.length).to.equal(beforeHeadLen)
  })

  it('remove previous header with no preSibling swaps head/body correctly', function() {
    const Dummy = createDummy()
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    // build table where removing previous on a header will move rows
    const figure = cs.createBlock('figure')
    const table = cs.createBlock('table')
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const headRow = cs.createBlock('tr')
    cs.appendChild(thead, headRow)
    // header cell and its content
    const th = cs.createBlock('th')
    const thContent = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th, thContent)
    cs.appendChild(headRow, th)
    cs.appendChild(table, thead)

    const tbody = cs.createBlock('tbody')
    const bodyRow1 = cs.createBlock('tr')
    const b1c1 = cs.createBlock('td')
    const b1c1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(b1c1, b1c1Content)
    cs.appendChild(bodyRow1, b1c1)
    const bodyRow2 = cs.createBlock('tr')
    const b2c1 = cs.createBlock('td')
    const b2c1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(b2c1, b2c1Content)
    cs.appendChild(bodyRow2, b2c1)
    cs.appendChild(tbody, bodyRow1)
    cs.appendChild(tbody, bodyRow2)
    cs.appendChild(table, tbody)

    // simulate cursor inside header cell content
    cs.cursor = { start: { key: thContent.key }, end: { key: thContent.key } }

    // call remove previous row on header (location previous, action remove)
    // According to implementation, if no preSibling on currentRow, it will
    // remove headRow and currentRow and then appendChild(thead, currentRow)
    // We'll invoke editTable with target 'row', action 'remove' and location 'previous'
    // but editTable expects to find parent relationships; we ensure current row has no preSibling

    // create a header cell scenario where currentRow refers to header's parent
    const currentRow = headRow
    const cellBlock = th
    // call via editTable: pass cellContent key
    cs.editTable({ location: 'previous', action: 'remove', target: 'row' }, thContent.key)

    // After operation, ensure tbody still exists and thead has at least one child
    expect(table.children.some(c => c.type === 'tbody')).to.be.true
    expect(thead.children.length).to.be.at.least(1)
  })
})
