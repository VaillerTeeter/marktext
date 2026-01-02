import { expect } from 'chai'
import Diagram from '../../../src/muya/lib/parser/render/plantuml'
import autoLinkExtension from '../../../src/muya/lib/parser/render/renderInlines/autoLinkExtension'
import codeFense from '../../../src/muya/lib/parser/render/renderInlines/codeFense'
import del from '../../../src/muya/lib/parser/render/renderInlines/del'
import em from '../../../src/muya/lib/parser/render/renderInlines/em'

const snabbdomPath = require.resolve('../../../src/muya/lib/parser/render/snabbdom')
const utilsPath = require.resolve('../../../src/muya/lib/utils')
const renderInlinesPath = require.resolve('../../../src/muya/lib/parser/render/renderInlines')
const renderBlockPath = require.resolve('../../../src/muya/lib/parser/render/renderBlock')
const renderersPath = require.resolve('../../../src/muya/lib/renderers')
const configPath = require.resolve('../../../src/muya/lib/config')

describe('StateRender core rendering', () => {
  let StateRender
  const originals = {}
  const rendererCalls = {}
  let patchCalls

  before(() => {
    patchCalls = []
    originals.snabbdom = require.cache[snabbdomPath]
    const h = (sel, data = {}, children = []) => {
      if (Array.isArray(data) || typeof data === 'string') {
        return { sel, data: {}, children: Array.isArray(data) ? data : [data] }
      }
      return { sel, data, children }
    }
    const toHTML = vnode => {
      if (vnode.sel === 'section') {
        return `<section>${(vnode.children || []).map(child => {
          const [tag, id] = child.sel.split('#')
          return `<${tag} id="${id || ''}"></${tag}>`
        }).join('')}</section>`
      }
      const [tag, id] = vnode.sel.split('#')
      return `<${tag} id="${id || ''}"></${tag}>`
    }
    const snabbdomStub = {
      __esModule: true,
      patch: (...args) => { patchCalls.push(args) },
      h,
      toVNode: node => ({ sel: node.tagName ? node.tagName.toLowerCase() : 'vnode', elm: node, children: [] }),
      toHTML
    }
    require.cache[snabbdomPath] = { exports: snabbdomStub }

    originals.utils = require.cache[utilsPath]
    const utilsStub = {
      __esModule: true,
      conflict: (rangeA, rangeB) => rangeA[0] <= rangeB[1] && rangeB[0] <= rangeA[1],
      mixins: (target, ...sources) => {
        sources.forEach(src => {
          Object.keys(src.default || src).forEach(key => {
            const val = (src.default || src)[key]
            target.prototype[key] = val
          })
        })
      },
      camelToSnake: str => str.replace(/[A-Z]/g, c => '_' + c.toLowerCase()),
      sanitize: x => x
    }
    require.cache[utilsPath] = { exports: utilsStub }

    originals.renderBlock = require.cache[renderBlockPath]
    const renderBlockStub = {
      __esModule: true,
      default: {
        renderBlock (parent, block) {
          return h(`div#${block.key}`, {}, [])
        }
      }
    }
    require.cache[renderBlockPath] = { exports: renderBlockStub }

    originals.renderInlines = require.cache[renderInlinesPath]
    const renderInlinesStub = { __esModule: true, default: {} }
    require.cache[renderInlinesPath] = { exports: renderInlinesStub }

    originals.renderers = require.cache[renderersPath]
    const rendererStore = {
      mermaid: {
        initialize: opts => { rendererCalls.mermaidInit = opts },
        parse: code => { if (code.includes('bad')) throw new Error('bad code') },
        init: () => { rendererCalls.mermaidInitCall = true }
      },
      flowchart: { parse: () => ({ drawSVG: () => { rendererCalls.flowchart = true } }) },
      sequence: { parse: code => { if (code === 'fail') throw new Error('fail'); return { drawSVG: () => { rendererCalls.sequence = true } } } },
      plantuml: { parse: () => ({ insertImgElement: el => { el.innerHTML = 'plant' } }) },
      'vega-lite': async (selector, spec, options) => { rendererCalls.vega = { selector, spec, options } }
    }
    require.cache[renderersPath] = { exports: { __esModule: true, default: async name => rendererStore[name] } }

    originals.config = require.cache[configPath]
    const configStub = {
      __esModule: true,
      CLASS_OR_ID: {
        AG_GRAY: 'ag-gray',
        AG_HIDE: 'ag-hide',
        AG_PARAGRAPH: 'p',
        AG_ACTIVE: 'active',
        AG_SELECTED: 'selected',
        AG_EDITOR_ID: 'editor',
        AG_HIGHLIGHT: 'highlight',
        AG_SELECTION: 'selection',
        AG_MATH_ERROR: 'math-error'
      },
      PREVIEW_DOMPURIFY_CONFIG: {}
    }
    require.cache[configPath] = { exports: configStub }

    StateRender = require('../../../src/muya/lib/parser/render/index.js').default
  })

  after(() => {
    const restore = (path, original) => {
      if (original) {
        require.cache[path] = original
      } else {
        delete require.cache[path]
      }
    }
    restore(snabbdomPath, originals.snabbdom)
    restore(utilsPath, originals.utils)
    restore(renderBlockPath, originals.renderBlock)
    restore(renderInlinesPath, originals.renderInlines)
    restore(renderersPath, originals.renderers)
    restore(configPath, originals.config)
  })

  const createRenderer = () => new StateRender({
    eventCenter: {},
    options: { mermaidTheme: 'default', sequenceTheme: 'hand', vegaTheme: 'dark' },
    contentState: { cursor: { start: { key: 's', offset: 1 }, end: { key: 'e', offset: 2 } }, selectedBlock: { key: 'sel' } }
  })

  it('collects reference definitions only once', () => {
    const render = createRenderer()
    const text = '[ref]: http://example.com "Title"'
    render.collectLabels([{ text }])
    render.collectLabels([{ text }])
    expect(render.labels.get('ref').href).to.equal('http://example.com')
  })

  it('evaluates conflicts, class helpers and selectors', () => {
    const render = createRenderer()
    const block = { key: 's' }
    const token = { range: { start: 1, end: 3 } }
    const cursor = { start: { key: 's', offset: 2 }, end: { key: 'x', offset: 5 } }
    expect(render.checkConflicted(block, token, cursor)).to.equal(true)
    expect(render.getClassName(null, block, token, cursor)).to.equal('ag-gray')
    expect(render.getClassName('outer', block, token, cursor)).to.equal('outer')
    expect(render.getClassName(null, { key: 'z' }, token, cursor)).to.equal('ag-hide')
    const cursorEnd = { start: { key: 'x', offset: 0 }, end: { key: 's', offset: 2 } }
    expect(render.checkConflicted(block, token, cursorEnd)).to.equal(true)
    const cursorBoth = { start: { key: 's', offset: 0 }, end: { key: 's', offset: 10 } }
    expect(render.checkConflicted(block, token, cursorBoth)).to.equal(false)
    const activeCls = render.getHighlightClassName(true)
    const inactiveCls = render.getHighlightClassName(false)
    expect(activeCls).to.be.a('string')
    expect(inactiveCls).to.be.a('string')
    expect(activeCls).to.not.equal(inactiveCls)

    const spanSelector = render.getSelector({ key: 'sel', type: 'span', functionType: 'custom' }, [], [])
    expect(spanSelector).to.include('ag-custom')
    expect(spanSelector).to.include('selected')

    const selector = render.getSelector({ key: 's', type: 'hr', functionType: 'block' }, [{ key: 's' }])
    expect(selector).to.include('p#s')
    expect(selector).to.include('active')
  })

  it('renders mermaid cache and clears it', async () => {
    const render = createRenderer()
    const ok = document.createElement('div')
    ok.id = 'm1'
    const bad = document.createElement('div')
    bad.id = 'm2'
    document.body.appendChild(ok)
    document.body.appendChild(bad)
    render.mermaidCache.set('#m1', { code: 'graph TD;A-->B' })
    render.mermaidCache.set('#m2', { code: 'bad' })

    await render.renderMermaid()
    expect(render.mermaidCache.size).to.equal(0)
    expect(ok.innerHTML).to.include('graph TD')
    expect((bad.innerHTML || '')).to.not.equal('')
  })

  it('renders diagrams for all supported types and handles errors', async () => {
    rendererCalls.vega = {}
    const render = createRenderer()
    const flow = document.createElement('div')
    flow.id = 'flow'
    const seq = document.createElement('div')
    seq.id = 'seq'
    const plant = document.createElement('div')
    plant.id = 'plant'
    const vega = document.createElement('div')
    vega.id = 'vega'
    document.body.append(flow, seq, plant, vega)

    render.diagramCache.set('#flow', { code: 'flowchart', functionType: 'flowchart' })
    render.diagramCache.set('#seq', { code: 'fail', functionType: 'sequence' })
    render.diagramCache.set('#plant', { code: 'plant', functionType: 'plantuml' })
    render.diagramCache.set('#vega', { code: '{"a":1}', functionType: 'vega-lite' })

    await render.renderDiagram()
    expect(render.diagramCache.size).to.equal(0)
    expect(flow.innerHTML).to.be.a('string')
    expect(seq.innerHTML).to.include('Invalid')
    expect(plant.innerHTML).to.match(/plantuml|plant/i)
    expect(rendererCalls.vega && rendererCalls.vega.spec).to.satisfy(spec => spec === undefined || spec.a === 1)
  })

  it('renders full view, partial sections and single blocks', () => {
    const render = createRenderer()
    render.renderMermaid = () => { rendererCalls.renderMermaid = true }
    render.renderDiagram = () => { rendererCalls.renderDiagram = true }

    const container = document.createElement('div')
    container.id = 'editor'
    document.body.appendChild(container)
    render.setContainer(container)

    const blocks = [{ key: 'a', type: 'p', functionType: 'paragraph' }]
    render.render(blocks, blocks, [])
    expect(rendererCalls.renderMermaid).to.equal(true)
    expect(rendererCalls.renderDiagram).to.equal(true)
    patchCalls.length = 0

    const aDom = document.createElement('div')
    aDom.id = 'a'
    const bDom = document.createElement('div')
    bDom.id = 'b'
    const cursorDom = document.createElement('div')
    cursorDom.id = 'cursor'
    container.append(aDom, bDom, cursorDom)

    const cursorBlock = { key: 'cursor', type: 'p', functionType: 'paragraph' }
    render.partialRender([{ key: 'a', type: 'p', functionType: 'paragraph' }], [cursorBlock], [], 'a', 'b')
    expect(render.codeCache.size).to.equal(0)
    patchCalls.length = 0

    const single = document.createElement('div')
    single.id = 'single'
    document.body.appendChild(single)
    let singleCalled = false
    const originalRenderBlock = render.renderBlock.bind(render)
    render.renderBlock = (...args) => { singleCalled = true; return originalRenderBlock(...args) }
    render.singleRender({ key: 'single', type: 'p', functionType: 'paragraph' }, [], [])
    expect(singleCalled).to.equal(true)
  })

  it('invalidates cached images by touching timestamps', () => {
    const render = createRenderer()
    render.loadImageMap.set('img', { touchMsec: 0 })
    render.invalidateImageCache()
    expect(render.loadImageMap.get('img').touchMsec).to.be.greaterThan(0)
  })
})

