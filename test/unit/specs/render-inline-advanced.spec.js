import { expect } from 'chai'

const configPath = require.resolve('../../../src/muya/lib/config')
const utilsPath = require.resolve('../../../src/muya/lib/utils')
const dompurifyPath = require.resolve('../../../src/muya/lib/utils/dompurify')
const snabbdomPath = require.resolve('../../../src/muya/lib/parser/render/snabbdom')

describe('Render inline extensions (additional)', () => {
  const originals = {}
  let footnoteIdentifier
  let hardLineBreak
  let hr
  let htmlEscape
  let htmlRuby
  let htmlTag
  let multipleMath
  let referenceDefinition
  let referenceImage
  let referenceLink

  const h = (sel, data = {}, children = []) => {
    const node = { sel, data: {}, attrs: {}, props: {}, dataset: {}, children: [] }
    if (Array.isArray(data) || typeof data === 'string') {
      node.children = Array.isArray(data) ? data : [data]
    } else {
      node.data = data
      node.attrs = data.attrs || {}
      node.props = data.props || {}
      node.dataset = data.dataset || {}
      node.children = children || []
    }
    return node
  }

  const baseCtx = () => {
    const labels = new Map([
      ['ref', { href: 'http://link', title: 't' }],
      ['[ref]', { href: 'http://link', title: 't' }],
      ['image', { href: 'http://example.com/img', title: 'img-title' }]
    ])
    return {
      labels,
      getClassName: (outer, _b, _t, _c) => outer || 'cls',
      highlight: (_h, block, s, e) => [block.text.slice(s, e)],
      backlashInToken: (_h, content, cls, start) => [{ backlash: content, cls, start }],
      htmlRuby: function (...args) { return htmlRuby.call(this, ...args) },
      image: function (...args) { this.imageCalled = args },
      loadImageAsync: (info, _opts, cls) => ({ id: 'img1', isSuccess: !!info.src, domsrc: info.src || 'fallback', className: cls })
    }
  }

  before(() => {
    originals.config = require.cache[configPath]
    originals.utils = require.cache[utilsPath]
    originals.dompurify = require.cache[dompurifyPath]
    originals.snabbdom = require.cache[snabbdomPath]

    const CLASS_OR_ID = {
      AG_INLINE_FOOTNOTE_IDENTIFIER: 'ag-footnote-id',
      AG_INLINE_RULE: 'ag-inline-rule',
      AG_REMOVE: 'ag-remove',
      AG_HARD_LINE_BREAK: 'ag-hard',
      AG_HARD_LINE_BREAK_SPACE: 'ag-hard-space',
      AG_LINE_END: 'ag-line-end',
      AG_GRAY: 'ag-gray',
      AG_HTML_ESCAPE: 'ag-html-escape',
      AG_RUBY: 'ag-ruby',
      AG_RUBY_RENDER: 'ag-ruby-render',
      AG_RUBY_TEXT: 'ag-ruby-text',
      AG_HTML_TAG: 'ag-html-tag',
      AG_HIDE: 'ag-hide',
      AG_RAW_HTML: 'ag-raw',
      AG_OUTPUT_REMOVE: 'ag-output-remove',
      AG_REFERENCE_MARKER: 'ag-ref-marker',
      AG_REFERENCE_LABEL: 'ag-ref-label',
      AG_REFERENCE_TITLE: 'ag-ref-title',
      AG_IMAGE_MARKED_TEXT: 'ag-image-mark',
      AG_COPY_REMOVE: 'ag-copy-remove',
      AG_IMAGE_FAIL: 'ag-image-fail',
      AG_REFERENCE_LINK: 'ag-ref-link'
    }

    require.cache[configPath] = { exports: { __esModule: true, CLASS_OR_ID, BLOCK_TYPE6: ['div', 'section'] } }
    require.cache[utilsPath] = {
      exports: {
        __esModule: true,
        snakeToCamel: str => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
        getImageInfo: href => ({ src: href }),
        sanitize: () => true
      }
    }
    require.cache[dompurifyPath] = {
      exports: {
        __esModule: true,
        default: str => !str.includes('embed'),
        isValidAttribute: () => true
      }
    }
    require.cache[snabbdomPath] = {
      exports: { __esModule: true, htmlToVNode: raw => ({ sel: 'ruby', raw }) }
    }

    footnoteIdentifier = require('../../../src/muya/lib/parser/render/renderInlines/footnoteIdentifier').default
    hardLineBreak = require('../../../src/muya/lib/parser/render/renderInlines/hardLineBreak').default
    hr = require('../../../src/muya/lib/parser/render/renderInlines/hr').default
    htmlEscape = require('../../../src/muya/lib/parser/render/renderInlines/htmlEscape').default
    htmlRuby = require('../../../src/muya/lib/parser/render/renderInlines/htmlRuby').default
    htmlTag = require('../../../src/muya/lib/parser/render/renderInlines/htmlTag').default
    multipleMath = require('../../../src/muya/lib/parser/render/renderInlines/multipleMath').default
    referenceDefinition = require('../../../src/muya/lib/parser/render/renderInlines/referenceDefinition').default
    referenceImage = require('../../../src/muya/lib/parser/render/renderInlines/referenceImage').default
    referenceLink = require('../../../src/muya/lib/parser/render/renderInlines/referenceLink').default
  })

  after(() => {
    const restore = (path, original) => {
      if (original) {
        require.cache[path] = original
      } else {
        delete require.cache[path]
      }
    }
    restore(configPath, originals.config)
    restore(utilsPath, originals.utils)
    restore(dompurifyPath, originals.dompurify)
    restore(snabbdomPath, originals.snabbdom)
  })

  it('renders footnote identifier', () => {
    const ctx = baseCtx()
    const block = { text: '[^a]' }
    const token = { marker: '[', content: 'a', range: { start: 0, end: 4 } }
    const res = footnoteIdentifier.call(ctx, h, { start: {}, end: {} }, block, token, 'x')
    expect(res[0].sel).to.contain('noteref-a')
    expect(res[0].children).to.have.length(3)
  })

  it('renders hard line break for mid and end positions', () => {
    const tokenMid = { spaces: '  ', lineBreak: '\n', isAtEnd: false }
    const mid = hardLineBreak(h, {}, { text: '' }, tokenMid)
    expect(mid[0].children[0].sel).to.include('ag-hard-line-break-space')

    const tokenEnd = { spaces: '  ', lineBreak: '\n', isAtEnd: true }
    const end = hardLineBreak(h, {}, { text: '' }, tokenEnd)
    expect(end[1].sel).to.include('ag-line-end')
  })

  it('renders hr and multiple math', () => {
    const block = { text: '---' }
    const token = { range: { start: 0, end: 3 } }
    const grayHr = hr.call(baseCtx(), h, {}, block, token)
    expect(grayHr[0].sel).to.include('ag-gray')

    const mm = multipleMath.call(baseCtx(), h, {}, block, token)
    expect(mm[0].sel).to.include('ag-gray')
  })

  it('renders html escape with mapped character', () => {
    const ctx = baseCtx()
    const block = { text: '&lt;' }
    const token = { escapeCharacter: '&lt;', range: { start: 0, end: 4 } }
    const res = htmlEscape.call(ctx, h, {}, block, token)
    expect(res[0].dataset.character).to.exist
    expect(res[0].sel).to.include('ag-html-escape')
  })

  it('renders ruby with and without children', () => {
    const ctx = baseCtx()
    const block = { text: 'ruby' }
    const tokenWith = { raw: '<ruby>x</ruby>', children: ['x'], range: { start: 0, end: 4 } }
    const rich = htmlRuby.call(ctx, h, {}, block, tokenWith, 'outer')
    expect(rich[0].children[1].sel).to.include('ag-ruby-render')

    const tokenPlain = { raw: '<ruby>x</ruby>', children: '', range: { start: 0, end: 4 } }
    const plain = htmlRuby.call(ctx, h, {}, block, tokenPlain, 'outer')
    expect(plain[0].children).to.have.length(1)
  })

  it('renders html tags across branches', () => {
    const ctx = baseCtx()
    ctx.hr = (...args) => hr.call(ctx, ...args)

    const imgToken = { tag: 'img', openTag: '<img>', closeTag: '', children: null, attrs: {}, range: { start: 0, end: 5 } }
    htmlTag.call(ctx, h, {}, { text: '<img>' }, imgToken)
    expect(ctx.imageCalled).to.exist

    const brToken = { tag: 'br', openTag: '<br>', closeTag: '</br>', children: null, attrs: {}, range: { start: 0, end: 4 } }
    const brRes = htmlTag.call(ctx, h, {}, { text: '<br>' }, brToken)
    expect(brRes[0].children[1].sel).to.equal('br')

    const voidToken = { tag: 'hr', openTag: '<hr>', closeTag: '', children: null, attrs: {}, range: { start: 0, end: 4 } }
    const voidRes = htmlTag.call(ctx, h, {}, { text: '<hr>' }, voidToken)
    expect(voidRes[0].sel).to.include('ag-html-tag')

    const rubyToken = { tag: 'ruby', openTag: '<ruby>', closeTag: '</ruby>', children: ['x'], attrs: {}, range: { start: 0, end: 11 }, raw: '<ruby>x</ruby>' }
    const rubyRes = htmlTag.call(ctx, h, {}, { text: '<ruby>x</ruby>' }, rubyToken)
    expect(rubyRes[0].sel).to.include('ag-ruby')

    const blockToken = {
      tag: 'div', openTag: '<div>', closeTag: '</div>', children: [{ type: 'hr', range: { start: 0, end: 3 } }],
      attrs: { id: 'd1', class: 'c1 c2', title: 't' }, raw: '<div></div>', range: { start: 0, end: 11 }
    }
    const blockRes = htmlTag.call(ctx, h, {}, { text: '<div></div>' }, blockToken)
    expect(blockRes[1].sel).to.match(/span\.ag-inline-rule/)
    expect(blockRes[1].data.dataset.raw).to.equal('<div></div>')

    const safeToken = {
      tag: 'custom', openTag: '<custom>', closeTag: '</custom>', children: [],
      attrs: { id: 'cid', class: 'cx', title: 'safe' }, raw: '<custom></custom>', range: { start: 0, end: 15 }
    }
    const safeRes = htmlTag.call(ctx, h, {}, { text: '<custom></custom>' }, safeToken)
    expect(safeRes[1].sel.includes('custom') || safeRes[1].sel.startsWith('span')).to.equal(true)
    expect(safeRes[1].data.attrs.title).to.equal('safe')
  })

  it('renders reference definition with markers and title', () => {
    const ctx = baseCtx()
    const block = { text: '[ref]: http://a "title"' }
    const token = {
      leftBracket: '[',
      label: 'ref',
      backlash: '',
      titleMarker: '"',
      title: 'title',
      rightTitleSpace: '',
      range: { start: 0, end: block.text.length }
    }
    const res = referenceDefinition.call(ctx, h, {}, block, token)
    expect(res.map(n => n.sel || n.cls)).to.have.length(6)
  })

  it('renders reference image for success and failure', () => {
    const ctx = baseCtx()
    const block = { text: '![image]' }
    const success = referenceImage.call(ctx, h, {}, block, { label: 'image', backlash: { second: '' }, alt: 'alt', range: { start: 0, end: 8 } })
    expect(success).to.have.length(2)
    expect(success[1].sel).to.equal('img.ag-copy-remove')

    ctx.labels.set('fail', { href: '', title: '' })
    const failure = referenceImage.call(ctx, h, {}, block, { label: 'fail', backlash: { second: '' }, alt: 'alt', range: { start: 0, end: 6 } })
    expect(failure[0].sel).to.include('ag-image-fail')
  })

  it('renders reference links (short and full)', () => {
    const ctx = baseCtx()
    ctx.referenceDefinition = referenceDefinition
    ctx.hr = (...args) => hr.call(ctx, ...args)
    const block = { text: '[ref][ref]' }
    const shortToken = {
      anchor: 'ref', children: [], backlash: { first: '', second: '' }, isFullLink: false, label: 'ref', range: { start: 0, end: 10 }, raw: '[ref][ref]'
    }
    const short = referenceLink.call(ctx, h, {}, block, shortToken)
    expect(short[1].sel.startsWith('a')).to.equal(true)

    const fullToken = {
      anchor: 'ref', children: [], backlash: { first: '', second: '' }, isFullLink: true, label: 'ref', range: { start: 0, end: 13 }, raw: '[ref](ref)'
    }
    const full = referenceLink.call(ctx, h, {}, { text: '[ref](ref)' }, fullToken)
    expect(full.length).to.be.greaterThan(3)
  })
})