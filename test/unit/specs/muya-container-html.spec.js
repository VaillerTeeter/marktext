import { expect } from 'chai'
import ContentState from '../../../src/muya/lib/contentState'
import { VOID_HTML_TAGS } from '../../../src/muya/lib/config'

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
    blur: () => {}
  }
}

describe('muya containerCtrl', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('createContainerBlock builds pre/preview and trims value', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-', isGitlabCompatibilityEnabled: false })
    const figure = cs.createContainerBlock('flowchart', '   digraph {}')

    expect(figure.type).to.equal('figure')
    expect(figure.functionType).to.equal('flowchart')
    const pre = figure.children[0]
    const preview = figure.children[1]
    expect(pre.type).to.equal('pre')
    expect(pre.children[0].children[0].text).to.equal('digraph {}')
    expect(preview.type).to.equal('div')
    expect(preview.editable).to.equal(false)
  })

  it('initContainerBlock sets up math block and returns first line', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-', isGitlabCompatibilityEnabled: true })
    const paragraph = cs.createBlockP('')
    const firstLine = cs.initContainerBlock('multiplemath', paragraph)

    expect(paragraph.type).to.equal('figure')
    expect(paragraph.functionType).to.equal('multiplemath')
    expect(paragraph.mathStyle).to.equal(undefined)
    expect(firstLine.functionType).to.equal('codeContent')
  })

  it('updateMathBlock converts fenced math and focuses first line', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-', isGitlabCompatibilityEnabled: true })
    const span = cs.createBlock('span', { functionType: 'paragraphContent', text: '```math content' })
    cs.blocks = [span]
    cs.partialRender = createSpy()

    const result = cs.updateMathBlock(span)

    expect(result).to.equal(span.children[0].children[0].children[0])
    expect(span.type).to.equal('figure')
    expect(span.functionType).to.equal('multiplemath')
    expect(span.mathStyle).to.equal('gitlab')
    expect(cs.cursor.start.key).to.equal(result.key)
    expect(cs.cursor.start.offset).to.equal(0)
    expect(cs.partialRender.callCount).to.equal(1)
  })

  it('updateMathBlock converts $$ paragraph into math block with empty style', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-', isGitlabCompatibilityEnabled: false })
    const p = cs.createBlockP('$$')
    cs.blocks = [p]
    cs.partialRender = createSpy()

    const result = cs.updateMathBlock(p)

    expect(result.functionType).to.equal('codeContent')
    expect(p.type).to.equal('figure')
    expect(p.functionType).to.equal('multiplemath')
    expect(p.mathStyle).to.equal('')
    expect(cs.partialRender.callCount).to.equal(0)
  })

  it('handleContainerBlockClick moves cursor to first line and renders', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-' })
    const figure = cs.createContainerBlock('mermaid', 'graph TD')
    cs.blocks = [figure]
    cs.partialRender = createSpy()

    const element = { id: figure.key }
    cs.handleContainerBlockClick(element)

    const expected = figure.children[0].children[0].children[0]
    expect(cs.cursor.start.key).to.equal(expected.key)
    expect(cs.cursor.start.offset).to.equal(0)
    expect(cs.partialRender.callCount).to.equal(1)
  })
})

describe('muya htmlBlock', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  beforeEach(() => {
    if (typeof VOID_HTML_TAGS.indexOf !== 'function') {
      VOID_HTML_TAGS.indexOf = () => -1
    }
  })

  it('initHtmlBlock wraps plain text with div', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-' })
    const block = cs.createBlockP('plain text')
    const pre = cs.initHtmlBlock(block)

    expect(block.type).to.equal('figure')
    expect(block.functionType).to.equal('html')
    expect(block.text).to.equal('<div>\nplain text\n</div>')
    expect(pre.type).to.equal('pre')
    expect(block.children[1].type).to.equal('div')
  })

  it('updateHtmlBlock converts single html tag paragraphs', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-' })
    const block = cs.createBlockP('<div>')

    const pre = cs.updateHtmlBlock(block)

    expect(pre.type).to.equal('pre')
    expect(block.type).to.equal('figure')
    expect(block.functionType).to.equal('html')
    expect(block.children[1].type).to.equal('div')
  })

  it('updateHtmlBlock ignores non-text blocks or void tags', () => {
    const cs = new ContentState(createMuya(), { bulletListMarker: '-' })
    const spanBlock = cs.createBlock('span', { functionType: 'paragraphContent', text: '<br>' })
    const pBlock = cs.createBlockP('<br>')

    expect(cs.updateHtmlBlock(spanBlock)).to.equal(false)
    expect(cs.updateHtmlBlock(pBlock)).to.equal(false)
  })
})