describe('PlantUML diagram helper', () => {
  it('encodes, parses and inserts image nodes', () => {
    const encoded = Diagram.encode('Alice -> Bob: Hi!')
    expect(encoded).to.be.a('string')
    expect(encoded).to.not.include('+')

    const diagram = Diagram.parse('A->B')
    const host = document.createElement('div')
    host.id = 'plant-host'
    document.body.appendChild(host)
    diagram.insertImgElement('plant-host')
    expect(host.innerHTML).to.include('plantuml')
  })

  it('throws on invalid container', () => {
    const diagram = Diagram.parse('X')
    expect(() => diagram.insertImgElement(null)).to.throw(Error)
  })
})

describe('Inline render extensions', () => {
  const h = (sel, data, children) => {
    if (Array.isArray(data) || typeof data === 'string') {
      return { sel, props: undefined, attrs: undefined, children: Array.isArray(data) ? data : [data] }
    }
    return { sel, props: data && data.props, attrs: data && data.attrs, children }
  }
  const highlight = (_h, _block, start, end) => [`${start}-${end}`]

  it('builds hyperlinks for url, www and email tokens', () => {
    const ctx = { highlight }
    const block = { text: '' }
    const tokens = [
      { linkType: 'www', www: 'example.com', range: { start: 0, end: 3 } },
      { linkType: 'url', url: 'http://a.com', range: { start: 0, end: 3 } },
      { linkType: 'email', email: 'a@b.com', range: { start: 0, end: 3 } }
    ]
    const links = tokens.map(t => autoLinkExtension.call(ctx, h, null, block, t, null)[0])
    expect(links[0].props.href).to.include('http://example.com')
    expect(links[1].props.href).to.equal('http://a.com')
    expect(links[2].props.href).to.equal('mailto:a@b.com')
  })

  it('splits code fence marker and language content', () => {
    const calls = []
    const ctx = { highlight: (_h, _b, s, e) => { calls.push([s, e]); return [`${s}-${e}`] } }
    const res = codeFense.call(ctx, h, null, { text: '```js' }, { range: { start: 0, end: 5 }, marker: '```' })
    expect(res[0].children[0]).to.equal('0-3')
    expect(res[1].children[0]).to.equal('3-5')
    expect(calls).to.deep.equal([[0, 3], [3, 5]])
  })

  it('delegates del and em rendering to factory', () => {
    const ctx = { delEmStrongFac: (...args) => args }
    const token = { }
    const delRes = del.call(ctx, h, null, {}, token)
    const emRes = em.call(ctx, h, null, {}, token)
    expect(delRes[0]).to.equal('del')
    expect(emRes[0]).to.equal('em')
  })
})
