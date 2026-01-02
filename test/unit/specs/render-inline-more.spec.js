import { expect } from 'chai'

// Stubs for asset imports used by image renderer
const iconPaths = [
  require.resolve('../../../src/muya/lib/assets/pngicon/image/2.png'),
  require.resolve('../../../src/muya/lib/assets/pngicon/image_fail/2.png'),
  require.resolve('../../../src/muya/lib/assets/pngicon/delete/2.png')
]

describe('Render inline extensions (more)', () => {
  const originals = {}
  let strong
  let superSubScript
  let tailHeader
  let image
  let loadImageAsync
  let highlight
  let emoji

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

  before(() => {
    const configPath = require.resolve('../../../src/muya/lib/config')
    const utilsPath = require.resolve('../../../src/muya/lib/utils')
    const dompurifyPath = require.resolve('../../../src/muya/lib/utils/dompurify')
    const domManipulatePath = require.resolve('../../../src/muya/lib/utils/domManipulate')
    const emojisPath = require.resolve('../../../src/muya/lib/ui/emojis')
    originals.config = require.cache[configPath]
    originals.utils = require.cache[utilsPath]
    originals.dompurify = require.cache[dompurifyPath]
    originals.domManipulate = require.cache[domManipulatePath]
    originals.emojis = require.cache[emojisPath]
    for (const p of iconPaths) originals[p] = require.cache[p]

    const CLASS_OR_ID = {
      AG_INLINE_RULE: 'ag-inline-rule',
      AG_REMOVE: 'ag-remove',
      AG_INLINE_IMAGE: 'ag-inline-image',
      AG_IMAGE_CONTAINER: 'ag-image-container',
      AG_IMAGE_UPLOADING: 'ag-image-upload',
      AG_IMAGE_LOADING: 'ag-image-loading',
      AG_IMAGE_SUCCESS: 'ag-image-success',
      AG_IMAGE_FAIL: 'ag-image-fail',
      AG_INLINE_IMAGE_SELECTED: 'ag-inline-image-selected',
      AG_EMPTY_IMAGE: 'ag-empty-image',
      AG_EMOJI_MARKED_TEXT: 'ag-emoji',
      AG_EMOJI_MARKER: 'ag-emoji-marker',
      AG_WARN: 'ag-warn'
    }

    require.cache[configPath] = { exports: { __esModule: true, CLASS_OR_ID } }
    require.cache[utilsPath] = {
      exports: {
        __esModule: true,
        getUniqueId: () => 'uid',
        loadImage: (...args) => require.cache[utilsPath].exports.__loadImage(...args),
        getImageInfo: src => ({ src }),
        union: (...args) => utilsPath.__union(...args)
      }
    }
    // mutable hooks for tests
    require.cache[utilsPath].exports.__loadImage = () => Promise.resolve({ url: 'x', width: 10, height: 20 })
    require.cache[utilsPath].exports.__union = (...args) => require('../../../src/muya/lib/utils').union(...args)

    require.cache[dompurifyPath] = {
      exports: { __esModule: true, default: () => true, isValidAttribute: () => true }
    }
    require.cache[domManipulatePath] = {
      exports: {
        __esModule: true,
        insertAfter: () => {},
        operateClassName: () => {}
      }
    }
    require.cache[emojisPath] = { exports: { __esModule: true, validEmoji: token => token === 'smile' ? { emoji: '😀' } : false } }
    for (const p of iconPaths) {
      require.cache[p] = { exports: 'icon-stub' }
    }

    strong = require('../../../src/muya/lib/parser/render/renderInlines/strong').default
    superSubScript = require('../../../src/muya/lib/parser/render/renderInlines/superSubScript').default
    tailHeader = require('../../../src/muya/lib/parser/render/renderInlines/tailHeader').default
    image = require('../../../src/muya/lib/parser/render/renderInlines/image').default
    loadImageAsync = require('../../../src/muya/lib/parser/render/renderInlines/loadImageAsync').default
    highlight = require('../../../src/muya/lib/parser/render/renderInlines/highlight').default
    emoji = require('../../../src/muya/lib/parser/render/renderInlines/emoji').default
  })

  after(() => {
    const restore = (path, original) => {
      if (original) {
        require.cache[path] = original
      } else {
        delete require.cache[path]
      }
    }
    const configPath = require.resolve('../../../src/muya/lib/config')
    const utilsPath = require.resolve('../../../src/muya/lib/utils')
    const dompurifyPath = require.resolve('../../../src/muya/lib/utils/dompurify')
    const domManipulatePath = require.resolve('../../../src/muya/lib/utils/domManipulate')
    const emojisPath = require.resolve('../../../src/muya/lib/ui/emojis')
    restore(configPath, originals.config)
    restore(utilsPath, originals.utils)
    restore(dompurifyPath, originals.dompurify)
    restore(domManipulatePath, originals.domManipulate)
    restore(emojisPath, originals.emojis)
    for (const p of iconPaths) restore(p, originals[p])
  })

  const baseCtx = () => ({
    getClassName: (outer) => outer || 'cls',
    delEmStrongFac: (...args) => { baseCtx.called = args },
    getHighlightClassName: active => active ? 'hl' : 'gray',
    highlight: (_h, block, start, end) => [block.text.substring(start, end)],
    muya: { contentState: {} },
    urlMap: new Map(),
    loadImageMap: new Map()
  })

  it('delegates strong to factory', () => {
    const ctx = baseCtx()
    strong.call(ctx, h, {}, {}, {}, 'outer')
    expect(baseCtx.called[0]).to.equal('strong')
  })

  it('renders superscript and subscript markers', () => {
    const ctx = baseCtx()
    const block = { text: '^hi^' }
    const sup = superSubScript.call(ctx, h, {}, block, { marker: '^', range: { start: 0, end: 4 } }, 'outer')
    expect(sup[1].sel.startsWith('sup.')).to.equal(true)

    const sub = superSubScript.call(ctx, h, {}, block, { marker: '~', range: { start: 0, end: 4 } }, 'outer')
    expect(sub[1].sel.startsWith('sub.')).to.equal(true)
  })

  it('renders tail header differently for headings', () => {
    const ctx = baseCtx()
    const blockH = { text: 'Title', type: 'h1' }
    const token = { range: { start: 0, end: 5 } }
    const resH = tailHeader.call(ctx, h, {}, blockH, token, 'outer')
    expect(resH[0].sel).to.equal('span.outer')

    const blockP = { text: 'para', type: 'paragraph' }
    const resP = tailHeader.call(ctx, h, {}, blockP, token, 'outer')
    expect(resP).to.deep.equal(['para'])
  })

  it('highlights ranges and unions highlights', () => {
    const ctx = baseCtx()
    ctx.getHighlightClassName = () => 'hl'
    const block = { text: 'abcdef' }
    const token = { highlights: [{ start: 1, end: 4, active: true }] }
    const res = highlight.call(ctx, h, block, 0, 6, token)
    expect(res[1].sel).to.equal('span.hl')
  })

  it('renders valid and invalid emoji with highlights', () => {
    const ctx = baseCtx()
    const block = { text: ':smile:' }
    const tokenValid = { content: 'smile', marker: ':', range: { start: 0, end: 7 }, highlights: [{ start: 0, end: 1, active: true }, { start: 6, end: 7, active: true }] }
    const validRes = emoji.call(ctx, h, {}, block, tokenValid, 'outer')
    expect(validRes[1].dataset.emoji).to.exist
    expect(validRes[0].sel).to.include('hl')

    const tokenInvalid = { content: 'nope', marker: ':', range: { start: 0, end: 6 } }
    const invalidRes = emoji.call(ctx, h, {}, { text: ':nope:' }, tokenInvalid, 'outer')
    expect(invalidRes[1].sel).to.include('ag-warn')
  })

  it('renders images across success, fail, upload and empty branches', () => {
    const utilsPath = require.resolve('../../../src/muya/lib/utils')
    const utils = require.cache[utilsPath].exports
    const ctx = baseCtx()
    utils.getImageInfo = src => ({ src })
    ctx.loadImageAsync = () => ({ id: 'img1', isSuccess: true, domsrc: 'domsrc' })
    ctx.muya.contentState.selectedImage = { key: 'k', token: { range: { start: 0, end: 5 }, attrs: { src: 'http://img/sample.png' } }, imageId: 'img1' }
    const token = { raw: '![](http://img/sample.png)', attrs: { src: 'http://img/sample.png', alt: 'alt', title: 'title', width: 10, height: 20, 'data-align': 'left' }, range: { start: 0, end: 5 } }
    const block = { key: 'k', text: '' }
    const success = image.call(ctx, h, {}, block, token, 'outer')
    expect(success[0].sel).to.include('ag-image-success')
    expect(success[0].sel).to.include('ag-inline-image-selected')

    ctx.loadImageAsync = () => ({ id: 'img2', isSuccess: false, domsrc: '' })
    const fail = image.call(ctx, h, {}, block, token, 'outer')
    expect(fail[0].sel).to.include('ag-image-fail')

    ctx.urlMap.set('http://cached/sample.png', 'data://cached')
    const tokenCache = { raw: '![](http://cached/sample.png)', attrs: { src: 'http://cached/sample.png', alt: 'alt', title: '', 'data-align': 'right' }, range: { start: 0, end: 5 } }
    const cached = image.call(ctx, h, {}, block, tokenCache, 'outer')
    expect(cached[0].sel).to.include('ag-image-success')

    const tokenUploading = { raw: '![](loading-1)', attrs: { src: 'loading-src', alt: 'loading-1', title: '' }, range: { start: 0, end: 5 } }
    ctx.urlMap.clear()
    const uploading = image.call(ctx, h, {}, block, tokenUploading, 'outer')
    expect(uploading[0].sel).to.include('ag-image-upload')
    expect(uploading[0].data.dataset.id).to.equal('loading-1')

    const tokenEmpty = { raw: '![]()', attrs: { src: '', alt: '', title: '' }, range: { start: 0, end: 2 } }
    const empty = image.call(ctx, h, {}, block, tokenEmpty, 'outer')
    expect(empty[0].sel).to.include('ag-empty-image')
  })

  it('handles loadImageAsync reload, cache and failure', async () => {
    const utilsPath = require.resolve('../../../src/muya/lib/utils')
    const utils = require.cache[utilsPath].exports
    // success path with reload
    utils.__loadImage = () => Promise.resolve({ url: 'http://x', width: 1, height: 2 })
    const ctx = baseCtx()
    ctx.urlMap = new Map()
    ctx.loadImageMap = new Map()

    // Minimal DOM stubs
    const imageContainer = {
      querySelector: () => null,
      appendChild: function (img) { this.appended = img }
    }
    const imageText = {
      classList: { contains: (c) => c === 'ag-inline-image', add: () => {}, remove: () => {} },
      querySelector: sel => sel === '.ag-image-container' ? imageContainer : null
    }
    const doc = global.document
    const originalQuerySelector = doc.querySelector
    const originalCreateElement = doc.createElement
    try {
      doc.querySelector = () => imageText
      doc.createElement = () => ({ classList: { add: () => {} }, setAttribute: () => {} })

      const res = loadImageAsync.call(ctx, { src: 'file://img.png', isUnknownType: false }, { alt: 'alt*', title: 't', width: 3, height: 4 }, 'cls', 'img-class')
      expect(res.id).to.be.a('string')
      await new Promise(r => setTimeout(r, 10))
      expect(ctx.loadImageMap.get('file://img.png')).to.have.property('isSuccess')

      // failure path
      utils.__loadImage = () => Promise.reject(new Error('fail'))
      const ctxFail = baseCtx()
      ctxFail.urlMap = new Map()
      ctxFail.loadImageMap = new Map()
      doc.querySelector = () => ({ classList: { contains: () => false, add: () => {}, remove: () => {} }, querySelector: () => ({ remove: () => {} }) })
      const resFail = loadImageAsync.call(ctxFail, { src: 'http://bad', isUnknownType: false }, { alt: '', title: '' }, 'cls')
      await new Promise(r => setTimeout(r, 10))
      const failEntry = ctxFail.loadImageMap.get('http://bad')
      expect(resFail.id).to.be.a('string')
      expect(failEntry ? failEntry.isSuccess : false).to.equal(false)

      // cached path skips reload
      const cachedCtx = baseCtx()
      cachedCtx.loadImageMap.set('http://cached', { id: 'idc', isSuccess: true, width: 5, height: 6, domsrc: 'dom', dispMsec: 1, touchMsec: 1 })
      const cached = loadImageAsync.call(cachedCtx, { src: 'http://cached', isUnknownType: false }, { alt: '' }, 'cls')
      expect(cached.id).to.equal('idc')
      expect(cached.width).to.equal(5)
    } finally {
      doc.querySelector = originalQuerySelector
      doc.createElement = originalCreateElement
    }
  })
})
