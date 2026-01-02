import { expect } from 'chai'
import ContentState from '../../../src/muya/lib/contentState'
import { EVENT_KEYS } from '../../../src/muya/lib/config'
import selection from '../../../src/muya/lib/selection'

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

const createMuya = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return {
    container,
    options: { fontSize: 16, lineHeight: 1.5 },
    blur: () => {},
    keyboard: { hideAllFloatTools: createSpy() }
  }
}

const buildTable = cs => {
  const headCellContent = cs.createBlock('span', { functionType: 'cellContent', text: 'H' })
  const headTd = cs.createBlock('td')
  cs.appendChild(headTd, headCellContent)
  const headRow = cs.createBlock('tr')
  cs.appendChild(headRow, headTd)
  const thead = cs.createBlock('thead')
  cs.appendChild(thead, headRow)

  const bodyCellContent = cs.createBlock('span', { functionType: 'cellContent', text: 'B' })
  const bodyTd = cs.createBlock('td')
  cs.appendChild(bodyTd, bodyCellContent)
  const bodyRow = cs.createBlock('tr')
  cs.appendChild(bodyRow, bodyTd)
  const tbody = cs.createBlock('tbody')
  cs.appendChild(tbody, bodyRow)

  const table = cs.createBlock('table')
  cs.appendChild(table, thead)
  cs.appendChild(table, tbody)

  cs.blocks = [table]

  return { headCellContent, bodyCellContent, thead, tbody }
}

describe('muya arrowCtrl table navigation', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('finds next and previous row cells across thead/tbody', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-' })
    const { headCellContent, bodyCellContent } = buildTable(cs)

    const next = cs.findNextRowCell(headCellContent)
    expect(next.key).to.equal(bodyCellContent.key)

    const prev = cs.findPrevRowCell(bodyCellContent)
    expect(prev.key).to.equal(headCellContent.key)
  })

  it('moves cursor into next row cell and calls partialRender', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-' })
    const { headCellContent, bodyCellContent } = buildTable(cs)
    const para = document.createElement('div')
    para.id = headCellContent.key
    para.classList.add('ag-paragraph')

    const originalSelectionStart = selection.getSelectionStart
    const originalCursorRange = selection.getCursorRange
    const originalCursorYOffset = selection.getCursorYOffset
    selection.getSelectionStart = () => para
    selection.getCursorRange = () => ({ start: { key: headCellContent.key, offset: 0 }, end: { key: headCellContent.key, offset: 0 } })
    selection.getCursorYOffset = () => ({ topOffset: 0, bottomOffset: 0 })

    cs.partialRender = createSpy()

    const event = {
      key: EVENT_KEYS.ArrowDown,
      preventDefault: createSpy(),
      stopPropagation: createSpy()
    }

    cs.arrowHandler(event)

    expect(cs.cursor.start.key).to.equal(bodyCellContent.key)
    expect(cs.partialRender.callCount).to.equal(1)
    expect(event.preventDefault.callCount).to.equal(1)
    expect(event.stopPropagation.callCount).to.equal(1)

    selection.getSelectionStart = originalSelectionStart
    selection.getCursorRange = originalCursorRange
    selection.getCursorYOffset = originalCursorYOffset
  })
})

describe('muya docArrowHandler image selection', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('moves cursor to image edges and hides float tools', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    const imgBlock = cs.createBlock('span', { text: 'img' })
    cs.blocks = [imgBlock]
    cs.singleRender = createSpy()
    cs.selectedImage = { key: imgBlock.key, token: { range: { start: 1, end: 3 } } }

    const event = { key: EVENT_KEYS.ArrowUp, preventDefault: createSpy(), stopPropagation: createSpy() }
    cs.docArrowHandler(event)

    expect(cs.cursor.start.offset).to.equal(1)
    expect(cs.cursor.end.offset).to.equal(1)
    expect(event.preventDefault.callCount).to.equal(1)
    expect(muya.keyboard.hideAllFloatTools.callCount).to.equal(1)
    expect(cs.singleRender.callCount).to.equal(1)
  })
})
