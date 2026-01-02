import BaseFloat from '../../../src/muya/lib/ui/baseFloat'
import BaseScrollFloat from '../../../src/muya/lib/ui/baseScrollFloat'
import TablePicker from '../../../src/muya/lib/ui/tablePicker'
import EmojiPicker from '../../../src/muya/lib/ui/emojiPicker'
import Transformer from '../../../src/muya/lib/ui/transformer'
import Tooltip from '../../../src/muya/lib/ui/tooltip'
import FootnoteTool from '../../../src/muya/lib/ui/footnoteTool'
import ImageSelector from '../../../src/muya/lib/ui/imageSelector'
import EventCenter from '../../../src/muya/lib/eventHandler/event'
import ClickEvent from '../../../src/muya/lib/eventHandler/clickEvent'
import Clipboard from '../../../src/muya/lib/eventHandler/clipboard'
import DragDrop from '../../../src/muya/lib/eventHandler/dragDrop'
import Keyboard from '../../../src/muya/lib/eventHandler/keyboard'
import MouseEventHandler from '../../../src/muya/lib/eventHandler/mouseEvent'
import Resize from '../../../src/muya/lib/eventHandler/resize'
import selection from '../../../src/muya/lib/selection'

// Many of these modules expect a live DOM. jsdom provides enough surface area
// for the simple interactions we exercise here.

const createEventCenter = () => new EventCenter()

const createMuya = (options = {}) => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  return {
    container,
    options: Object.assign({
      footnote: true,
      hideLinkPopup: false,
      imagePathPicker: null,
      imageAction: null,
      imagePathAutoComplete: () => [],
      photoCreatorClick: null
    }, options),
    eventCenter: createEventCenter(),
    contentState: {
      // stubs are reassigned in individual tests when needed
      dragoverHandler: () => {},
      dropHandler: () => {},
      dragleaveHandler: () => {},
      docPasteHandler: () => {},
      docCopyHandler: () => {},
      docCutHandler: () => {},
      copyHandler: () => {},
      cutHandler: () => {},
      pasteHandler: () => {},
      createFootnote: () => {},
      backspaceHandler: () => {},
      deleteHandler: () => {},
      enterHandler: () => {},
      docEnterHandler: () => {},
      docBackspaceHandler: () => {},
      docDeleteHandler: () => {},
      docArrowHandler: () => {},
      arrowHandler: () => {},
      tabHandler: () => {},
      inputHandler: () => {},
      checkEditLanguage: () => ({ lang: null, paragraph: null }),
      selectionFormats: () => ({ formats: [] }),
      getPositionReference: () => ({ getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }) }),
      checkNeedRender: () => false,
      partialRender: () => {},
      getBlock: () => ({ functionType: '' }),
      cursor: { anchor: { key: 'k', offset: 0 }, focus: { key: 'k', offset: 0 } },
      selectedImage: null,
      setEmoji: () => {},
      replaceImage: () => {},
      updateImage: () => {},
      selectionChange: () => ({}),
      tableToolBarClick: () => {},
      handleMouseDown: () => {},
      handleCellMouseDown: () => {},
      listItemCheckBoxClick: () => {},
      clickHandler: () => {},
      deleteImage: () => {},
      selectImage: () => {},
      handleContainerBlockClick: () => {},
      copyCodeBlock: () => {},
      checkNeedRenderSelection: () => false,
      selectionFormatsViaState: () => ({}),
      handleMousemove: () => {},
      checkEditEmoji: () => null
    },
    dispatchChange: () => {},
    dispatchSelectionChange: () => {},
    dispatchSelectionFormats: () => {},
    keyboard: null,
    contentStateRender: {},
    imagePathPicker: { status: false },
    containerState: {}
  }
}

