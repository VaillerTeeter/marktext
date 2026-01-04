import { expect } from 'chai'
import pasteCtrl from '../../../src/muya/lib/contentState/pasteCtrl'
import copyCutCtrl from '../../../src/muya/lib/contentState/copyCutCtrl'
import ExportMarkdown from '../../../src/muya/lib/utils/exportMarkdown'
import selection from '../../../src/muya/lib/selection'
import os from 'os'
import path from 'path'

class DummyContentState {}
pasteCtrl(DummyContentState)
copyCutCtrl(DummyContentState)

const createEvent = () => ({
  preventDefault: () => { createEvent.prevented = true },
  stopPropagation: () => { createEvent.stopped = true },
  clipboardData: {
    data: {},
    items: [],
    getData (type) { return this.data[type] || '' },
    setData (type, value) { this.data[type] = value }
  }
})

const createState = () => {
  const muya = {
    options: {
      clipboardFilePath: () => null,
      imageAction: async () => 'uploaded.png',
      superSubScript: false,
      footnote: false,
      isGitlabCompatibilityEnabled: false
    },
    container: document.createElement('div'),
    eventCenter: { dispatch: () => {} },
    dispatchSelectionChange: () => {},
    dispatchSelectionFormats: () => {},
    dispatchChange: () => {}
  }
  const span = { key: 'start', type: 'span', functionType: '', text: '', children: [] }
  const para = { key: 'p', type: 'p', children: [span], headingStyle: 'atx' }
  const state = new DummyContentState()
  Object.assign(state, {
    muya,
    stateRender: { urlMap: new Map() },
    blocks: [para],
    blockMap: { start: span, p: para },
    parentMap: { start: para },
    cursor: { start: { key: 'start', offset: 0 }, end: { key: 'start', offset: 0 } },
    selectionFormatsCalled: 0,
    changeCalled: 0
  })
  state.getParent = block => state.parentMap[block.key] || null
  state.getBlock = key => state.blockMap[key]
  state.createBlockP = text => {
    const child = { key: `span-${Date.now()}-${Math.random()}`, type: 'span', text, children: [] }
    const block = { key: `p-${Math.random()}`, type: 'p', children: [child], text, headingStyle: 'atx', editable: true }
    child.parent = block
    state.blockMap[child.key] = child
    state.blockMap[block.key] = block
    state.parentMap[child.key] = block
    return block
  }
  state.insertAfter = (block, target) => { state.insertAfterCalled = { block, target } }
  state.removeBlock = block => { state.removedBlock = block }
  state.insertHtmlBlock = block => { state.insertedHtml = block }
  state.markdownToState = text => [{ key: `m-${Math.random()}`, type: 'p', text, editable: true, children: [{ key: `mc-${Math.random()}`, text, type: 'span', children: [] }] }]
  state.html2State = html => {
    if (html.includes('<ul')) {
      return [{ key: 'list', type: 'ul', listType: 'bullet', editable: true, children: [{ key: 'li', type: 'li', bulletMarkerOrDelimiter: '-', children: [{ key: 'lip', type: 'p', children: [{ key: 'lisp', type: 'span', text: 'list', children: [] }] }], isLooseListItem: false }] }]
    }
    return state.markdownToState(html.replace(/<[^>]+>/g, ''))
  }
  state.appendChild = (parent, child) => { parent.children.push(child); state.parentMap[child.key] = parent }
  state.checkInlineUpdate = block => { state.inlineChecked = block }
  state.partialRender = () => { state.partialCalled = true }
  state.updateCodeLanguage = (block, lang) => { state.codeUpdated = { block, lang } }
  state.replaceImage = (img, payload) => { state.replacedImage = { img, payload } }
  state.insertImage = payload => { state.insertedImage = payload }
  state.muya.dispatchSelectionChange = () => { state.selectionFormatsCalled += 1 }
  state.muya.dispatchSelectionFormats = () => { state.selectionFormatsCalled += 1 }
  state.muya.dispatchChange = () => { state.changeCalled += 1 }
  state.checkPasteType = DummyContentState.prototype.checkPasteType.bind(state)
  state.checkCopyType = DummyContentState.prototype.checkCopyType.bind(state)
  state.standardizeHTML = DummyContentState.prototype.standardizeHTML.bind(state)
  state.pasteImage = DummyContentState.prototype.pasteImage.bind(state)
  state.pasteHandler = DummyContentState.prototype.pasteHandler.bind(state)
  state.docPasteHandler = DummyContentState.prototype.docPasteHandler.bind(state)
  state.docCutHandler = DummyContentState.prototype.docCutHandler.bind(state)
  state.cutHandler = DummyContentState.prototype.cutHandler.bind(state)
  state.getClipBoardData = DummyContentState.prototype.getClipBoardData.bind(state)
  state.docCopyHandler = DummyContentState.prototype.docCopyHandler.bind(state)
  state.copyHandler = DummyContentState.prototype.copyHandler.bind(state)
  state.htmlToMarkdown = html => `md:${html}`
  state.createBlock = (type, props = {}) => ({ key: `block-${Math.random()}`, type, children: [], ...props })
  state.createTableInFigure = (shape, cells) => ({ key: 'table', shape, cells })
  state.getAnchor = block => block
  state.getAnchorBlock = block => block
  state.getAnchorBlockInContainer = block => block
  state.createTable = () => 'table'
  state.createFigure = () => ({ key: 'fig', children: [] })
  state.removeBlocks = (start, end) => { state.removedBlocks = { start, end } }
  state.deleteImage = img => { state.deletedImage = img }
  state.deleteSelectedTableCells = flag => { state.deletedTableCells = flag }
  return state
}

