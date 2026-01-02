import { expect } from 'chai'
import dragDropCtrl from '../../../src/muya/lib/contentState/dragDropCtrl'
import imageCtrl from '../../../src/muya/lib/contentState/imageCtrl'
import updateCtrl from '../../../src/muya/lib/contentState/updateCtrl'
import paragraphCtrl from '../../../src/muya/lib/contentState/paragraphCtrl'
import enterCtrl from '../../../src/muya/lib/contentState/enterCtrl'
import backspaceCtrl from '../../../src/muya/lib/contentState/backspaceCtrl'
import clickCtrl from '../../../src/muya/lib/contentState/clickCtrl'
import pasteCtrl from '../../../src/muya/lib/contentState/pasteCtrl'
import copyCutCtrl from '../../../src/muya/lib/contentState/copyCutCtrl'
import tableDragBarCtrl, { getAllTableCells, getIndex } from '../../../src/muya/lib/contentState/tableDragBarCtrl'
import selection from '../../../src/muya/lib/selection'
import { CLASS_OR_ID } from '../../../src/muya/lib/config'

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
    this.blocks = []
    this.cursor = { start: null, end: null }
    this.dropAnchor = null
    this.dragInfo = null
    this.dragEventIds = []
    this.isDragTableBar = false
    this.stateRender = { urlMap: new Map(), labels: {} }
    this.muya = {
      container: document.createElement('div'),
      options: {
        imageAction: async () => 'out',
        clipboardFilePath: () => null,
        autoCheck: false,
        bulletListMarker: '*',
        orderListDelimiter: '.',
        preferLooseListItem: false,
        frontmatterType: '-',
        footnote: true
      },
      eventCenter: {
        dispatch: createSpy(),
        attachDOMEvent: createSpy(),
        detachDOMEvent: createSpy()
      },
      dispatchChange: createSpy(),
      dispatchSelectionChange: () => {},
      dispatchSelectionFormats: () => {}
    }
    this.partialRender = createSpy()
    this.singleRender = createSpy()
    this.render = createSpy()
  }

  createBlock (type, props = {}) {
    const key = props.key || `${type}-${Math.random().toString(36).slice(2, 6)}`
    const block = { key, type, children: [], ...props }
    this.blockMap[key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children.push(child)
    child.parent = parent.key
    this.parentMap[child.key] = parent
  }

  prependChild (parent, child) {
    parent.children.unshift(child)
    child.parent = parent.key
    this.parentMap[child.key] = parent
  }

  insertBefore (block, ref) {
    const parent = this.parentMap[ref.key] || { children: this.blocks }
    const idx = parent.children.indexOf(ref)
    parent.children.splice(idx, 0, block)
    this.parentMap[block.key] = parent
  }

  insertAfter (block, ref) {
    const parent = this.parentMap[ref.key] || { children: this.blocks }
    const idx = parent.children.indexOf(ref)
    parent.children.splice(idx + 1, 0, block)
    this.parentMap[block.key] = parent
  }

  removeBlock (block) {
    const parent = this.parentMap[block.key]
    if (!parent) return
    parent.children = parent.children.filter(c => c.key !== block.key)
    delete this.parentMap[block.key]
    delete this.blockMap[block.key]
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  getParent (block) {
    return this.parentMap[block.key]
  }

  findOutMostBlock (block) {
    let current = block
    while (this.parentMap[current.key]) {
      current = this.parentMap[current.key]
    }
    return current
  }

  getAnchor (block) { return block }
  getPreSibling (block) { return null }
  getNextSibling (block) { return null }
  closest () { return null }
  firstInDescendant (block) { return block.children[0] || block }
  markdownToState () { return [] }
  selectionFormats () { return { formats: [] } }
  htmlToMarkdown (html) { return html }
  codeBlockUpdate () { return false }
  pasteImage () { return null }
  getLastBlock () { return this.blocks[this.blocks.length - 1] }
  isOnlyChild () { return true }
  isFirstChild () { return true }
  isLastChild () { return true }
  isSelectAll () { return false }
  deleteImage () { this.deleteImageCalled = true }
  deleteSelectedTableCells (isCut = false) { this.deleteTableCalled = isCut }
  createBlockP (text = '') {
    const p = this.createBlock('p', { text })
    const span = this.createBlock('span', { type: 'span', text, functionType: 'paragraphContent' })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }
}

dragDropCtrl(DummyContentState)
imageCtrl(DummyContentState)
updateCtrl(DummyContentState)
paragraphCtrl(DummyContentState)
enterCtrl(DummyContentState)
backspaceCtrl(DummyContentState)
clickCtrl(DummyContentState)
pasteCtrl(DummyContentState)
copyCutCtrl(DummyContentState)
tableDragBarCtrl(DummyContentState)

describe('contentState advanced controllers', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('dragDropCtrl hideGhost removes ghost element', () => {
    const cs = new DummyContentState()
    const ghost = document.createElement('div')
    ghost.id = 'mu-dragover-ghost'
    document.body.appendChild(ghost)
    cs.hideGhost()
    expect(document.querySelector('#mu-dragover-ghost')).to.equal(null)
    expect(cs.dropAnchor).to.equal(null)
  })

  it('imageCtrl insertImage skips codeContent and updates paragraph', () => {
    const cs = new DummyContentState()
    const code = cs.createBlock('span', { type: 'span', text: 'code', functionType: 'codeContent' })
    cs.blocks = [code]
    cs.cursor = { start: { key: code.key, offset: 0 }, end: { key: code.key, offset: 0 } }
    cs.insertImage({ src: 'http://example.com/a.png' })
    expect(code.text).to.equal('code')

    const p = cs.createBlockP('hello')
    const span = p.children[0]
    cs.cursor = { start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 0 } }
    cs.insertImage({ src: 'http://example.com/a.png', alt: 'a' })
    expect(span.text).to.contain('![')
    expect(cs.partialRender.called).to.equal(true)
    expect(cs.muya.dispatchChange.called).to.equal(true)
  })

  it('imageCtrl deleteImage updates cursor and dispatches events', () => {
    const cs = new DummyContentState()
    const block = cs.createBlock('span', { type: 'span', text: '![a](src)', functionType: 'paragraphContent' })
    const token = { range: { start: 0, end: 9 } }
    cs.blockMap[block.key] = block
    cs.deleteImage({ key: block.key, token })
    expect(cs.cursor.start.key).to.equal(block.key)
    expect(cs.muya.eventCenter.dispatch.called).to.equal(true)
  })

  it('updateCtrl checkSameMarkerOrDelimiter and checkNeedRender', () => {
    const cs = new DummyContentState()
    const list = cs.createBlock('ul')
    const li = cs.createBlock('li', { bulletMarkerOrDelimiter: '-' })
    cs.appendChild(list, li)
    expect(cs.checkSameMarkerOrDelimiter(list, '-')).to.equal(true)

    const span = cs.createBlock('span', { type: 'span', text: '**a**', functionType: 'paragraphContent' })
    cs.blockMap[span.key] = span
    cs.stateRender.labels = {}
    const cursor = { start: { key: span.key, offset: 2 }, end: { key: span.key, offset: 2 } }
    cs.cursor = cursor
    expect(cs.checkNeedRender(cursor)).to.equal(true)
  })

  it('paragraphCtrl handleFrontMatter inserts frontmatter pre block', () => {
    const cs = new DummyContentState()
    const p = cs.createBlockP('text')
    cs.blocks = [p]
    cs.handleFrontMatter()
    expect(cs.blocks[0].functionType).to.equal('frontmatter')
  })

  it('enterCtrl docEnterHandler opens image selector when image selected', () => {
    const cs = new DummyContentState()
    cs.selectedImage = { imageId: 'img1' }
    const wrapper = document.createElement('span')
    wrapper.id = 'img1'
    document.body.appendChild(wrapper)
    cs.docEnterHandler({ preventDefault: () => {}, stopPropagation: () => {} })
    expect(cs.muya.eventCenter.dispatch.called).to.equal(true)
  })

  it('backspaceCtrl docBackspaceHandler deletes image or table selection', () => {
    const cs = new DummyContentState()
    cs.deleteImage = createSpy()
    cs.selectedImage = { key: 'img', token: { range: { start: 0, end: 4 } } }
    cs.docBackspaceHandler({ preventDefault: () => {} })
    expect(cs.deleteImage.called).to.equal(true)

    cs.selectedImage = null
    cs.selectedTableCells = {}
    cs.deleteSelectedTableCells = createSpy()
    cs.docBackspaceHandler({ preventDefault: () => {} })
    expect(cs.deleteSelectedTableCells.called).to.equal(true)
  })

  it('clickCtrl click below last block inserts new paragraph', () => {
    const cs = new DummyContentState()
    const p = cs.createBlockP('last')
    cs.blocks = [p]
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    document.body.appendChild(cs.muya.container)
    cs.muya.container.appendChild(Object.assign(document.createElement('div'), { id: p.key }))
    const paraNode = cs.muya.container.querySelector(`#${p.key}`)
    Object.defineProperty(paraNode, 'getBoundingClientRect', { value: () => ({ top: 0, left: 0, height: 10 }) })
    const origGetCursorRange = selection.getCursorRange
    const origGetSelectionStart = selection.getSelectionStart
    selection.getCursorRange = () => ({ start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } })
    selection.getSelectionStart = () => paraNode
    const event = { target: cs.muya.container, clientY: 20, preventDefault: () => {} }
    cs.clickHandler(event)
    expect(cs.render.called).to.equal(true)
    selection.getCursorRange = origGetCursorRange
    selection.getSelectionStart = origGetSelectionStart
  })

  it('pasteCtrl docPasteHandler delegates to pasteHandler for single cell selection', async () => {
    const cs = new DummyContentState()
    cs.pasteHandler = createSpy()
    const cell = cs.createBlock('span', { type: 'span', functionType: 'cellContent', text: 'cell' })
    cs.cursor = { start: { key: cell.key }, end: { key: cell.key } }
    cs.selectedTableCells = { row: 1, column: 1 }
    const event = { preventDefault: createSpy(), clipboardData: { items: [] } }
    await cs.docPasteHandler(event)
    expect(cs.pasteHandler.called).to.equal(true)
    expect(event.preventDefault.called).to.equal(true)
  })

  it('copyCutCtrl handlers react to selections', () => {
    const cs = new DummyContentState()
    cs.selectedTableCells = { row: 1, column: 1 }
    cs.deleteSelectedTableCells = createSpy()
    cs.docCutHandler({ preventDefault: () => {} })

    cs.selectedImage = { key: 'k', token: {} }
    cs.deleteImage = createSpy()
    cs.selectedTableCells = null
    cs.cutHandler()
    expect(cs.deleteImage.called).to.equal(true)
  })

  it('tableDragBarCtrl helper utilities gather indices and cells', () => {
    const table = document.createElement('table')
    table.id = 'tbl-helper'
    const tbody = document.createElement('tbody')
    const row = document.createElement('tr')
    const td1 = document.createElement('td')
    const span = document.createElement('span')
    td1.appendChild(span)
    const td2 = document.createElement('td')
    Object.defineProperty(td1, 'clientWidth', { value: 40 })
    Object.defineProperty(td2, 'clientWidth', { value: 40 })
    row.appendChild(td1)
    row.appendChild(td2)
    tbody.appendChild(row)
    table.appendChild(tbody)
    document.body.appendChild(table)

    expect(getIndex('bottom', span)).to.equal(0)
    expect(getIndex('left', td2)).to.equal(1)

    const cells = getAllTableCells('tbl-helper')
    expect(cells.length).to.equal(1)
    expect(cells[0].length).to.equal(2)
  })

  it('tableDragBarCtrl handles mouse drag setup and movement', () => {
    const table = document.createElement('table')
    table.id = 'tbl-move'
    const tbody = document.createElement('tbody')
    for (let i = 0; i < 2; i++) {
      const row = document.createElement('tr')
      for (let j = 0; j < 2; j++) {
        const td = document.createElement('td')
        td.textContent = `${i}-${j}`
        Object.defineProperty(td, 'clientWidth', { value: 60 })
        Object.defineProperty(td, 'clientHeight', { value: 20 })
        row.appendChild(td)
      }
      tbody.appendChild(row)
    }
    table.appendChild(tbody)
    document.body.appendChild(table)

    const cs = new DummyContentState()
    cs.muya.eventCenter.attachDOMEvent = () => 'evt'
    cs.muya.eventCenter.detachDOMEvent = createSpy()
    const target = tbody.querySelector('td')
    cs.handleMouseDown({ preventDefault: () => {}, target, clientX: 0, clientY: 0 })

    const nonDragCell = tbody.querySelectorAll('td')[1]
    expect(cs.dragInfo.tableId).to.equal('tbl-move')
    expect(nonDragCell.classList.contains('ag-cell-transform')).to.equal(true)

    cs.handleMouseMove({ clientX: 12, clientY: 0 })
    expect(cs.isDragTableBar).to.equal(true)
    expect(cs.dragInfo.dragCells[0].style.transform).to.contain('translateX')
  })

  it('tableDragBarCtrl switchTableData reorders columns and updates cursor', () => {
    const cs = new DummyContentState()
    const table = cs.createBlock('table', { key: 'tbl-switch' })
    const tHead = cs.createBlock('thead')
    const headRow = cs.createBlock('tr')
    const tBody = cs.createBlock('tbody')
    const bodyRow = cs.createBlock('tr')

    const createCell = (text, type = 'td') => {
      const cell = cs.createBlock(type, { align: 'left' })
      const content = cs.createBlock('span', { type: 'span', text })
      cs.appendChild(cell, content)
      return { cell, content }
    }

    const headCellA = createCell('A', 'th')
    const headCellB = createCell('B', 'th')
    cs.appendChild(headRow, headCellA.cell)
    cs.appendChild(headRow, headCellB.cell)
    cs.appendChild(tHead, headRow)

    const bodyCellA = createCell('1')
    const bodyCellB = createCell('2')
    cs.appendChild(bodyRow, bodyCellA.cell)
    cs.appendChild(bodyRow, bodyCellB.cell)
    cs.appendChild(tBody, bodyRow)

    cs.appendChild(table, tHead)
    cs.appendChild(table, tBody)
    cs.blockMap[table.key] = table

    cs.cursor = { start: { key: headCellA.content.key, offset: 0 }, end: { key: headCellA.content.key, offset: 0 } }
    cs.dragInfo = { barType: 'bottom', index: 0, curIndex: 1, tableId: table.key, offset: 10 }

    cs.switchTableData()

    expect(headCellA.content.text).to.equal('B')
    expect(headCellB.content.text).to.equal('A')
    expect(bodyCellA.content.text).to.equal('2')
    expect(bodyCellB.content.text).to.equal('1')
    expect(cs.cursor.start.key).to.equal(headCellB.content.key)
    expect(cs.singleRender.called).to.equal(true)
  })

  it('tableDragBarCtrl handleMouseUp detaches events and resets state', () => {
    const cs = new DummyContentState()
    cs.muya.eventCenter.detachDOMEvent = createSpy()
    cs.dragEventIds = ['e1', 'e2']
    cs.dragInfo = { tableId: 'tbl', barType: 'bottom', index: 0, curIndex: 1, offset: 10 }
    cs.isDragTableBar = true
    cs.setDropTargetStyle = createSpy()
    cs.switchTableData = createSpy()
    cs.resetDragTableBar = createSpy()
    const originalTimeout = global.setTimeout
    global.setTimeout = fn => { fn(); return 0 }

    try {
      cs.handleMouseUp({ preventDefault: () => {}, target: {} })
      expect(cs.muya.eventCenter.detachDOMEvent.callCount).to.equal(2)
      expect(cs.switchTableData.called).to.equal(true)
      expect(cs.resetDragTableBar.called).to.equal(true)
    } finally {
      global.setTimeout = originalTimeout
    }
  })
})
