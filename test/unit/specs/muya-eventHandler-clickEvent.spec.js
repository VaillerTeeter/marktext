import { expect } from 'chai'
import ClickEvent from '../../../src/muya/lib/eventHandler/clickEvent'
import selection from '../../../src/muya/lib/selection'

describe('muya/lib/eventHandler/clickEvent', () => {
  let muya
  let attached = {}
  beforeEach(() => {
    attached = {}
    muya = {
      container: document.createElement('div'),
      eventCenter: {
        attachDOMEvent: (target, name, handler) => {
          attached[name] = handler
        },
        dispatch: () => {}
      },
      contentState: {
        selectedImage: null,
        selectedTableCells: null,
        selectionChange: () => ({}),
        tableToolBarClick: () => {},
        deleteImage: () => {},
        copyCodeBlock: () => {},
        selectImageCalled: false,
        selectImage: function () { this.selectImageCalled = true },
        handleContainerBlockClick: () => {},
        listItemCheckBoxClick: () => {},
        clickHandler: () => {},
        getBlock: () => ({ type: 'p', text: '' }),
        findNextBlockInLocation: () => null
      },
      keyboard: { hideAllFloatTools: () => {} }
    }
    // stub selection helpers
    selection.getCursorRange = () => ({ start: { key: 'a', offset: 0 }, end: { key: 'a', offset: 0 } })
    selection.setCursorRange = () => {}
  })

  it('attaches handlers and handles contextmenu', () => {
    const handler = new ClickEvent(muya)
    expect(attached.contextmenu).to.be.a('function')
    // call contextmenu with a dummy event
    const evt = { preventDefault: () => {}, stopPropagation: () => {}, target: document.createElement('div') }
    attached.contextmenu(evt)
  })

  it('handles code copy flow', () => {
    const ce = new ClickEvent(muya)
    expect(ce).to.be.ok
    const click = attached.click
    // simulate code copy target
    const codeCopyTarget = {
      closest: (sel) => sel === '.ag-code-copy' ? {} : null,
      stopPropagation: () => {},
      preventDefault: () => {},
      classList: { contains: () => false }
    }
    click({ target: codeCopyTarget, preventDefault: () => {}, stopPropagation: () => {} })
  })

  it('handles image click flows', () => {
    const ce = new ClickEvent(muya)
    expect(ce).to.be.ok
    const click = attached.click
    // simulate image select target
    const imageWrapper = document.createElement('div')
    imageWrapper.className = 'ag-inline-image'
    imageWrapper.id = 'img1'
    imageWrapper.setAttribute('data-raw', '![alt](src)')
    // wrap inside a paragraph so findNearestParagraph can find it
    const paragraph = document.createElement('div')
    paragraph.className = 'ag-paragraph'
    paragraph.id = 'para1'
    const img = document.createElement('img')
    imageWrapper.appendChild(img)
    const target = img
    // monkey patch closest to find wrapper
    target.closest = (sel) => sel === '.ag-inline-image' ? imageWrapper : null
    // add inner container to query
    const container = document.createElement('div')
    container.className = 'ag-image-container'
    imageWrapper.appendChild(container)
    // append to document so querySelector can find by id if needed
    paragraph.appendChild(imageWrapper)
    document.body.appendChild(paragraph)

    click({ target, preventDefault: () => {}, stopPropagation: () => {} })
    // ensure contentState.selectImage was called
    expect(muya.contentState.selectImageCalled).to.be.true

    // cleanup
    document.body.removeChild(paragraph)
  })
})
