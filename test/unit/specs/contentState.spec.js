import { expect } from 'chai'
import ContentState from '../../../src/muya/lib/contentState'
import History from '../../../src/muya/lib/contentState/history'
import EventCenter from '../../../src/muya/lib/eventHandler/event'
import selection from '../../../src/muya/lib/selection'
import { MUYA_DEFAULT_OPTION, UNDO_DEPTH } from '../../../src/muya/lib/config'

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

const createContext = () => {
  const muya = {
    eventCenter: new EventCenter(),
    dispatchSelectionChange: createSpy(),
    dispatchChange: createSpy(),
    dispatchSelectionFormats: createSpy()
  }
  const options = Object.assign({}, MUYA_DEFAULT_OPTION)
  const contentState = new ContentState(muya, options)
  contentState.partialRender = createSpy()
  contentState.init()
  return { muya, contentState }
}

describe('contentState core', () => {
  it('replaceWordInline updates text, cursor and dispatches', () => {
    const { muya, contentState } = createContext()
    const block = contentState.blocks[0]
    block.text = 'hello world'
    const line = {
      start: { key: block.key, offset: 0, block },
      end: { key: block.key, offset: block.text.length, block }
    }
    const wordCursor = {
      start: { key: block.key, offset: 0, block },
      end: { key: block.key, offset: 5, block }
    }

    contentState.replaceWordInline(line, wordCursor, 'hi', true)

    expect(block.text).to.equal('hi world')
    expect(contentState.cursor.start.offset).to.equal(2)
    expect(contentState.partialRender.callCount).to.equal(1)
    expect(muya.dispatchSelectionChange.callCount).to.equal(1)
    expect(muya.dispatchChange.callCount).to.equal(1)
  })

  it('replaceWordInline validates cursors', () => {
    const { contentState } = createContext()
    const block = contentState.blocks[0]
    block.text = 'text'
    const line = {
      start: { key: block.key, offset: 0, block },
      end: { key: 'other', offset: 4, block }
    }
    const wordCursor = {
      start: { key: block.key, offset: 1, block },
      end: { key: 'other', offset: 3, block }
    }
    expect(() => contentState.replaceWordInline(line, wordCursor, 'x')).to.throw(Error)
  })
})

describe('contentState history', () => {
  it('pushes, trims and replays history with pending entries', () => {
    const renderSpy = createSpy()
    const contentState = { render: renderSpy }
    const history = new History(contentState)
    const base = { blocks: [{ key: '1', text: 'a', children: [] }], cursor: {}, renderRange: [] }

    history.push(base)
    history.push(Object.assign({}, base, { blocks: [{ key: '1', text: 'b', children: [] }] }))
    history.pushPending(Object.assign({}, base, { blocks: [{ key: '1', text: 'c', children: [] }] }))
    history.undo() // commit pending then undo once
    expect(renderSpy.callCount).to.equal(1)

    history.redo()
    expect(renderSpy.callCount).to.equal(2)

    history.stack = new Array(UNDO_DEPTH).fill(base)
    history.index = UNDO_DEPTH - 1
    history.push(base)
    expect(history.stack.length).to.equal(UNDO_DEPTH)
  })
})

describe('contentState marktext spelling', () => {
  let cursorRestore
  let warnRestore

  beforeEach(() => {
    warnRestore = console.warn
    console.warn = createSpy()
  })

  afterEach(() => {
    if (cursorRestore) {
      selection.getCursorRange = cursorRestore
      cursorRestore = null
    }
    console.warn = warnRestore
  })

  it('replaces selected word inline when selection matches', () => {
    const { muya, contentState } = createContext()
    const block = contentState.blocks[0]
    block.text = 'spell test'
    contentState.cursor = {
      start: { key: block.key, offset: 0, block },
      end: { key: block.key, offset: block.text.length, block }
    }

    cursorRestore = selection.getCursorRange
    selection.getCursorRange = () => ({
      start: { key: block.key, offset: 6 },
      end: { key: block.key, offset: 10 }
    })

    const result = contentState._replaceCurrentWordInlineUnsafe('test', 'done')

    expect(result).to.equal(true)
    expect(block.text).to.equal('spell done')
    expect(contentState.partialRender.callCount).to.equal(1)
    expect(muya.dispatchSelectionChange.callCount).to.equal(1)
  })

  it('fails to replace when selected word mismatches', () => {
    const { contentState } = createContext()
    const block = contentState.blocks[0]
    block.text = 'hello world'
    contentState.cursor = {
      start: { key: block.key, offset: 0, block },
      end: { key: block.key, offset: block.text.length, block }
    }

    cursorRestore = selection.getCursorRange
    selection.getCursorRange = () => ({
      start: { key: block.key, offset: 0 },
      end: { key: block.key, offset: 5 }
    })

    const result = contentState._replaceCurrentWordInlineUnsafe('world', 'done')

    expect(result).to.equal(false)
    expect(block.text).to.equal('hello world')
    expect(console.warn.called).to.equal(true)
  })
})

describe('contentState search and replace', () => {
  it('searches, highlights, finds next, and replaces text', () => {
    const { contentState } = createContext()
    const block = contentState.blocks[0]
    block.text = 'foo bar foo'
    block.children = []

    const matches = contentState.search('foo', { isCaseSensitive: true })
    expect(matches.length).to.equal(2)
    expect(contentState.cursor.start.offset).to.equal(0)
    expect(contentState.cursor.end.offset).to.equal(3)

    contentState.find('next')
    expect(contentState.searchMatches.index).to.equal(1)
    expect(contentState.cursor.start.offset).to.equal(8)

    const match = contentState.searchMatches.matches[0]
    contentState.replaceOne(match, 'FOO')
    expect(block.text.startsWith('FOO')).to.equal(true)
  })

  it('replaces with regex groups when requested', () => {
    const { contentState } = createContext()
    const block = contentState.blocks[0]
    block.text = 'abc123'
    block.children = []

    contentState.searchMatches = {
      matches: [{ key: block.key, start: 0, end: 3, match: 'abc', subMatches: ['ab'] }],
      value: 'abc',
      index: 0
    }

    contentState.replace('$0-$1', { isSingle: true, isRegexp: true, isWholeWord: false })
    expect(block.text.startsWith('abc-ab')).to.equal(true)
  })
})
