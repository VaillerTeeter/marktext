import { expect } from 'chai'
import codeBlockCtrl from '../../../src/muya/lib/contentState/codeBlockCtrl'
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

const createMuya = () => ({
  options: {},
  clipboard: { copy: createSpy() }
})

class DummyContentState {
  constructor () {
    this.muya = createMuya()
    this.blocks = []
    this.blockMap = {}
    this.parentMap = {}
    this.cursor = { start: null, end: null }
    this.partialRender = createSpy()
    this.singleRender = createSpy()
    this.isGitlabCompatibilityEnabled = false
    this.updateMathBlock = createSpy()
  }

  createBlock (type, props = {}) {
    const block = {
      key: props.key || `${type}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      children: [],
      ...props
    }
    this.blockMap[block.key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children.push(child)
    child.parent = parent
    this.parentMap[child.key] = parent
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  getParent (block) {
    return this.parentMap[block.key]
  }

  getNextSibling (block) {
    const parent = this.getParent(block)
    if (!parent) return null
    const idx = parent.children.indexOf(block)
    return parent.children[idx + 1] || null
  }
}

codeBlockCtrl(DummyContentState)

const withDomParagraph = id => {
  const para = document.createElement('div')
  para.id = id
  para.classList.add('ag-paragraph')
  document.body.appendChild(para)
  return para
}

describe('contentState codeBlockCtrl', () => {
  let originalGetCursorRange

  beforeEach(() => {
    originalGetCursorRange = selection.getCursorRange
  })

  afterEach(() => {
    selection.getCursorRange = originalGetCursorRange
    document.body.innerHTML = ''
  })

  it('checkEditLanguage returns defaults without cursor', () => {
    const cs = new DummyContentState()
    selection.getCursorRange = () => ({ start: null })
    const result = cs.checkEditLanguage()
    expect(result.lang).to.equal('')
    expect(result.paragraph).to.equal(null)
  })

  it('checkEditLanguage reads languageInput and paragraphContent', () => {
    const cs = new DummyContentState()
    const langBlock = cs.createBlock('span', { functionType: 'languageInput', type: 'span', text: ' js ' })
    cs.blocks = [langBlock]
    withDomParagraph(langBlock.key)
    selection.getCursorRange = () => ({ start: { key: langBlock.key, offset: 2 } })
    expect(cs.checkEditLanguage().lang).to.equal('js')

    const paraChild = cs.createBlock('span', { functionType: 'paragraphContent', type: 'span', text: '```go' })
    const para = cs.createBlock('p', { children: [paraChild] })
    cs.appendChild(para, paraChild)
    cs.blocks = [para]
    withDomParagraph(paraChild.key)
    selection.getCursorRange = () => ({ start: { key: paraChild.key, offset: 4 } })
    const { lang } = cs.checkEditLanguage()
    expect(lang).to.equal('go')
  })

  it('selectLanguage respects math update short-circuit', () => {
    const cs = new DummyContentState()
    cs.isGitlabCompatibilityEnabled = true
    cs.updateMathBlock = () => true
    const paragraph = withDomParagraph('p1')
    cs.selectLanguage(paragraph, 'math')
    expect(cs.partialRender.callCount).to.equal(0)
  })

  it('updateCodeLanguage updates language input branch and cursor', () => {
    const cs = new DummyContentState()
    const pre = cs.createBlock('pre', { functionType: 'fencecode', text: '', lang: 'old' })
    const langBlock = cs.createBlock('span', { functionType: 'languageInput', text: 'old' })
    const codeContent = cs.createBlock('span', { type: 'span', text: 'body', lang: 'old' })
    const code = cs.createBlock('code', { lang: 'old', children: [codeContent] })
    cs.appendChild(pre, langBlock)
    cs.appendChild(pre, code)
    cs.blocks = [pre]

    cs.updateCodeLanguage(langBlock, 'ruby')

    expect(langBlock.text).to.equal('ruby')
    expect(pre.lang).to.equal('ruby')
    expect(code.lang).to.equal('ruby')
    expect(codeContent.lang).to.equal('ruby')
    expect(cs.cursor.start.key).to.equal(codeContent.key)
    expect(cs.partialRender.callCount).to.equal(1)
  })

  it('updateCodeLanguage rewrites paragraph ticks and renders', () => {
    const cs = new DummyContentState()
    const p = cs.createBlock('p', { type: 'p', children: [] })
    const span = cs.createBlock('span', { functionType: 'paragraphContent', type: 'span', text: '```js' })
    cs.appendChild(p, span)
    cs.blocks = [p]

    cs.updateCodeLanguage(span, 'ts')

    expect(span.text).to.equal('```ts')
    const updated = cs.getBlock(p.key)
    expect(updated.type).to.equal('pre')
    expect(cs.cursor.start.offset).to.equal(0)
    expect(cs.partialRender.callCount).to.equal(1)
  })

  it('codeBlockUpdate returns false when block is not p or has multiple children', () => {
    const cs = new DummyContentState()
    const pre = cs.createBlock('pre')
    cs.blocks = [pre]
    expect(cs.codeBlockUpdate(pre)).to.equal(false)

    const p = cs.createBlock('p', { children: [] })
    const a = cs.createBlock('span', { text: 'a' })
    const b = cs.createBlock('span', { text: 'b' })
    cs.appendChild(p, a)
    cs.appendChild(p, b)
    expect(cs.codeBlockUpdate(p)).to.equal(false)
  })

  it('codeBlockUpdate converts paragraph to fence code and sets cursor', () => {
    const cs = new DummyContentState()
    const p = cs.createBlock('p', { children: [] })
    const child = cs.createBlock('span', { text: '```lua' })
    cs.appendChild(p, child)
    cs.blocks = [p]

    const result = cs.codeBlockUpdate(p)

    expect(result).to.equal(true)
    expect(p.type).to.equal('pre')
    expect(p.functionType).to.equal('fencecode')
    expect(cs.cursor.start.offset).to.equal(0)
  })

  it('copyCodeBlock grabs codeContent text', () => {
    const cs = new DummyContentState()
    const pre = cs.createBlock('pre')
    const codeContent = cs.createBlock('span', { text: 'const x = 1;' })
    const code = cs.createBlock('code', { children: [codeContent] })
    cs.appendChild(pre, codeContent) // simulate language input not needed here
    cs.appendChild(pre, code)
    cs.blocks = [pre]

    const preEle = document.createElement('pre')
    preEle.id = pre.key
    document.body.appendChild(preEle)

    const event = { target: { closest: () => preEle } }

    cs.copyCodeBlock(event)

    expect(cs.muya.clipboard.copy.callCount).to.equal(1)
    expect(cs.muya.clipboard.copy.args).to.deep.equal(['copyCodeContent', 'const x = 1;'])
  })
})