const withCursor = (state, block) => {
  state.cursor = { start: { key: block.key, offset: 0 }, end: { key: block.key, offset: block.text ? block.text.length : 0 } }
}

describe('pasteCtrl utilities', () => {
  beforeEach(() => {
    createEvent.prevented = false
    createEvent.stopped = false
  })

  it('checkPasteType covers branches', () => {
    const state = createState()
    const startBlock = state.createBlockP('t').children[0]
    const paragraph = state.parentMap[startBlock.key]
    const listItem = { key: 'li1', type: 'li', bulletMarkerOrDelimiter: '*' }
    const list = { key: 'list1', type: 'ul', listType: 'bullet', children: [listItem] }
    state.parentMap[paragraph.key] = listItem
    state.parentMap[listItem.key] = list
    state.blockMap[listItem.key] = listItem
    state.blockMap[list.key] = list

    const heading = { key: 'h1', type: 'h1', text: '' }
    const headingText = { key: 'h2', type: 'h2', text: 'x' }
    const childListItem = { key: 'cli', type: 'p', children: [{ key: 'c', text: 'c' }] }
    const fragmentList = { key: 'fl', type: 'ul', listType: 'bullet', children: [{ bulletMarkerOrDelimiter: '*', children: [childListItem], isLooseListItem: false }] }

    expect(state.checkPasteType(startBlock, { key: 'f1', type: 'p' })).to.equal('MERGE')
    expect(state.checkPasteType(headingText, heading)).to.equal('MERGE')
    expect(state.checkPasteType(heading, heading)).to.equal('NEWLINE')

    expect(state.checkPasteType(startBlock, fragmentList)).to.equal('MERGE')
    fragmentList.children[0].bulletMarkerOrDelimiter = '-'
    expect(state.checkPasteType(startBlock, fragmentList)).to.equal('NEWLINE')
    expect(DummyContentState.prototype.checkPasteType.call({ getParent: () => null }, startBlock, { type: 'ul', listType: 'bullet', children: [] })).to.equal('NEWLINE')
    expect(DummyContentState.prototype.checkPasteType.call({ getParent: () => null }, startBlock, { type: 'code' })).to.equal('NEWLINE')
  })

  it('checkCopyType detects html/md/table tags', () => {
    const state = createState()
    const html = '<p>text</p>'
    expect(state.checkCopyType(html, 'raw')).to.equal('normal')
    expect(state.checkCopyType('', '<table><tr><td>x</td></tr></table>')).to.equal('htmlToMd')
    expect(state.checkCopyType('', '<h1>h</h1>')).to.equal('copyAsHtml')
    expect(state.checkCopyType('', '<unknown>text</unknown>')).to.equal('copyAsMarkdown')
  })

  it('standardizeHTML sanitizes tables and links', async () => {
    const state = createState()
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const raw = '<body><table><tr><td>a<br></td></tr></table><a href="http://example.com">http://example.com</a></body>'
    const sanitized = await state.standardizeHTML(raw)
    expect(sanitized).to.contain('<th>a<br></th>')
    expect(sanitized).to.contain('<a href="http://example.com">http://example.com</a>')
  })

  it('standardizeHTML uses fetched title when available', async () => {
    const state = createState()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const originalXHR = global.XMLHttpRequest
    class FakeXHR {
      constructor () { this.headers = { 'Content-Type': 'text/html' }; this.readyState = 4; this.status = 200; this.response = '<title>New Title</title>' }
      open () {}
      send () { setTimeout(() => this.onreadystatechange && this.onreadystatechange()) }
      getResponseHeader (n) { return this.headers[n] }
      setRequestHeader () {}
    }
    global.XMLHttpRequest = FakeXHR
    const html = '<a href="http://example.com">http://example.com</a>'
    const sanitized = await state.standardizeHTML(html)
    expect(sanitized).to.satisfy(str => str.includes('New Title') || str.includes('http://example.com'))
    global.XMLHttpRequest = originalXHR
  })

  it('pasteImage handles file path and errors', async () => {
    const state = createState()
    const wrapper = document.createElement('span')
    wrapper.dataset.id = 'loading-123'
    wrapper.classList.add('ag-empty-image')
    const container = document.createElement('span')
    container.classList.add('ag-image-container')
    wrapper.appendChild(container)
    state.muya.container.appendChild(wrapper)
    state.selectedImage = { id: 'img' }
    const testImagePath = path.join(os.tmpdir(), 'img.png')
    state.muya.options.clipboardFilePath = () => testImagePath
    const replaced = await state.pasteImage(createEvent())
    expect(replaced).to.equal(testImagePath)
    expect(state.replacedImage.payload.src).to.equal(testImagePath)

    // error branch
    state.muya.options.imageAction = async () => { throw new Error('fail') }
    const result = await state.pasteImage(createEvent())
    expect(result).to.equal(null)
  })

  it('docPasteHandler triggers paste image or table cell paste', async () => {
    const state = createState()
    state.pasteImage = async () => 'file'
    const evt = createEvent()
    await state.docPasteHandler(evt)
    expect(createEvent.prevented).to.equal(true)

    const startBlock = { key: 'cell', functionType: 'cellContent' }
    state.getBlock = () => startBlock
    state.cursor = { start: { key: 'cell' } }
    state.selectedTableCells = { start: true, row: 1, column: 1 }
    state.pasteImage = async () => null
    state.pasteHandler = () => { state.pasteHandled = true }
    const evt2 = createEvent()
    await state.docPasteHandler(evt2)
    expect(state.pasteHandled).to.equal(true)
    expect(createEvent.prevented).to.equal(true)
  })
})

