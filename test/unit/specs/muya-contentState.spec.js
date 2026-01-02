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
    dispatchSelectionChange: createSpy(),
    dispatchSelectionFormats: createSpy(),
    dispatchChange: createSpy()
  }
}

describe('muya contentState core', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('creates codeContent blocks with unescaped text', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })

    const block = contentState.createBlock('span', { functionType: 'codeContent', text: 'foo&amp;bar' })

    expect(block.text).to.equal('foo&bar')
    expect(block.functionType).to.equal('codeContent')
  })

  it('copies blocks with new keys and linked children', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    const parent = contentState.createBlock('p')
    const child = contentState.createBlock('span', { text: 'text' })
    contentState.appendChild(parent, child)

    const copied = contentState.copyBlock(parent)

    expect(copied.key).to.not.equal(parent.key)
    expect(copied.children[0].parent).to.equal(copied.key)
    expect(copied.children[0].key).to.not.equal(child.key)
  })

  it('pushes history immediately when cursor moves to a new block', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    const pushSpy = createSpy()
    contentState.history.push = pushSpy

    contentState.cursor = {
      start: { key: 'a', offset: 0 },
      end: { key: 'b', offset: 0 }
    }

    expect(pushSpy.callCount).to.equal(1)
  })

  it('queues pending history when cursor stays within the same block', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    const originalSetTimeout = global.setTimeout
    let scheduled = null
    global.setTimeout = fn => {
      scheduled = fn
      return 0
    }

    let commitCount = 0
    const originalCommit = contentState.history.commitPending.bind(contentState.history)
    contentState.history.commitPending = () => {
      commitCount += 1
      return originalCommit()
    }

    const { start, end } = contentState.cursor
    contentState.cursor = {
      start: { key: start.key, offset: start.offset },
      end: { key: end.key, offset: end.offset }
    }

    expect(contentState.history.pending).to.not.equal(null)
    expect(typeof scheduled).to.equal('function')
    scheduled()
    expect(commitCount).to.equal(1)

    global.setTimeout = originalSetTimeout
  })

  it('replaces word inline, updates cursor, and notifies muya', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    const block = { text: 'hello' }
    const line = {
      start: { key: 'line', offset: 0, block },
      end: { key: 'line', offset: 5, block }
    }
    const wordCursor = {
      start: { key: 'line', offset: 0 },
      end: { key: 'line', offset: 5 }
    }

    contentState.partialRender = createSpy()

    contentState.replaceWordInline(line, wordCursor, 'hi', true)

    expect(block.text).to.equal('hi')
    expect(contentState.cursor.start.offset).to.equal(2)
    expect(contentState.partialRender.callCount).to.equal(1)
    expect(muya.dispatchSelectionChange.callCount).to.equal(1)
    expect(muya.dispatchChange.callCount).to.equal(1)
  })

  it('throws when word cursor spans multiple keys', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    const block = { text: 'hello' }
    const line = {
      start: { key: 'line', offset: 0, block },
      end: { key: 'line', offset: 5, block }
    }
    const wordCursor = {
      start: { key: 'line', offset: 0 },
      end: { key: 'other', offset: 5 }
    }

    expect(() => contentState.replaceWordInline(line, wordCursor, 'hi')).to.throw(/word cursor/i)
  })

  it('returns cursor position reference based on selection coords', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    const original = selection.getCursorCoords
    selection.getCursorCoords = () => ({ x: 10, y: 20, width: 5 })

    const ref = contentState.getPositionReference()
    const rect = ref.getBoundingClientRect()

    expect(rect.top).to.equal(20)
    expect(rect.bottom).to.equal(20 + 16 * 1.5)
    expect(ref.id).to.equal(contentState.cursor.start.key)

    selection.getCursorCoords = original
  })
})

