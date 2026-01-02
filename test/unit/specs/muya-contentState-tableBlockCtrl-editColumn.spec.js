const { expect } = require('chai')

describe('muya-contentState: tableBlockCtrl edit column tests', function() {
  const _tableBlockCtrl = require('../../../src/muya/lib/contentState/tableBlockCtrl')
  const tableBlockCtrl = _tableBlockCtrl && _tableBlockCtrl.default ? _tableBlockCtrl.default : _tableBlockCtrl

  function createDummy() {
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

  it('insert column at left increases cells per row and sets cursor to left pre-sibling child', function() {
    const Dummy = createDummy()
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    // build a table: figure > table > thead/tr/th x2, tbody/tr/td x2
    const figure = cs.createBlock('figure')
    const table = cs.createBlock('table')
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const theadRow = cs.createBlock('tr')
    cs.appendChild(thead, theadRow)
    cs.appendChild(table, thead)

    const th1 = cs.createBlock('th')
    const th2 = cs.createBlock('th')
    cs.appendChild(theadRow, th1)
    cs.appendChild(theadRow, th2)

    const tbody = cs.createBlock('tbody')
    const tbodyRow = cs.createBlock('tr')
    cs.appendChild(tbody, tbodyRow)
    const td1 = cs.createBlock('td')
    const td1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td1, td1Content)
    const td2 = cs.createBlock('td')
    const td2Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td2, td2Content)
    cs.appendChild(tbodyRow, td1)
    cs.appendChild(tbodyRow, td2)
    cs.appendChild(table, tbody)

    // mount cursor to td2 content (target cell)
    cs.cursor = { start: { key: td2Content.key }, end: { key: td2Content.key } }

    // call editTable to insert a column to the left of td2
    cs.editTable({ target: 'column', action: 'insert', location: 'left', block: td2 })

    // each row should now have 3 cells
    expect(theadRow.children.length).to.equal(3)
    expect(tbodyRow.children.length).to.equal(3)

    // cursor should be set to the first child of the pre-sibling of the target
    const pre = cs.getPreSibling(td2)
    expect(pre).to.not.be.null
    const expectedCursor = cs.firstInDescendant(pre)
    expect(cs.cursor.start).to.deep.equal({ key: expectedCursor.key, offset: 0 })
  })

  it('remove current column decreases cells per row when >2 columns', function() {
    const Dummy = createDummy()
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    // build a table with 3 columns
    const figure = cs.createBlock('figure')
    const table = cs.createBlock('table')
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const theadRow = cs.createBlock('tr')
    cs.appendChild(thead, theadRow)
    // add three header cells with content
    const th1 = cs.createBlock('th')
    const th1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th1, th1Content)
    const th2 = cs.createBlock('th')
    const th2Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th2, th2Content)
    const th3 = cs.createBlock('th')
    const th3Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th3, th3Content)
    cs.appendChild(theadRow, th1)
    cs.appendChild(theadRow, th2)
    cs.appendChild(theadRow, th3)

    const tbody = cs.createBlock('tbody')
    const row1 = cs.createBlock('tr')
    const r1c1 = cs.createBlock('td')
    const r1c1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(r1c1, r1c1Content)
    const r1c2 = cs.createBlock('td')
    const r1c2Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(r1c2, r1c2Content)
    const r1c3 = cs.createBlock('td')
    const r1c3Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(r1c3, r1c3Content)
    cs.appendChild(row1, r1c1)
    cs.appendChild(row1, r1c2)
    cs.appendChild(row1, r1c3)
    cs.appendChild(table, thead)
    cs.appendChild(tbody, row1)

    const row2 = cs.createBlock('tr')
    const r2c1 = cs.createBlock('td')
    const r2c1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(r2c1, r2c1Content)
    const r2c2 = cs.createBlock('td')
    const r2c2Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(r2c2, r2c2Content)
    const r2c3 = cs.createBlock('td')
    const r2c3Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(r2c3, r2c3Content)
    cs.appendChild(row2, r2c1)
    cs.appendChild(row2, r2c2)
    cs.appendChild(row2, r2c3)
    cs.appendChild(tbody, row2)
    cs.appendChild(table, tbody)

    // set cursor to r1c2 content and remove current column
    cs.cursor = { start: { key: r1c2Content.key }, end: { key: r1c2Content.key } }
    cs.editTable({ target: 'column', action: 'remove', location: 'current', block: r1c2 })

    // each row should now have 2 cells
    expect(row1.children.length).to.equal(2)
    expect(row2.children.length).to.equal(2)
  })
})