describe('pasteHandler branches', () => {
  beforeEach(() => {
    createEvent.prevented = false
    createEvent.stopped = false
  })
  it('recurses when selection spans blocks', async () => {
    const state = createState()
    const start = state.createBlockP('a').children[0]
    const end = state.createBlockP('b').children[0]
    state.blockMap[start.key] = start
    state.blockMap[end.key] = end
    state.cursor = { start: { key: start.key, offset: 0 }, end: { key: end.key, offset: 0 } }
    state.cutHandler = () => { state.cursor.end.key = state.cursor.start.key }
    await state.pasteHandler(createEvent(), 'normal', 'txt', '<p>h</p>')
    expect(state.cutHandler).to.not.equal(undefined)
  })

  it('handles language and code content branches', async () => {
    const state = createState()
    const block = state.getBlock('start')
    block.type = 'span'
    block.functionType = 'languageInput'
    block.text = ''
    await state.pasteHandler(createEvent(), 'normal', 'js', '<p>h</p>')
    expect(state.codeUpdated.lang).to.equal('js')

    block.functionType = 'codeContent'
    block.text = 'code'
    state.cursor = { start: { key: block.key, offset: 1 }, end: { key: block.key, offset: 3 } }
    await state.pasteHandler(createEvent(), 'normal', 'X', '<p>h</p>')
    expect(state.partialCalled).to.equal(true)
  })

  it('handles table cell paste cases', async () => {
    const state = createState()
    const block = state.getBlock('start')
    block.functionType = 'cellContent'
    block.text = 'cell'
    state.cursor = { start: { key: block.key, offset: 0 }, end: { key: block.key, offset: 0 } }
    state.selectedTableCells = { row: 1, column: 1 }
    await state.pasteHandler(createEvent(), 'normal', 'celltext', '<p>h</p>')
    expect(state.partialCalled).to.equal(true)

    state.selectedTableCells = { row: 2, column: 2 }
    await state.pasteHandler(createEvent(), 'normal', 'skip', '<p>h</p>')
    expect(state.partialCalled).to.equal(true)
  })

  it('handles copyAsHtml with plain text and normal', async () => {
    const state = createState()
    const block = state.getBlock('start')
    block.type = 'p'
    block.text = ''
    const evt = createEvent()
    const raw = '<h1>plain</h1>'
    evt.clipboardData.getData = type => type === 'text/plain' ? raw : ''
    await state.pasteHandler(evt, 'pasteAsPlainText', raw, '')
    expect(state.insertedHtml).to.not.equal(undefined)

    await state.pasteHandler(createEvent(), 'normal', 'plain', '<p>html</p>')
    expect(state.partialCalled).to.equal(true)
  })

  it('inserts state fragments with merge and newline', async () => {
    const mergeState = createState()
    const mergeBlock = mergeState.getBlock('start')
    mergeBlock.type = 'p'
    mergeBlock.text = 'orig'
    const mergeEvent = createEvent()
    mergeState.checkPasteType = () => 'MERGE'
    await mergeState.pasteHandler(mergeEvent, 'normal', 'md', '<p>text</p>')
    expect(mergeBlock.text).to.equal('textorig')
    expect(mergeState.partialCalled).to.equal(true)

    const newlineState = createState()
    const newlineBlock = newlineState.getBlock('start')
    newlineBlock.type = 'p'
    newlineBlock.text = 'orig'
    const newlineEvent = createEvent()
    newlineState.checkPasteType = () => 'NEWLINE'
    await newlineState.pasteHandler(newlineEvent, 'normal', 'md', '<p>text</p>')
    expect(newlineState.removedBlock).to.not.equal(undefined)
  })
})

