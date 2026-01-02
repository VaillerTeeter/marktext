import { expect } from 'chai'
import inputCtrl from '../../../src/muya/lib/contentState/inputCtrl'
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

class DummyContentState {
  constructor () {
    this.blocks = []
    this.blockMap = {}
    this.parentMap = {}
    this.cursor = { start: null, end: null }
    this.partialRender = createSpy()
    this.render = createSpy()
    this.checkNeedRender = () => false
    this.checkInlineUpdate = () => false
    this.muya = {
      options: {
        autoPairBracket: true,
        autoPairMarkdownSyntax: true,
        autoPairQuote: true
      },
      container: document.createElement('div'),
      eventCenter: { dispatch: createSpy() },
      dispatchSelectionChange: () => {},
      dispatchSelectionFormats: () => {},
      dispatchChange: () => {}
    }
  }

  createBlock (type, props = {}) {
    const block = { key: props.key || `${type}-${Math.random().toString(36).slice(2, 8)}`, type, children: [], ...props }
    this.blockMap[block.key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children.push(child)
    child.parent = parent.key
    this.parentMap[child.key] = parent
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  getParent (block) {
    return this.parentMap[block.key]
  }

  findOutMostBlock (block) {
    return block
  }

  removeBlocks () {
    this.removed = true
  }

  getPositionReference () {
    return { getBoundingClientRect: () => ({ left: 0, x: 0, top: 0, y: 0, bottom: 0, height: 0, width: 0, right: 0 }) }
  }

  isCollapse () {
    const { start, end } = this.cursor
    return start && end && start.key === end.key && start.offset === end.offset
  }
}

inputCtrl(DummyContentState)

describe('contentState inputCtrl helpers', () => {
  it('checkQuickInsert detects @ prefixes', () => {
    const cs = new DummyContentState()
    const block = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: '@todo' })
    expect(cs.checkQuickInsert(block)).to.equal(true)
    block.text = 'plain'
    expect(cs.checkQuickInsert(block)).to.equal(false)
  })

  it('checkCursorInTokenType detects inline math token', () => {
    const cs = new DummyContentState()
    const block = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: '$a$' })
    expect(cs.checkCursorInTokenType(block.functionType, block.text, 2, 'inline_math')).to.equal(true)
  })

  it('checkNotSameToken compares token counts', () => {
    const cs = new DummyContentState()
    const block = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: '**a**' })
    expect(cs.checkNotSameToken(block.functionType, block.text, 'a')).to.equal(true)
  })
})

describe('contentState inputCtrl inputHandler branches', () => {
  let originalRange
  let originalGetSelection
  beforeEach(() => {
    originalRange = selection.getCursorRange
    originalGetSelection = selection.getSelectionStart
  })

  afterEach(() => {
    selection.getCursorRange = originalRange
    selection.getSelectionStart = originalGetSelection
    document.body.innerHTML = ''
  })

  it('updates code language input and renders', () => {
    const cs = new DummyContentState()
    const langInput = cs.createBlock('span', { type: 'span', functionType: 'languageInput', text: '' })
    const pre = cs.createBlock('pre', { type: 'pre', lang: '' })
    cs.appendChild(pre, langInput)
    cs.blocks = [pre]
    cs.cursor = { start: { key: langInput.key, offset: 0 }, end: { key: langInput.key, offset: 0 } }
    cs.updateCodeLanguage = createSpy()

    const para = document.createElement('div')
    para.id = langInput.key
    para.textContent = 'js'
    document.body.appendChild(para)

    selection.getCursorRange = () => ({ start: { key: langInput.key, offset: 0 }, end: { key: langInput.key, offset: 0 } })
    selection.getSelectionStart = () => para

    const event = { inputType: 'insertText', data: 'j', type: 'input' }
    cs.inputHandler(event)

    expect(pre.lang).to.equal('js')
    expect(cs.partialRender.callCount).to.equal(0)
  })

  it('throttles codeContent edits and triggers partialRender when needed', () => {
    const originalSetTimeout = global.setTimeout
    const originalClearTimeout = global.clearTimeout
    let scheduled
    global.clearTimeout = () => {}
    global.setTimeout = fn => {
      scheduled = fn
      return 1
    }

    const cs = new DummyContentState()
    const code = cs.createBlock('span', { type: 'span', functionType: 'codeContent', text: 'code' })
    cs.blocks = [code]
    cs.cursor = { start: { key: code.key, offset: 4 }, end: { key: code.key, offset: 4 } }

    const para = document.createElement('div')
    para.id = code.key
    para.textContent = 'codeX'
    document.body.appendChild(para)

    selection.getCursorRange = () => ({ start: { key: code.key, offset: 4 }, end: { key: code.key, offset: 4 } })
    selection.getSelectionStart = () => para

    const event = { inputType: 'insertText', data: 'X', type: 'input' }
    cs.inputHandler(event, true)

    // Execute the throttled render immediately
    if (scheduled) scheduled()

    global.setTimeout = originalSetTimeout
    global.clearTimeout = originalClearTimeout

    expect(cs.partialRender.callCount).to.equal(1)
    expect(code.text).to.equal('codeX')
  })

  it('renders when inline tokens change', () => {
    const cs = new DummyContentState()
    const span = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: '**a**' })
    cs.blocks = [span]
    cs.cursor = { start: { key: span.key, offset: 1 }, end: { key: span.key, offset: 1 } }

    const para = document.createElement('div')
    para.id = span.key
    para.textContent = 'a'
    document.body.appendChild(para)

    selection.getCursorRange = () => ({ start: { key: span.key, offset: 1 }, end: { key: span.key, offset: 1 } })
    selection.getSelectionStart = () => para

    cs.inputHandler({ inputType: 'insertText', data: 'a', type: 'input' })
    expect(span.text).to.equal('a')
    expect(cs.partialRender.callCount).to.equal(1)
  })
})
