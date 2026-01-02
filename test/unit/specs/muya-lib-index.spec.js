/* global __webpack_require__ */
import path from 'path'

describe('muya lib index', () => {
  const muyaId = require.resolve('../../../src/muya/lib/index')
  const contentStateId = require.resolve('../../../src/muya/lib/contentState')
  const eventCenterId = require.resolve('../../../src/muya/lib/eventHandler/event')
  const mouseEventId = require.resolve('../../../src/muya/lib/eventHandler/mouseEvent')
  const clipboardId = require.resolve('../../../src/muya/lib/eventHandler/clipboard')
  const keyboardId = require.resolve('../../../src/muya/lib/eventHandler/keyboard')
  const dragDropId = require.resolve('../../../src/muya/lib/eventHandler/dragDrop')
  const resizeId = require.resolve('../../../src/muya/lib/eventHandler/resize')
  const clickEventId = require.resolve('../../../src/muya/lib/eventHandler/clickEvent')
  const exportMarkdownId = require.resolve('../../../src/muya/lib/utils/exportMarkdown')
  const exportHtmlId = require.resolve('../../../src/muya/lib/utils/exportHtml')
  const toolTipId = require.resolve('../../../src/muya/lib/ui/tooltip')
  const utilsId = require.resolve('../../../src/muya/lib/utils')
  const configId = require.resolve('../../../src/muya/lib/config')

  const originals = {}
  const stubCache = [contentStateId, eventCenterId, mouseEventId, clipboardId, keyboardId, dragDropId, resizeId, clickEventId, exportMarkdownId, exportHtmlId, toolTipId, utilsId, configId]

  let Muya
  let container
  let origin
  let muya
  let observerCallback
  let eventDispatches
  let contentState
  let originalObserver

  const resetMuyaModule = () => {
    delete __webpack_require__.c[muyaId]
    delete require.cache[muyaId]
  }

  beforeEach(() => {
    // Save originals
    for (const id of stubCache) {
      originals[id] = require.cache[id]
    }

    // Stub MutationObserver to capture callback
    originalObserver = global.MutationObserver
    class FakeObserver {
      constructor (cb) {
        observerCallback = cb
      }
      observe () {}
    }
    global.MutationObserver = FakeObserver

    eventDispatches = []

    class EventCenterStub {
      constructor () { this.dom = [] }
      subscribe () {}
      subscribeOnce () {}
      unsubscribe () {}
      dispatch (evt) { eventDispatches.push(evt) }
      attachDOMEvent (node, type, cb) { this.dom.push({ node, type, cb }) }
      detachAllDomEvents () { this.dom = [] }
    }

    class ContentStateStub {
      constructor () {
        contentState = this
        this.turndownConfig = {}
        this.listIndentation = 1
        this.isGitlabCompatibilityEnabled = false
        this.history = {
          undo: () => { this.historyUndo = true },
          redo: () => { this.historyRedo = true },
          clearHistory: () => { this.historyCleared = true }
        }
        this.stateRender = {
          setContainer: () => {},
          invalidateImageCache: () => { this.cacheInvalidated = true }
        }
        this.searchMatches = []
      }
      getBlocks () { return [] }
      getHistory () { return 'hist' }
      getTOC () { return ['toc'] }
      setHistory (h) { this.historySet = h; return h }
      importMarkdown () { this.imported = true }
      addCursorToMarkdown (markdown, cursor) { return { markdown: `${markdown}-cursor`, isValid: this.nextCursorValid !== false } }
      importCursor (flag) { this.cursorImported = flag }
      render () { this.rendered = true }
      getCodeMirrorCursor () { return { pos: 1 } }
      createTable () { this.tableCreated = true; return 'table' }
      selectionChange () { this.selectionChanged = true; return { sel: true } }
      selectionFormats () { return { formats: 'fmt' } }
      setCursor () { this.cursorSet = true }
      updateParagraph (t) { this.updatedParagraph = t }
      duplicate () { this.duplicated = true }
      deleteParagraph () { this.deleted = true }
      insertParagraph () { this.inserted = true }
      editTable (d) { this.tableEdited = d }
      format (t) { this.formatted = t }
      insertImage (i) { this.imageInserted = i }
      search (v, opt) { this.searchValue = v; this.searchOpt = opt; this.searchMatches = ['match'] }
      replace (v, opt) { this.replaceValue = v; this.replaceOpt = opt; this.searchMatches = ['replace'] }
      find (act) { this.findAction = act; this.searchMatches = ['find'] }
      extractImages () { return ['img'] }
      clear () { this.cleared = true }
      _replaceCurrentWordInlineUnsafe (w, r) { this.replacedWord = { w, r }; return true }
      replaceWordInline (l, wc, rep, sc) { this.replaceWordCalled = { l, wc, rep, sc } }
      selectAll () { this.selectAllCalled = true }
    }

    class SimpleStub { constructor () {} }
    class KeyboardStub { constructor () {} hideAllFloatTools () { return true } }
    class ClipboardStub { constructor () {} copyAsMarkdown () { this.copied = 'md' } copyAsHtml () { this.copied = 'html' } pasteAsPlainText () { this.pasted = true } copy () { return 'copied' } }

    class ExportMarkdownStub { constructor () {} generate () { return 'md-out' } }
    class ExportHtmlStub { constructor () {} generate () { return 'html-out' } renderHtml () { return '<html />' } }
    class ToolTipStub { constructor () {} }

    const configStub = {
      CLASS_OR_ID: { AG_FOCUS_MODE: 'ag-focus' },
      MUYA_DEFAULT_OPTION: { markdown: '', focusMode: false, spellcheckEnabled: false, hideQuickInsertHint: false }
    }

    const wordCount = str => str.length

    const asDefault = Cls => ({ __esModule: true, default: Cls })
    require.cache[contentStateId] = { exports: asDefault(ContentStateStub) }
    require.cache[eventCenterId] = { exports: asDefault(EventCenterStub) }
    require.cache[mouseEventId] = { exports: asDefault(SimpleStub) }
    require.cache[clipboardId] = { exports: asDefault(ClipboardStub) }
    require.cache[keyboardId] = { exports: asDefault(KeyboardStub) }
    require.cache[dragDropId] = { exports: asDefault(SimpleStub) }
    require.cache[resizeId] = { exports: asDefault(SimpleStub) }
    require.cache[clickEventId] = { exports: asDefault(SimpleStub) }
    require.cache[exportMarkdownId] = { exports: asDefault(ExportMarkdownStub) }
    require.cache[exportHtmlId] = { exports: asDefault(ExportHtmlStub) }
    require.cache[toolTipId] = { exports: asDefault(ToolTipStub) }
    require.cache[utilsId] = { exports: { wordCount } }
    require.cache[configId] = { exports: configStub }

    resetMuyaModule()
    Muya = require('../../../src/muya/lib/index').default
    Muya.plugins = []

    origin = document.createElement('div')
    origin.setAttribute('data-orig', '1')
    document.body.appendChild(origin)
    muya = new Muya(origin, { markdown: 'hello', focusMode: false, spellcheckEnabled: true, hideQuickInsertHint: false, bulletListMarker: '-' })
    muya.quickInsert = { destroy: () => { muya.quickDestroyed = true } }
    muya.codePicker = { destroy: () => { muya.codeDestroyed = true } }
    muya.tablePicker = { destroy: () => { muya.tableDestroyed = true } }
    muya.emojiPicker = { destroy: () => { muya.emojiDestroyed = true } }
    muya.imagePathPicker = { destroy: () => { muya.imagePathDestroyed = true } }
  })

  afterEach(() => {
    resetMuyaModule()
    for (const [id, original] of Object.entries(originals)) {
      if (original) {
        require.cache[id] = original
      } else {
        delete require.cache[id]
      }
    }
    if (muya && muya.container && muya.container.remove) {
      muya.container.remove()
    }
    if (originalObserver) {
      global.MutationObserver = originalObserver
    }
  })

  it('covers Muya core methods and option branches', async () => {
    expect(muya.container.getAttribute('spellcheck')).to.equal('true')
    expect(muya.container.classList.contains('ag-show-quick-insert-hint')).to.equal(true)

    // Mutation observer branches
    const tableNode = document.createElement('table')
    tableNode.classList.add('ag-paragraph')
    tableNode.setAttribute('class', 'ag-paragraph')
    observerCallback([
      { type: 'childList', removedNodes: [tableNode], target: { getAttribute: () => 'ag-editor-id', childElementCount: 0, closest: () => null } }
    ])
    observerCallback([
      { type: 'attributes' },
      { type: 'childList', removedNodes: [], target: { getAttribute: () => 'no-crash', childElementCount: 1 } },
      { type: 'childList', removedNodes: [document.createElement('p')], target: { getAttribute: () => 'no-crash', childElementCount: 1 } }
    ])
    muya.eventCenter.dom.forEach(entry => entry.cb())
    expect(eventDispatches).to.include('crashed')

    // Focus mode toggle
    muya.setFocusMode(true)
    expect(muya.container.classList.contains('ag-focus')).to.equal(true)
    muya.setFocusMode(false)
    expect(muya.container.classList.contains('ag-focus')).to.equal(false)

    // Font and tab sizes
    muya.setFont({ fontSize: '12', lineHeight: 1.6 })
    expect(muya.options.fontSize).to.equal(12)
    expect(muya.options.lineHeight).to.equal(1.6)
    muya.setTabSize()
    expect(contentState.tabSize).to.equal(4)
    muya.setTabSize(-1)
    expect(contentState.tabSize).to.equal(1)
    muya.setTabSize(10)
    expect(contentState.tabSize).to.equal(4)
    muya.setTabSize(3)
    expect(contentState.tabSize).to.equal(3)
    muya.setFont({})

    // List indentation branches
    muya.setListIndentation(5)
    expect(contentState.listIndentation).to.equal(1)
    muya.setListIndentation(2)
    expect(contentState.listIndentation).to.equal(2)
    muya.setListIndentation('dfm')
    expect(contentState.listIndentation).to.equal('dfm')
    muya.setListIndentation('other')
    expect(contentState.listIndentation).to.equal(1)

    // Markdown setters
    muya.setMarkdown('abc', { anchor: 1, focus: 1 })
    expect(contentState.imported).to.equal(true)
    expect(contentState.cursorImported).to.equal(true)
    contentState.nextCursorValid = false
    muya.setMarkdown('def', { anchor: 1, focus: 1 })
    expect(contentState.cursorImported).to.equal(false)
    muya.setCursor({ anchor: 1, focus: 1 })
    muya.createTable(() => true)
    muya.getSelection()

    muya.updateParagraph('p')
    muya.duplicate()
    muya.deleteParagraph()
    muya.insertParagraph('after', 'txt', true)
    muya.insertParagraph('before')
    muya.editTable({ key: 1 })

    muya.setHistory('hist')
    expect(contentState.historySet).to.equal('hist')
    muya.clearHistory()
    expect(contentState.historyCleared).to.equal(true)

    muya.exportStyledHTML({})
    muya.exportHtml()
    expect(muya.getWordCount('ok')).to.equal(2)
    muya.getHistory()
    muya.getTOC()

    muya.format('bold')
    muya.insertImage({ src: 'a' })
    muya.search('findme', { selectHighlight: true })
    expect(muya.search('another', { selectHighlight: false })).to.deep.equal(['match'])
    muya.replace('r', {})
    muya.find('next')
    muya.invalidateImageCache()

    muya.dispatchSelectionChange()
    muya.dispatchSelectionFormats()
    muya.dispatchChange()
    const listener = () => {}
    muya.on('change', listener)
    muya.off('change', listener)
    muya.once('later', listener)

    muya.extractImages()
    muya.copyAsMarkdown()
    muya.copyAsHtml()
    muya.pasteAsPlainText()
    muya.copy('info')

    muya.replaceWordInline('line', { start: 0, end: 1 }, 'new')
    muya.replaceWordInline('line', { start: 0, end: 1 }, 'new', true)
    muya._replaceCurrentWordInlineUnsafe('old', 'new')

    muya.container.classList.add('ag-show-quick-insert-hint')
    muya.setOptions({ codeBlockLineNumbers: true, hideQuickInsertHint: true, spellcheckEnabled: false, bulletListMarker: '*' }, true)
    expect(muya.container.classList.contains('ag-show-quick-insert-hint')).to.equal(false)
    expect(muya.container.getAttribute('spellcheck')).to.equal('false')
    expect(contentState.turndownConfig.bulletListMarker).to.equal('*')
    muya.setOptions({ hideQuickInsertHint: false, spellcheckEnabled: true, codeBlockLineNumbers: false })
    expect(muya.container.classList.contains('ag-show-quick-insert-hint')).to.equal(true)
    expect(muya.container.getAttribute('spellcheck')).to.equal('true')

    muya.setOptions({ hideQuickInsertHint: true })
    expect(muya.container.classList.contains('ag-show-quick-insert-hint')).to.equal(false)

    class PluginStub { constructor (ctx, opts) { this.ctx = ctx; this.opts = opts } }
    PluginStub.pluginName = 'pluginStub'
    const pluginContainer = document.createElement('div')
    document.body.appendChild(pluginContainer)
    Muya.use(PluginStub)
    Muya.use(PluginStub, { foo: 'bar' })
    const muyaWithPlugin = new Muya(pluginContainer, { markdown: '', focusMode: false, spellcheckEnabled: false, hideQuickInsertHint: true })
    expect(muyaWithPlugin.pluginStub).to.be.instanceOf(PluginStub)
    expect(muyaWithPlugin.pluginStub.opts).to.deep.equal({ foo: 'bar' })
    pluginContainer.remove()
    contentState = muya.contentState

    muya.hideAllFloatTools()
    muya.undo()
    muya.redo()
    contentState.selectedTableCells = {}
    muya.selectAll()
    contentState.selectedTableCells = null
    muya.selectAll()

    contentState.selectedImage = { val: true }
    contentState.selectedTableCells = { existing: true }
    muya.focus()
    muya.blur(true, true)
    muya.blur()
    expect(contentState.selectedImage).to.equal(null)
    expect(contentState.selectedTableCells).to.equal(null)

    muya.setOptions({})

    muya.destroy()
    expect(muya.quickDestroyed).to.equal(true)
    expect(muya.imagePathDestroyed).to.equal(true)
  })
})
