import { expect } from 'chai'
import { CLASS_OR_ID } from '../../../src/muya/lib/config'
import backlash from '../../../src/muya/lib/parser/render/renderInlines/backlash'
import backlashInTokenFn from '../../../src/muya/lib/parser/render/renderInlines/backlashInToken'
import autoLink from '../../../src/muya/lib/parser/render/renderInlines/autoLink'
import link from '../../../src/muya/lib/parser/render/renderInlines/link'
import delEmStrongFac from '../../../src/muya/lib/parser/render/renderInlines/delEmStringFactory'
import inlineMath from '../../../src/muya/lib/parser/render/renderInlines/inlineMath'
import emoji from '../../../src/muya/lib/parser/render/renderInlines/emoji'
import loadImageAsync from '../../../src/muya/lib/parser/render/renderInlines/loadImageAsync'

// Lightweight snabbdom-like helper
const h = (sel, data, children) => {
  if (Array.isArray(data) || typeof data === 'string' || data === undefined) {
    return { sel, data: {}, children: Array.isArray(data) ? data : data !== undefined ? [data] : children || [] }
  }
  return { sel, ...data, data, children: children || [] }
}

const highlight = (hFn, _block, start, end, _token) => [`H${start}-${end}`]
const getClassName = (outer) => outer || 'cls'
const getHighlightClassName = (active) => active ? 'ag-active' : 'ag-inactive'
const textRenderer = (hFn, _cursor, _block, token) => [`T-${token.raw || token.content || ''}`]

const createCtx = () => {
  const ctx = {
    highlight,
    getClassName,
    getHighlightClassName,
    text: textRenderer,
    snakeToCamel: s => s.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase()),
    loadMathMap: new Map(),
    loadImageMap: new Map(),
    urlMap: new Map(),
    backlashInToken: function (hFn, backlashes, outerClass, start, token) {
      return backlashInTokenFn.call(ctx, hFn, backlashes, outerClass, start, token)
    }
  }
  return ctx
}

describe('renderInlines helpers', () => {
  it('backlash wraps content with remove class', () => {
    const ctx = createCtx()
    const block = { text: '\\' }
    const token = { range: { start: 0, end: 2 } }
    const res = backlash.call(ctx, h, null, block, token, 'wrap')
    expect(res[0].sel).to.include(CLASS_OR_ID.AG_REMOVE)
  })

  it('backlashInToken alternates classes and applies highlight', () => {
    const ctx = createCtx()
    const token = { highlights: [{ start: 0, end: 1, active: true }] }
    const res = backlashInTokenFn.call(ctx, h, 'ab', 'outer', 0, token)
    expect(res[0].sel).to.include('ag-active')
    expect(res[1].sel).to.include(CLASS_OR_ID.AG_BACKLASH)
  })

  it('emoji marks invalid content with warn class and highlights', () => {
    const ctx = createCtx()
    const block = { text: ':bad:' }
    const token = {
      range: { start: 0, end: 5 },
      marker: ':',
      content: 'bad',
      highlights: [{ start: 1, end: 4, active: true }]
    }
    const res = emoji.call(ctx, h, null, block, token, 'wrap')
    expect(res[0].sel).to.include(CLASS_OR_ID.AG_EMOJI_MARKER)
    expect(res[1].sel).to.include(CLASS_OR_ID.AG_EMOJI_MARKED_TEXT)
  })

  it('autoLink builds sanitized hyperlink', () => {
    const ctx = createCtx()
    const block = { text: '<http://ex.com>' }
    const token = {
      isLink: true,
      marker: '<',
      href: 'http://ex.com',
      email: null,
      range: { start: 0, end: 15 }
    }
    const res = autoLink.call(ctx, h, null, block, token, 'wrap')
    const anchor = res[1]
    expect(anchor.sel).to.include('a')
    expect(anchor.props.href).to.equal('http://ex.com')
  })

  it('link renders no-text link when no children and even backslashes', () => {
    const ctx = createCtx()
    const block = { text: '[]()' }
    const token = {
      range: { start: 0, end: 4 },
      anchor: '',
      backlash: { first: '', second: '' },
      hrefAndTitle: '',
      href: 'http://a',
      title: '',
      children: [],
      raw: '[]()'
    }
    const res = link.call(ctx, h, null, block, token, 'wrap')
    expect(res[1].sel).to.include(CLASS_OR_ID.AG_NOTEXT_LINK)
  })

  it('link renders children and backslashes when present', () => {
    const ctx = createCtx()
    const block = { text: '[a](b)' }
    const token = {
      range: { start: 0, end: 5 },
      anchor: 'a',
      backlash: { first: '\\', second: '' },
      hrefAndTitle: 'b',
      href: 'b',
      title: '',
      children: [{ type: 'text', raw: 'a' }],
      raw: '[a](b)'
    }
    const res = link.call(ctx, h, null, block, token, 'wrap')
    expect(res).to.be.an('array')
    expect(res).to.have.length(5)
  })

  it('del/em/strong factory wraps markers and content', () => {
    const ctx = createCtx()
    const block = { text: '**a**' }
    const token = {
      range: { start: 0, end: 4 },
      marker: '**',
      backlash: '',
      children: [{ type: 'text', raw: 'a' }]
    }
    const res = delEmStrongFac.call(ctx, 'strong', h, null, block, token, 'wrap')
    expect(res[0].sel).to.include(CLASS_OR_ID.AG_REMOVE)
    expect(res[1].sel).to.include('strong')
  })

  it('inlineMath renders math preview and caches result', () => {
    const ctx = createCtx()
    const block = { text: '$1+1$' }
    const token = { range: { start: 0, end: 4 }, marker: '$', content: '1+1', type: 'inline_math' }
    const res = inlineMath.call(ctx, h, null, block, token, 'wrap')
    expect(res[1].children[1].sel).to.include(CLASS_OR_ID.AG_MATH_RENDER)
    const cached = ctx.loadMathMap.get('1+1_inline_math')
    expect(cached).to.not.equal(undefined)
  })

  it('loadImageAsync returns cached dimensions without reload', () => {
    const ctx = createCtx()
    ctx.loadImageMap.set('src', { id: 'img1', isSuccess: true, width: 10, height: 20, domsrc: 'dom', dispMsec: 1, touchMsec: 1 })
    const res = loadImageAsync.call(ctx, { src: 'src', isUnknownType: false }, { alt: 'a', width: 1, height: 2 }, 'cls', 'imgCls')
    expect(res).to.deep.include({ id: 'img1', isSuccess: true, width: 10, height: 20, domsrc: 'dom' })
  })
})
