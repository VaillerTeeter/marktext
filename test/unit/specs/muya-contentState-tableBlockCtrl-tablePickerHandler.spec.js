const { expect } = require('chai')
const _tableBlockCtrl = require('../../../src/muya/lib/contentState/tableBlockCtrl')
const tableBlockCtrl = _tableBlockCtrl && _tableBlockCtrl.default ? _tableBlockCtrl.default : _tableBlockCtrl

describe('muya contentState: tableBlockCtrl picker handler and createTable/createFigure', function() {
  function createDummy() {
    class DummyContentState {
      constructor () {
        this.blockMap = {}
        this.parentMap = {}
        this.cursor = { start: null, end: null }
        this._id = 0
        this.partialRenderCalled = 0
        this._dispatched = false
        this.muya = {
          eventCenter: {
            dispatch: (...args) => { this._dispatched = true; this._lastDispatch = args }
          },
          dispatchSelectionChange: () => { this._sel = true },
          dispatchSelectionFormats: () => { this._fmt = true },
          dispatchChange: () => { this._chg = true }
        }
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
      }

      insertAfter (newBlock, anchor) {
        const parent = this.getParent(anchor)
        if (!parent) return
        parent.children = parent.children || []
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

      getBlock (key) { return this.blockMap[key] }
      getParent (block) { return this.parentMap[block.key] }
      firstInDescendant (block) {
        if (!block.children || !block.children.length) return block
        let cur = block
        while (cur.children && cur.children.length) cur = cur.children[0]
        return cur
      }
      partialRender () { this.partialRenderCalled += 1 }
      closest (block, type) {
        let cur = block
        while (cur) {
          if (cur.type === type) return cur
          cur = this.getParent(cur)
        }
      }
      // for createFigure test: optionally return null anchor
      getAnchor (block) { return this._anchor || null }
    }

    return DummyContentState
  }

  it('table picker handler expands columns when picking larger column', function() {
    const Dummy = createDummy()
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    // build basic table: figure > table > thead(tr>th x2) tbody(tr>td x1)
    const figure = cs.createBlock('figure')
    const table = cs.createBlock('table', { row: 1, column: 1 })
    cs.appendChild(figure, table)

    const thead = cs.createBlock('thead')
    const theadRow = cs.createBlock('tr')
    cs.appendChild(thead, theadRow)
    const th1 = cs.createBlock('th', { column: 0, align: '' })
    const th1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th1, th1Content)
    const th2 = cs.createBlock('th', { column: 1, align: '' })
    const th2Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(th2, th2Content)
    cs.appendChild(theadRow, th1)
    cs.appendChild(theadRow, th2)
    cs.appendChild(thead, theadRow)
    cs.appendChild(table, thead)

    const tbody = cs.createBlock('tbody')
    const bodyRow = cs.createBlock('tr')
    const td1 = cs.createBlock('td', { column: 0, align: '' })
    const td1Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td1, td1Content)
    const td2 = cs.createBlock('td', { column: 1, align: '' })
    const td2Content = cs.createBlock('span', { functionType: 'cellContent', text: '' })
    cs.appendChild(td2, td2Content)
    cs.appendChild(bodyRow, td1)
    cs.appendChild(bodyRow, td2)
    cs.appendChild(tbody, bodyRow)
    cs.appendChild(table, tbody)

    // set cursor to header cell content
    cs.cursor = { start: { key: th2Content.key }, end: { key: th2Content.key } }

    // create DOM structure expected by tableToolBarClick
    const wrapper = document.createElement('div')
    wrapper.id = figure.key
    const tableEle = document.createElement('div')
    tableEle.setAttribute('data-label', 'table')
    tableEle.id = figure.key
    wrapper.appendChild(tableEle)
    document.body.appendChild(wrapper)

    // override eventCenter.dispatch to capture handler and call it
    let capturedHandler = null
    cs.muya.eventCenter.dispatch = function () {
      const args = Array.from(arguments)
      capturedHandler = args[3]
      // mark dispatched
      cs._dispatched = true
    }

    cs.tableToolBarClick('table')
    expect(cs._dispatched).to.be.true
    expect(typeof capturedHandler).to.equal('function')

    // call handler with larger column to trigger column > oldColumn branch
    capturedHandler.call(cs, 1, 3) // row=1, column=3 (> oldColumn 1)

    // header and body rows should have expanded cells
    expect(theadRow.children.length).to.be.greaterThan(2)
    expect(bodyRow.children.length).to.be.greaterThan(2)

    // cleanup
    document.body.removeChild(wrapper)
  })

  it('createFigure returns early when no anchor', function() {
    const Dummy = createDummy()
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    // set cursor end to a block with no anchor; getAnchor will return null
    const endBlock = cs.createBlock('p')
    const text = cs.createBlock('span', { text: '' })
    cs.appendChild(endBlock, text)
    cs.appendChild(cs.createBlock('root'), endBlock)
    cs.cursor = { end: { key: endBlock.key } }

    // call createFigure and expect undefined (early return)
    const res = cs.createFigure({ rows: 2, columns: 2 })
    expect(res).to.be.undefined
  })

  it('createTable calls muya dispatch selection/change hooks', function() {
    const Dummy = createDummy()
    tableBlockCtrl(Dummy)
    const cs = new Dummy()
    // prepare an anchor/end block so createFigure does not early return
    const anchor = cs.createBlock('p')
    const span = cs.createBlock('span', { text: '' })
    cs.appendChild(anchor, span)
    cs._anchor = anchor
    cs.cursor = { end: { key: anchor.key } }

    cs.createTable({ rows: 2, columns: 2 })

    expect(cs._sel).to.be.true
    expect(cs._fmt).to.be.true
    expect(cs._chg).to.be.true
  })
})
