import { expect } from 'chai'
import selection from '../../../src/muya/lib/selection'
import Cursor from '../../../src/muya/lib/selection/cursor'
import {
  getCursorPositionWithinMarkedText,
  getOffsetOfParagraph,
  getTextContent,
  findNearestParagraph,
  findOutMostParagraph,
  traverseUp,
  getFirstSelectableLeafNode,
  getClosestBlockContainer,
  getCursorPositionWithinMarkedText as getCursorPosition,
  compareParagraphsOrder,
  isAganippeParagraph,
  isMuyaEditorElement
} from '../../../src/muya/lib/selection/dom'
import { CLASS_OR_ID } from '../../../src/muya/lib/config'

describe('muya selection helpers', () => {
  afterEach(() => {
    const sel = window.getSelection()
    if (sel) sel.removeAllRanges()
    document.body.innerHTML = ''
  })

  it('imports a selection into a root element', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    root.textContent = 'abcdef'
    document.body.appendChild(root)

    instance.importSelection({ start: 1, end: 4 }, root)

    const range = instance.getSelectionRange()
    expect(range.startContainer).to.equal(root.firstChild)
    expect(range.startOffset).to.equal(1)
    expect(range.endOffset).to.equal(4)
  })

  it('finds matching selection parent via traverse', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    const para = document.createElement('p')
    root.appendChild(para)
    document.body.appendChild(root)

    const range = document.createRange()
    range.setStart(para, 0)
    range.collapse(true)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    const result = instance.findMatchingSelectionParent(el => el.tagName === 'P', window)
    expect(result).to.equal(para)
  })

  it('moves cursor past empty blocks when importing selection', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    const first = document.createElement('p')
    const second = document.createElement('p')
    second.textContent = 'target'
    root.appendChild(first)
    root.appendChild(second)
    document.body.appendChild(root)

    const range = document.createRange()
    range.setStart(first, 0)
    range.collapse(true)

    const moved = instance.importSelectionMoveCursorPastBlocks(root, 1, range)
    expect(moved.startContainer.textContent).to.contain('target')
    expect(moved.startOffset).to.equal(0)
  })

  it('imports selection with emptyBlocksIndex option', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    const p1 = document.createElement('p')
    const p2 = document.createElement('p')
    p2.textContent = 'target'
    root.appendChild(p1)
    root.appendChild(p2)
    document.body.appendChild(root)

    instance.importSelection({ start: 0, end: 0, emptyBlocksIndex: 1 }, root)
    const range = instance.getSelectionRange()
    expect(range.startContainer.textContent).to.equal('target')
  })

  it('imports selection with trailing images', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    const text = document.createTextNode('a')
    const img = document.createElement('img')
    root.appendChild(text)
    root.appendChild(img)
    document.body.appendChild(root)

    instance.importSelection({ start: 0, end: 0, trailingImageCount: 1 }, root)
    const range = instance.getSelectionRange()
    expect(range.endContainer).to.equal(root)
    expect(range.endOffset).to.equal(2)
  })

  it('moves cursor past anchor edge when favoring later anchor', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    const link = document.createElement('a')
    link.textContent = 'abc'
    root.appendChild(link)
    document.body.appendChild(root)

    const range = document.createRange()
    range.setStart(link.firstChild, link.firstChild.length)
    range.collapse(true)
    const moved = instance.importSelectionMoveCursorPastAnchor({ start: 3, end: 3 }, range)
    expect(moved.startContainer).to.equal(root)
  })

  it('chops HTML by cursor with marker awareness', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    root.textContent = '**bold**plain'
    document.body.appendChild(root)

    const range = document.createRange()
    range.setStart(root.firstChild, 3)
    range.collapse(true)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    const { pre, post } = instance.chopHtmlByCursor(root)
    expect(pre).to.equal('**b**')
    expect(post).to.equal('**old**plain')
  })

  it('handles left/right cursor positions inside markers', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    root.textContent = '**bold**'
    document.body.appendChild(root)

    // left boundary
    let range = document.createRange()
    range.setStart(root.firstChild, 2)
    range.collapse(true)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    const left = instance.chopHtmlByCursor(root)
    expect(left.pre).to.equal('')
    expect(left.post).to.equal('**bold**')

    // right boundary
    range = document.createRange()
    range.setStart(root.firstChild, 6)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    const right = instance.chopHtmlByCursor(root)
    expect(right.pre.endsWith('**')).to.equal(true)
  })

  it('orders cursor start and end by document position', () => {
    const p1 = document.createElement('p')
    p1.id = 'p1'
    const p2 = document.createElement('p')
    p2.id = 'p2'
    document.body.appendChild(p1)
    document.body.appendChild(p2)

    const cursor = new Cursor({
      anchor: { key: 'p2', offset: 2 },
      focus: { key: 'p1', offset: 1 }
    })

    expect(cursor.start.key).to.equal('p1')
    expect(cursor.end.key).to.equal('p2')
  })

  it('cursor respects same paragraph offsets', () => {
    const cursor = new Cursor({
      anchor: { key: 'p', offset: 2 },
      focus: { key: 'p', offset: 1 }
    })
    expect(cursor.start.offset).to.equal(1)
    expect(cursor.end.offset).to.equal(2)
  })

  it('finds cursor position inside marked text', () => {
    const marked = '**bold**text'
    const position = getCursorPositionWithinMarkedText(marked, 3)

    expect(position.type).to.equal('IN')
    expect(position.info).to.equal('**')
  })

  it('getSelectionHtml clones ranges', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    const span = document.createElement('span')
    span.textContent = 'hello'
    root.appendChild(span)
    document.body.appendChild(root)

    const range = document.createRange()
    range.selectNodeContents(span)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    const html = instance.getSelectionHtml()
    expect(html).to.equal('hello')
  })

  it('clearSelection collapses to start/end', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const text = document.createTextNode('abcd')
    document.body.appendChild(text)
    const range = document.createRange()
    range.setStart(text, 1)
    range.setEnd(text, 3)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    instance.clearSelection(true)
    expect(sel.anchorOffset).to.equal(1)
    instance.clearSelection(false)
    expect(sel.anchorOffset).to.equal(sel.focusOffset)
  })

  it('select helpers wrap range creation and start/end getters', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const para = document.createElement('span')
    para.classList.add('ag-paragraph')
    para.id = 'pselect'
    const text = document.createTextNode('hello')
    para.appendChild(text)
    document.body.appendChild(para)

    const range = instance.select(text, 1, text, 3)
    expect(range.startOffset).to.equal(1)
    expect(range.endOffset).to.equal(3)
    expect(instance.getSelectionStart()).to.equal(para)
    expect(instance.getSelectionEnd()).to.equal(para)

    instance.selectNode(para)
    const sel = window.getSelection()
    expect(sel.anchorNode).to.equal(para)

    instance.moveCursor(text, 0)
    expect(sel.anchorOffset).to.equal(0)
  })

  it('traverseUp returns matching ancestor and stops at editor root', () => {
    const editor = document.createElement('div')
    editor.id = CLASS_OR_ID.AG_EDITOR_ID
    const para = document.createElement('p')
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    const span = document.createElement('span')
    para.appendChild(span)
    editor.appendChild(para)
    document.body.appendChild(editor)

    const match = traverseUp(span, el => el === para)
    expect(match).to.equal(para)
  })

  it('computes offsets within paragraph tree', () => {
    const paragraph = document.createElement('p')
    const strong = document.createElement('strong')
    strong.textContent = 'hello'
    paragraph.appendChild(document.createTextNode('a'))
    paragraph.appendChild(strong)
    paragraph.appendChild(document.createTextNode('b'))
    document.body.appendChild(paragraph)

    const offset = getOffsetOfParagraph(strong.firstChild, paragraph)
    expect(offset).to.equal(1)
  })

  it('getCaretOffsets and selectRange utilities', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const root = document.createElement('div')
    const text = document.createTextNode('abc')
    root.appendChild(text)
    document.body.appendChild(root)

    const range = document.createRange()
    range.setStart(text, 1)
    range.setEnd(text, 2)
    instance.selectRange(range)
    const offsets = instance.getCaretOffsets(root, range)
    expect(offsets.left).to.equal(2)
    expect(offsets.right).to.equal(1)
  })

  it('getCursorRange normalizes invalid nodes and image containers', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const editor = document.createElement('div')
    editor.id = CLASS_OR_ID.AG_EDITOR_ID
    const p = document.createElement('span')
    p.classList.add('ag-paragraph')
    p.id = 'pimg'
    const imageWrapper = document.createElement('span')
    imageWrapper.classList.add('ag-inline-image')
    const container = document.createElement('span')
    container.classList.add('ag-image-container')
    const img = document.createElement('img')
    container.appendChild(img)
    imageWrapper.appendChild(container)
    p.appendChild(imageWrapper)
    editor.appendChild(p)
    document.body.appendChild(editor)

    const range = document.createRange()
    range.setStart(container, 0)
    range.collapse(true)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    const cursorRange = instance.getCursorRange()
    expect(cursorRange.anchor.key).to.equal('pimg')
  })

  it('getCursorCoords falls back to parent rects', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const span = document.createElement('span')
    span.textContent = 'x'
    document.body.appendChild(span)
    const range = document.createRange()
    range.setStart(span.firstChild, 0)
    range.collapse(true)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    const coords = instance.getCursorCoords()
    expect(coords).to.have.keys(['x', 'y', 'width'])
  })

  it('getCursorYOffset returns offsets relative to paragraph', () => {
    const SelectionClass = selection.constructor
    const instance = new SelectionClass(document)
    const para = document.createElement('p')
    para.classList.add('ag-paragraph')
    para.id = 'yoff'
    para.style.lineHeight = '20px'
    para.textContent = 'line'
    document.body.appendChild(para)

    const range = document.createRange()
    range.setStart(para.firstChild, 0)
    range.collapse(true)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    const { topOffset, bottomOffset } = instance.getCursorYOffset(para)
    expect(topOffset).to.be.at.least(0)
    expect(bottomOffset).to.be.at.least(0)
  })

  it('getTextContent handles inline image raw value', () => {
    const inline = document.createElement('span')
    inline.classList.add(CLASS_OR_ID.AG_INLINE_IMAGE)
    inline.setAttribute('data-raw', '![img](url)')
    const container = document.createElement('span')
    container.classList.add('ag-image-container')
    const img = document.createElement('img')
    container.appendChild(img)
    container.appendChild(document.createTextNode('tail'))
    inline.appendChild(container)
    const txt = document.createTextNode('after')
    inline.appendChild(txt)
    const content = getTextContent(inline, [CLASS_OR_ID.AG_MATH_RENDER])
    expect(content).to.equal('![img](url)tail')
  })

  it('finds nearest and outer paragraphs and traversal stops at editor root', () => {
    const editor = document.createElement('div')
    editor.id = CLASS_OR_ID.AG_EDITOR_ID
    const para = document.createElement('p')
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    const child = document.createElement('span')
    para.appendChild(child)
    editor.appendChild(para)
    document.body.appendChild(editor)

    expect(findNearestParagraph(child)).to.equal(para)
    expect(findOutMostParagraph(child)).to.equal(para)
    expect(isAganippeParagraph(para)).to.equal(true)
    expect(isMuyaEditorElement(editor)).to.equal(true)
    const stop = traverseUp(child, el => el.id === 'nope')
    expect(stop).to.equal(false)
  })

  it('gets first selectable leaf and closest block container', () => {
    const root = document.createElement('div')
    const block = document.createElement('p')
    const span = document.createElement('span')
    span.appendChild(document.createTextNode('text'))
    block.appendChild(span)
    root.appendChild(block)
    document.body.appendChild(root)

    const leaf = getFirstSelectableLeafNode(block)
    expect(leaf.textContent).to.equal('text')
    expect(getClosestBlockContainer(span)).to.equal(block)
  })

  it('marks cursor positions within marked text across states', () => {
    const marked = '**bold**'
    expect(getCursorPosition(marked, 2).type).to.equal('LEFT')
    expect(getCursorPosition(marked, 6).type).to.equal('RIGHT')
    expect(getCursorPosition('plain', 2).type).to.equal('OUT')
  })

  it('compares paragraph order', () => {
    const p1 = document.createElement('p')
    const p2 = document.createElement('p')
    document.body.appendChild(p1)
    document.body.appendChild(p2)
    expect(!!compareParagraphsOrder(p1, p2)).to.equal(true)
  })
})
