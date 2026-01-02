import { expect } from 'chai'
import tableSelectCellsCtrl from '../../../src/muya/lib/contentState/tableSelectCellsCtrl'

const createSpy = () => {
  const fn = (...args) => {
    fn.called = true
    fn.callCount += 1
    fn.args = args
  }
  fn.called = false
  fn.callCount = 0
  return fn
}

class DummyContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.cellSelectEventIds = []
    this.selectedTableCells = null
    this.singleRender = createSpy()
    this.deleteParagraph = createSpy()
    this.editTable = createSpy()
    this.muya = {
      eventCenter: {
        attachDOMEvent: createSpy(),
        detachDOMEvent: createSpy()
      },
      blur: createSpy(),
      dispatchChange: createSpy()
    }
  }

  addBlock (block, parent = null) {
    this.blockMap[block.key] = block
    if (parent) {
      this.parentMap[block.key] = parent
      parent.children.push(block)
    }
    return block
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  getParent (block) {
    return this.parentMap[block.key]
  }
}

tableSelectCellsCtrl(DummyContentState)

describe('contentState table selection controllers', () => {
  const buildDomTable = (ids = [['c1', 'c2'], ['c3', 'c4']]) => {
    const table = document.createElement('table')
    table.id = 'table'
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')
    const headRow = document.createElement('tr')
    ids[0].forEach(id => {
      const th = document.createElement('th')
      th.id = id
      headRow.appendChild(th)
    })
    thead.appendChild(headRow)

    const bodyRow = document.createElement('tr')
    ids[1].forEach(id => {
      const td = document.createElement('td')
      td.id = id
      bodyRow.appendChild(td)
    })
    tbody.appendChild(bodyRow)

    table.appendChild(thead)
    table.appendChild(tbody)
    document.body.appendChild(table)
    return table
  }

  const buildBlocks = (cs, ids = [['c1', 'c2'], ['c3', 'c4']]) => {
    const table = cs.addBlock({ key: 'table', type: 'table', row: 1, column: 1, children: [] })
    const thead = cs.addBlock({ key: 'thead', type: 'thead', children: [] }, table)
    const tbody = cs.addBlock({ key: 'tbody', type: 'tbody', children: [] }, table)
    const headRow = cs.addBlock({ key: 'tr-head', type: 'tr', children: [] }, thead)
    const bodyRow = cs.addBlock({ key: 'tr-body', type: 'tr', children: [] }, tbody)

    ids[0].forEach((id, idx) => {
      const cell = cs.addBlock({ key: id, type: 'th', column: idx, align: '', children: [] }, headRow)
      cs.addBlock({ key: `${id}-content`, type: 'span', text: '', children: [] }, cell)
    })

    ids[1].forEach((id, idx) => {
      const cell = cs.addBlock({ key: id, type: 'td', column: idx, align: '', children: [] }, bodyRow)
      cs.addBlock({ key: `${id}-content`, type: 'span', text: '', children: [] }, cell)
    })

    return table
  }

  let cs
  let table
  beforeEach(() => {
    cs = new DummyContentState()
    table = buildDomTable()
    buildBlocks(cs)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('handles cell drag selection lifecycle', () => {
    const firstCell = table.querySelector('th')
    const moveCell = table.querySelector('tbody td')

    cs.handleCellMouseDown({
      buttons: 1,
      target: firstCell
    })

    expect(cs.cellSelectInfo.anchor.key).to.equal('c1')
    expect(cs.cellSelectEventIds.length).to.equal(2)

    cs.handleCellMouseMove({ target: moveCell })

    expect(cs.cellSelectInfo.isStartSelect).to.equal(true)
    expect(moveCell.classList.contains('ag-cell-selected')).to.equal(true)

    const originalSetTimeout = global.setTimeout
    global.setTimeout = fn => fn()

    cs.handleCellMouseUp({ preventDefault: () => {}, target: moveCell })

    global.setTimeout = originalSetTimeout

    expect(cs.selectedTableCells.tableId).to.equal('table')
    expect(cs.singleRender.called).to.equal(true)
  })

  it('selects whole table and resets selection state', () => {
    const targetTable = cs.getBlock('table')
    cs.selectTable(targetTable)
    expect(cs.selectedTableCells.row).to.equal(2)
    expect(cs.selectedTableCells.column).to.equal(2)
    expect(cs.cellSelectInfo).to.equal(null)
    expect(cs.singleRender.called).to.equal(true)
  })

  it('reports single cell or whole table selection', () => {
    cs.selectedTableCells = {
      tableId: 'table',
      cells: [{ key: 'c1' }]
    }
    expect(cs.isSingleCellSelected().key).to.equal('c1')

    cs.selectedTableCells = {
      tableId: 'table',
      cells: [{ key: 'c1' }, { key: 'c2' }, { key: 'c3' }, { key: 'c4' }]
    }
    expect(cs.isWholeTableSelected().key).to.equal('table')
  })

  it('deletes selected table cells depending on selection state', () => {
    // Cut whole table path
    cs.selectedTableCells = {
      tableId: 'table',
      row: 1,
      column: 1,
      cells: [{ key: 'c1' }, { key: 'c2' }, { key: 'c3' }, { key: 'c4' }]
    }
    cs.deleteSelectedTableCells(true)
    expect(cs.deleteParagraph.called).to.equal(true)

    // Content present path
    const cellBlock = cs.getBlock('c1')
    cellBlock.children[0].text = 'data'
    cs.selectedTableCells = {
      tableId: 'table',
      cells: [{ key: 'c1' }]
    }
    cs.deleteSelectedTableCells()
    expect(cs.singleRender.called).to.equal(true)
    expect(cs.muya.dispatchChange.called).to.equal(true)

    // Empty row removal path
    cs.selectedTableCells = {
      tableId: 'table',
      cells: [{ key: 'c3' }, { key: 'c4' }]
    }
    cs.deleteSelectedTableCells()
    expect(cs.editTable.called).to.equal(true)
  })
})
