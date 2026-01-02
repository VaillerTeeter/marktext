import { expect } from 'chai'
import ContentState from '../../../src/muya/lib/contentState'
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
    eventCenter: { dispatch: createSpy() },
    dispatchSelectionChange: createSpy(),
    dispatchSelectionFormats: createSpy(),
    dispatchChange: createSpy()
  }
}

describe('muya enterCtrl', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('docEnterHandler opens image selector for selected image', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    const rect = { top: 10, left: 0, right: 20, bottom: 30, width: 20, height: 20 }
    const imageWrapper = document.createElement('div')
    imageWrapper.id = 'img1'
    imageWrapper.getBoundingClientRect = () => rect
    document.body.appendChild(imageWrapper)
    cs.selectedImage = { imageId: 'img1', src: 'x.png' }

    const event = { preventDefault: createSpy(), stopPropagation: createSpy() }

    cs.docEnterHandler(event)

    expect(event.preventDefault.callCount).to.equal(1)
    expect(event.stopPropagation.callCount).to.equal(1)
    expect(muya.eventCenter.dispatch.callCount).to.equal(1)
    const [eventName, payload] = muya.eventCenter.dispatch.args
    expect(eventName).to.equal('muya-image-selector')
    expect(payload).to.have.property('reference')
    const updatedRect = payload.reference.getBoundingClientRect()
    expect(updatedRect.height).to.equal(0)
    expect(cs.selectedImage).to.equal(null)
  })

  it('enterHandler updates code language when editing languageInput', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    const block = cs.createBlock('span', { functionType: 'languageInput', text: ' js ' })
    cs.blocks = [block]
    cs.getBlock = () => block
    cs.getParent = () => null
    cs.updateCodeLanguage = createSpy()

    const original = selection.getCursorRange
    selection.getCursorRange = () => ({
      start: { key: block.key, offset: 2 },
      end: { key: block.key, offset: 2 }
    })

    const event = { preventDefault: createSpy(), stopPropagation: createSpy(), shiftKey: false, metaKey: false, ctrlKey: false }

    cs.enterHandler(event)

    expect(event.preventDefault.callCount).to.equal(1)
    expect(cs.updateCodeLanguage.callCount).to.equal(1)
    expect(cs.updateCodeLanguage.args[0]).to.equal(block)
    expect(cs.updateCodeLanguage.args[1]).to.equal('js')

    selection.getCursorRange = original
  })

  it('enterHandler inserts soft line break with indent on Shift+Enter', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    const block = cs.createBlock('span', { functionType: 'paragraphContent', text: '  foo' })
    cs.blocks = [block]
    cs.getBlock = () => block
    cs.getParent = () => ({ type: 'p', parent: null })
    cs.partialRender = createSpy()

    const original = selection.getCursorRange
    selection.getCursorRange = () => ({
      start: { key: block.key, offset: 2 },
      end: { key: block.key, offset: 2 }
    })

    const event = { preventDefault: createSpy(), stopPropagation: createSpy(), shiftKey: true, metaKey: false, ctrlKey: false }

    cs.enterHandler(event)

    expect(block.text).to.equal('  \n  foo')
    expect(cs.cursor.start.offset).to.equal(5)
    expect(cs.partialRender.callCount).to.equal(1)

    selection.getCursorRange = original
  })

  it('docEnterHandler falls back when wrapper missing', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    cs.selectedImage = { imageId: 'nope', src: 'x.png' }

    const event = { preventDefault: createSpy(), stopPropagation: createSpy() }

    cs.docEnterHandler(event)

    expect(event.preventDefault.callCount).to.equal(1)
    expect(event.stopPropagation.callCount).to.equal(1)
    const [eventName, payload] = muya.eventCenter.dispatch.args
    expect(eventName).to.equal('muya-image-selector')
    const rect = payload.reference.getBoundingClientRect()
    expect(rect.top).to.equal(0)
    expect(rect.height).to.equal(0)
    expect(cs.selectedImage).to.equal(null)
  })

  it('enterHandler updates footnote when cursor at end of reference', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    const block = cs.createBlock('span', { functionType: 'paragraphContent', text: '[^ref]:' })
    const parent = { type: 'p', parent: null }
    cs.blocks = [block]
    cs.getBlock = () => block
    cs.getParent = () => parent
    cs.updateFootnote = createSpy()

    const original = selection.getCursorRange
    selection.getCursorRange = () => ({
      start: { key: block.key, offset: block.text.length },
      end: { key: block.key, offset: block.text.length }
    })

    const event = { preventDefault: createSpy(), stopPropagation: createSpy(), shiftKey: false, metaKey: false, ctrlKey: false }

    cs.enterHandler(event)

    expect(event.preventDefault.callCount).to.equal(2)
    expect(event.stopPropagation.callCount).to.equal(1)
    expect(block.text).to.equal('[^ref]: ')
    expect(cs.cursor.start.offset).to.equal(block.text.length)
    expect(cs.updateFootnote.callCount).to.equal(1)
    expect(cs.updateFootnote.args[0]).to.equal(parent)
    expect(cs.updateFootnote.args[1]).to.equal(block)

    selection.getCursorRange = original
  })

  it('enterHandler auto-indents in code content', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    const block = cs.createBlock('span', { functionType: 'codeContent', text: '{}' })
    cs.blocks = [block]
    cs.getBlock = () => block
    cs.getParent = () => ({ type: 'pre' })
    cs.partialRender = createSpy()
    cs.tabSize = 4

    const original = selection.getCursorRange
    selection.getCursorRange = () => ({
      start: { key: block.key, offset: 1 },
      end: { key: block.key, offset: 1 }
    })

    const event = { preventDefault: createSpy(), stopPropagation: createSpy(), shiftKey: false, metaKey: false, ctrlKey: false }

    cs.enterHandler(event)

    expect(block.text).to.equal('{\n    \n}')
    expect(cs.cursor.start.offset).to.equal(6)
    expect(cs.partialRender.callCount).to.equal(1)

    selection.getCursorRange = original
  })

  it('enterHandler inserts br tag in table cell on Shift+Enter', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    const block = cs.createBlock('span', { functionType: 'cellContent', text: 'abc' })
    cs.blocks = [block]
    cs.getBlock = () => block
    cs.getParent = () => ({ type: 'td' })
    cs.partialRender = createSpy()

    const original = selection.getCursorRange
    selection.getCursorRange = () => ({
      start: { key: block.key, offset: 1 },
      end: { key: block.key, offset: 1 }
    })

    const event = { preventDefault: createSpy(), stopPropagation: createSpy(), shiftKey: true, metaKey: false, ctrlKey: false }

    cs.enterHandler(event)

    expect(block.text).to.equal('a<br/>bc')
    expect(cs.cursor.start.offset).to.equal(6)
    expect(cs.partialRender.callCount).to.equal(1)
    expect(cs.partialRender.args[0]).to.deep.equal([block])

    selection.getCursorRange = original
  })
})