describe('muya contentState history', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  const makeState = key => ({
    blocks: [{ key }],
    renderRange: [null, null],
    cursor: { start: { key, offset: 0 }, end: { key, offset: 0 }, noHistory: true }
  })

  it('pushes, undoes, and triggers render with restored state', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    contentState.render = createSpy()

    contentState.history.push(makeState('a'))
    contentState.history.push(makeState('b'))

    contentState.history.undo()

    expect(contentState.blocks[0].key).to.equal('a')
    expect(contentState.history.index).to.equal(0)
    expect(contentState.render.callCount).to.equal(1)
  })

  it('redos to newer state and clears pending entries', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    contentState.render = createSpy()

    contentState.history.push(makeState('a'))
    contentState.history.push(makeState('b'))
    contentState.history.undo()
    contentState.history.pushPending(makeState('c'))

    contentState.history.redo()

    expect(contentState.blocks[0].key).to.equal('b')
    expect(contentState.history.pending).to.equal(null)
    expect(contentState.render.callCount).to.equal(2)
  })

  it('clears history stack and index', () => {
    const muya = createMuya()
    const contentState = new ContentState(muya, { bulletListMarker: '-' })
    contentState.history.push(makeState('a'))

    contentState.clear()

    expect(contentState.history.stack.length).to.equal(0)
    expect(contentState.history.index).to.equal(-1)
    expect(contentState.history.pending).to.equal(null)
  })
})

describe('muya backspaceCtrl edge cases', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('docBackspaceHandler deletes selected image', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    cs.deleteImage = createSpy()
    cs.selectedImage = { key: 'img' }

    const event = { preventDefault: createSpy(), stopPropagation: () => {} }
    cs.docBackspaceHandler(event)

    expect(cs.deleteImage.callCount).to.equal(1)
    expect(cs.deleteImage.args[0]).to.deep.equal(cs.selectedImage)
    expect(event.preventDefault.callCount).to.equal(1)
  })

  it('docBackspaceHandler deletes selected table cells', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    cs.deleteSelectedTableCells = createSpy()
    cs.selectedTableCells = [{ key: 'cell' }]

    const event = { preventDefault: createSpy(), stopPropagation: createSpy() }

    cs.docBackspaceHandler(event)

    expect(cs.deleteSelectedTableCells.callCount).to.equal(1)
    expect(event.preventDefault.callCount).to.equal(1)
  })

  it('backspaceHandler handles select-all reset', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    cs.isSelectAll = () => true
    cs.init = createSpy()
    muya.contentState = cs

    const original = selection.getCursorRange
    selection.getCursorRange = () => ({ start: { key: 'k', offset: 0 }, end: { key: 'k', offset: 0 } })

    cs.backspaceHandler({ preventDefault: createSpy() })

    expect(cs.blocks.length).to.equal(1)
    expect(cs.init.callCount).to.equal(1)
    expect(muya.dispatchSelectionChange.callCount).to.equal(1)
    expect(muya.dispatchSelectionFormats.callCount).to.equal(1)
    expect(muya.dispatchChange.callCount).to.equal(1)

    selection.getCursorRange = original
  })

  it('backspaceHandler converts single # heading to paragraph', () => {
    const muya = createMuya()
    const cs = new ContentState(muya, { bulletListMarker: '-' })
    const heading = cs.createBlock('span', { functionType: 'atxLine', text: '#' })
    cs.blocks = [heading]
    cs.updateToParagraph = createSpy()
    cs.partialRender = createSpy()

    const original = selection.getCursorRange
    selection.getCursorRange = () => ({
      start: { key: heading.key, offset: 1 },
      end: { key: heading.key, offset: 1 }
    })

    cs.backspaceHandler({ preventDefault: createSpy(), stopPropagation: createSpy() })

    expect(heading.text).to.equal('')
    expect(cs.cursor.start.offset).to.equal(0)
    expect(cs.updateToParagraph.callCount).to.equal(1)

    selection.getCursorRange = original
  })
})