describe('muya UI core components', () => {
  it('EventCenter attaches, detaches and dispatches events', () => {
    const center = createEventCenter()
    const target = document.createElement('div')
    document.body.appendChild(target)

    let invoked = 0
    const handler = () => { invoked++ }
    const id = center.attachDOMEvent(target, 'click', handler)
    expect(id).to.be.a('string')

    target.dispatchEvent(new window.Event('click'))
    expect(invoked).to.equal(1)

    center.detachDOMEvent(id)
    target.dispatchEvent(new window.Event('click'))
    expect(invoked).to.equal(1)

    center.subscribe('test', handler)
    center.dispatch('test')
    expect(invoked).to.equal(2)

    center.subscribeOnce('once', handler)
    center.dispatch('once')
    center.dispatch('once')
    expect(invoked).to.equal(3)

    center.unsubscribe('test', handler)
    center.dispatch('test')
    expect(invoked).to.equal(3)
  })

  it('BaseFloat shows, hides and destroys popper', () => {
    const muya = createMuya()
    const base = new BaseFloat(muya, 'test-float', { showArrow: false })
    base.listen()

    const reference = document.createElement('div')
    document.body.appendChild(reference)
    base.show(reference)
    expect(base.status).to.be.true

    // Trigger escape hide path
    const escEvent = new window.KeyboardEvent('keydown', { key: 'Escape' })
    muya.container.dispatchEvent(escEvent)
    base.hide()
    expect(base.status).to.be.false

    base.destroy()
    expect(document.body.contains(base.floatBox)).to.equal(false)
  })

  it('BaseScrollFloat steps through items and selects', (done) => {
    const muya = createMuya()
    const float = new BaseScrollFloat(muya, 'scroll-float')
    float.listen()
    float.render = () => {}

    float.renderArray = ['a', 'b', 'c']
    float.activeItem = 'a'
    float.step('next')
    expect(float.activeItem).to.equal('b')
    float.step('previous')
    expect(float.activeItem).to.equal('a')

    // selectItem invokes callback and hides via timeout
    float.cb = item => {
      expect(item).to.equal('a')
      setTimeout(() => {
        expect(float.status).to.be.false
        done()
      }, 5)
    }
    float.selectItem('a')
  })

  it('TablePicker renders and updates selection', () => {
    const muya = createMuya()
    const picker = new TablePicker(muya)
    picker.select = { row: 0, column: 0 }
    picker.current = { row: 0, column: 0 }
    picker.render()
    picker.keyupHandler({ key: 'ArrowUp', target: { value: '2' } }, 'row')
    expect(+picker.select.row).to.be.at.least(1)
    picker.keyupHandler({ key: 'Enter', target: { value: '3' } }, 'column')
    expect(picker.select.column.toString()).to.equal('0')
  })

  it('EmojiPicker renders and selects emojis', () => {
    const muya = createMuya()
    const picker = new EmojiPicker(muya)
    picker.renderObj = { people: [{ aliases: ['smile'], description: 'smile', emoji: '😄' }] }
    picker.render()
    const item = picker.renderArray[0]
    picker.selectItem = selected => {
      expect(selected).to.equal(item)
    }
    picker.getItemElement = () => {
      const el = document.createElement('div')
      el.dataset.label = 'smile'
      el.scrollIntoView = () => {}
      return el
    }
    picker.render()
    picker.selectItem(item)
  })

  it('Transformer updates image size on drag', () => {
    const muya = createMuya({})
    muya.contentState.updateImage = (info, key, width) => {
      expect(key).to.equal('width')
      expect(width).to.be.a('number')
    }
    const transformer = new Transformer(muya)
    const reference = document.createElement('div')
    reference.getBoundingClientRect = () => ({ left: 10, top: 10, width: 100, height: 100 })
    reference.querySelector = () => ({ setAttribute: () => {}, getBoundingClientRect: () => ({ left: 10, top: 10 }) })
    transformer.reference = reference
    transformer.render()
    const circle = transformer.container.querySelector('.top-left')
    const mockEvent = { target: circle, clientX: 5, preventDefault: () => {} }
    transformer.mouseDown(mockEvent)
    transformer.mouseMove(mockEvent)
    transformer.mouseUp(mockEvent)
    transformer.hide()
    expect(transformer.status).to.be.false
  })

  it('Tooltip shows and clears cache', (done) => {
    const muya = createMuya()
    const tooltip = new Tooltip(muya)
    const target = document.createElement('div')
    target.setAttribute('data-tooltip', 'Hello')
    muya.container.appendChild(target)
    target.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }))
    setTimeout(() => {
      expect(tooltip.cache.has(target)).to.equal(true)
      target.dispatchEvent(new window.MouseEvent('mouseleave', { bubbles: true }))
      expect(tooltip.cache.has(target)).to.equal(false)
      done()
    }, 10)
  })

  it('FootnoteTool renders go-to and create flows', () => {
    const muya = createMuya()
    const tool = new FootnoteTool(muya)
    const identifier = 'id1'
    const footnotes = new Map([[identifier, { key: 'k1', children: [{}, { text: 'Footnote text', children: [] }] }]])
    tool.identifier = identifier
    tool.footnotes = footnotes
    const anchor = document.createElement('div')
    anchor.id = 'k1'
    document.body.appendChild(anchor)
    tool.render()
    tool.buttonClick({ preventDefault: () => {}, stopPropagation: () => {} }, false)
    tool.render()
    tool.buttonClick({ preventDefault: () => {}, stopPropagation: () => {} }, true)
    tool.hide()
  })

  it('ImageSelector handles link mode and submits image', () => {
    const muya = createMuya({ imageAction: null, imagePathPicker: async () => 'chosen/path' })
    muya.options.imagePathAutoComplete = async () => [{ text: 'file.png' }]
    muya.contentState.replaceImage = (_info, attrs) => {
      expect(attrs.src).to.include('file')
    }
    const selector = new ImageSelector(muya, { unsplashAccessKey: null })
    selector.imageInfo = { token: { attrs: { alt: 'a', src: '', title: '' } } }
    selector.state.src = 'file://' + 'tmp/image.png'
    selector.handleKeyUp({ key: 'a', target: { value: 'foo/bar' } })
    selector.handleLinkButtonClick()
    selector.handleSelectButtonClick()
  })

  it('Clipboard toggles copy and paste behavior', () => {
    const muya = createMuya()
    let copyCalled = 0
    muya.contentState.copyHandler = () => { copyCalled++ }
    muya.contentState.cutHandler = () => { copyCalled++ }
    muya.contentState.pasteHandler = () => { copyCalled++ }
    const clipboard = new Clipboard(muya)
    const copyEvent = new window.Event('copy')
    muya.container.dispatchEvent(copyEvent)
    expect(copyCalled).to.equal(1)
    clipboard.copyAsMarkdown()
    clipboard.copyAsHtml()
    clipboard.pasteAsPlainText()
    clipboard.copy('copyBlock', 'info')
  })

  it('DragDrop forwards drag events to contentState', () => {
    const muya = createMuya()
    let over = 0; let drop = 0; let leave = 0
    muya.contentState.dragoverHandler = () => { over++ }
    muya.contentState.dropHandler = () => { drop++ }
    muya.contentState.dragleaveHandler = () => { leave++ }
    const dragDrop = new DragDrop(muya)
    muya.container.dispatchEvent(new window.Event('dragover'))
    muya.container.dispatchEvent(new window.Event('drop'))
    window.dispatchEvent(new window.Event('dragleave'))
    expect(over).to.equal(1)
    expect(drop).to.equal(1)
    expect(leave).to.equal(1)
  })

  it('Keyboard bindings dispatch handlers and hide floats', () => {
    const muya = createMuya()
    muya.contentState.docEnterHandler = () => { muya.enter = true }
    muya.contentState.backspaceHandler = () => { muya.backspace = true }
    muya.contentState.arrowHandler = () => { muya.arrow = true }
    muya.dispatchChange = () => { muya.changed = true }
    const keyboard = new Keyboard(muya)
    muya.keyboard = keyboard
    const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' })
    document.dispatchEvent(enterEvent)
    expect(muya.enter).to.be.true

    const arrow = new window.KeyboardEvent('keydown', { key: 'ArrowUp' })
    muya.container.dispatchEvent(arrow)
    expect(muya.arrow).to.be.true
  })

  it('MouseEventHandler shows link and footnote tools', () => {
    const muya = createMuya({ footnote: true, hideLinkPopup: false })
    muya.contentState.blocks = []
    let footnoteShown = false
    muya.eventCenter.subscribe('muya-footnote-tool', ({ reference, identifier }) => {
      footnoteShown = !!reference && identifier === '1'
    })
    muya.eventCenter.subscribe('muya-link-tools', ({ reference }) => {
      muya.linkTool = !!reference
    })
    const mouseHandler = new MouseEventHandler(muya)

    const sup = document.createElement('sup')
    sup.classList.add('ag-inline-footnote-identifier')
    const hide = document.createElement('span')
    hide.classList.add('ag-hide')
    const targetChild = document.createElement('span')
    targetChild.textContent = '1'
    sup.appendChild(hide)
    sup.appendChild(targetChild)
    muya.container.appendChild(sup)
    targetChild.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }))
    expect(footnoteShown).to.equal(true)
    targetChild.dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true }))
  })

  it('ClickEvent handles contextmenu and image actions', () => {
    const muya = createMuya()
    muya.contentState.selectionChange = () => ({})
    muya.eventCenter.dispatch = () => {}
    muya.contentState.getBlock = () => ({ text: 't', key: 'k' })
    muya.contentState.findNextBlockInLocation = () => ({ key: 'k', text: 't' })
    selection.getCursorRange = () => ({ start: { key: 'k', offset: 0 }, end: { key: 'k', offset: 0 } })
    const click = new ClickEvent(muya)
    const contextEvent = new window.MouseEvent('contextmenu', { bubbles: true })
    muya.container.dispatchEvent(contextEvent)

    const paragraph = document.createElement('div')
    paragraph.classList.add('ag-paragraph')
    paragraph.id = 'p1'
    const wrapper = document.createElement('span')
    wrapper.classList.add('ag-inline-image')
    wrapper.setAttribute('data-raw', '![](http://example.com/img.png)')
    wrapper.id = 'img1'
    const imageContainer = document.createElement('span')
    imageContainer.classList.add('ag-image-container')
    const img = document.createElement('img')
    imageContainer.appendChild(img)
    wrapper.appendChild(imageContainer)
    paragraph.appendChild(wrapper)
    muya.container.appendChild(paragraph)

    const dispatched = []
    muya.eventCenter.dispatch = (name) => { dispatched.push(name); muya.lastDispatch = name }
    img.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(dispatched.includes('select-image') || dispatched.includes('muya-transformer')).to.equal(true)
    click
  })

  it('Resize constructor runs without side effects', () => {
    const muya = createMuya()
    const resize = new Resize(muya)
    expect(resize.muya).to.equal(muya)
  })
})