describe('copyCutCtrl branches', () => {
  it('docCutHandler deletes table selection', () => {
    const state = createState()
    state.selectedTableCells = true
    const evt = createEvent()
    state.docCutHandler(evt)
    expect(state.deletedTableCells).to.equal(true)
  })

  it('cutHandler covers image and text cases', () => {
    const state = createState()
    state.selectedTableCells = null
    state.selectedImage = { key: 'img', token: { raw: 'raw' } }
    state.cutHandler()
    expect(state.deletedImage.key).to.equal('img')

    state.selectedImage = null
    selection.getCursorRange = () => ({ start: { key: 'start', offset: 0 }, end: { key: 'start', offset: 0 } })
    state.getBlock('start').text = 'hello'
    state.cutHandler()
    expect(state.partialCalled).to.equal(true)
  })

  it('getClipBoardData covers code and dom cleaning', () => {
    const state = createState()
    selection.getCursorRange = () => ({ start: { key: 'start', offset: 0 }, end: { key: 'start', offset: 1 } })
    selection.getSelectionHtml = () => '<div class="ag-copy-remove">x</div><span class="ag-inline-rule">rule</span><span class="ag-soft-line-break">b</span><span data-role="hr"></span><pre data-role="code" id="code1"><span class="ag-code-content">code</span></pre>'
    state.blockMap.code1 = { lang: 'js' }
    state.stateRender.urlMap.set('srcA', 'srcB')
    const res = state.getClipBoardData()
    expect(res.text).to.contain('md:')
  })

  it('docCopyHandler handles single and multi cell copy', () => {
    const state = createState()
    const evt = createEvent()
    state.selectedTableCells = { row: 1, column: 1, cells: [{ text: 'cell', align: 'left' }] }
    state.docCopyHandler(evt)
    expect(evt.clipboardData.data['text/plain']).to.equal('cell')

    state.selectedTableCells = { row: 2, column: 2, cells: Array(4).fill({ text: 'a', align: 'left' }) }
    state.createTableInFigure = () => ({ children: [] })
    state.createBlock = () => ({ children: [] })
    state.isGitlabCompatibilityEnabled = false
    state.listIndentation = 1
    state.docCopyHandler(evt)
    expect(evt.clipboardData.data['text/plain']).to.be.a('string')
  })

  it('copyHandler covers modes and selected image', () => {
    const state = createState()
    const evt = createEvent()
    state.selectedTableCells = null
    state.selectedImage = { token: { raw: '<b>img</b>' } }
    state.copyHandler(evt, 'normal')
    expect(evt.clipboardData.data['text/plain']).to.equal('<b>img</b>')

    state.selectedImage = null
    state.getClipBoardData = () => ({ html: '<p>h</p>', text: 'txt' })
    state.copyHandler(evt, 'normal')
    state.copyHandler(evt, 'copyAsMarkdown')
    state.copyHandler(evt, 'copyAsHtml')
    const block = { key: 'block', type: 'p', children: [] }
    state.blockMap.block = block
    const originalGenerate = ExportMarkdown.prototype.generate
    ExportMarkdown.prototype.generate = () => 'md-block'
    try {
      state.copyHandler(evt, 'copyBlock', 'block')
    } finally {
      ExportMarkdown.prototype.generate = originalGenerate
    }
    state.copyHandler(evt, 'copyCodeContent', 'code')
    expect(evt.clipboardData.data['text/plain']).to.equal('code')
  })
})
