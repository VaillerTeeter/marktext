import { expect } from 'chai'
import { CLASS_OR_ID } from '../../../src/muya/lib/config'
import renderContainerBlock from '../../../src/muya/lib/parser/render/renderBlock/renderContainerBlock'
import renderLeafBlock from '../../../src/muya/lib/parser/render/renderBlock/renderLeafBlock'
import { footnoteJumpIcon } from '../../../src/muya/lib/parser/render/renderBlock/renderFootnoteJump'
import { renderLeftBar, renderBottomBar } from '../../../src/muya/lib/parser/render/renderBlock/renderTableDargBar'
import { renderTableTools, TABLE_TOOLS } from '../../../src/muya/lib/parser/render/renderBlock/renderToolBar'

const createRendererCtx = (overrides = {}) => {
  const { muya: overrideMuya, ...rest } = overrides
  const baseMuya = {
    options: { disableHtml: false, fontSize: 16, lineHeight: 1.6 },
    contentState: { cursor: {}, selectedTableCells: null }
  }

  const mergedMuya = overrideMuya
    ? {
      ...baseMuya,
      ...overrideMuya,
      options: { ...baseMuya.options, ...(overrideMuya.options || {}) },
      contentState: { ...baseMuya.contentState, ...(overrideMuya.contentState || {}) }
    }
    : baseMuya

  return {
    renderingTable: null,
    renderingRowContainer: null,
    getSelector: block => block.type,
    renderBlock: (parent, child) => ({ sel: `child-${child.key}` }),
    renderIcon: () => ({ sel: 'i.icon' }),
    codeCache: new Map(),
    tokenCache: new Map(),
    loadMathMap: new Map(),
    mermaidCache: new Map(),
    diagramCache: new Map(),
    labels: new Map(),
    muya: mergedMuya,
    ...rest
  }
}

describe('renderBlock - renderContainerBlock', () => {
  it('adds copy button and language class for pre blocks', () => {
    const ctx = createRendererCtx()
    const block = {
      key: 'pre-1',
      type: 'pre',
      lang: 'js',
      functionType: 'mermaid',
      children: [{ key: 'code', children: [{ text: 'console.log(1)' }] }],
      parent: {}
    }

    const vnode = renderContainerBlock.call(ctx, {}, block, [], [], true)

    expect(vnode.sel).to.include('.language-js')
    expect(vnode.sel).to.include(`.${CLASS_OR_ID.AG_MERMAID}`)
    expect(vnode.data.dataset.role).to.equal('mermaid')
    expect(vnode.data.attrs.spellcheck).to.equal('false')
    expect(vnode.children[0].sel).to.equal('a.ag-code-copy')
    expect(vnode.children[1].sel).to.equal('child-code')
  })

  it('marks selected table cells with borders and alignment', () => {
    const ctx = createRendererCtx({
      muya: {
        contentState: {
          selectedTableCells: {
            cells: [{ key: 'cell-1', top: true, right: false, bottom: true, left: false }]
          }
        }
      }
    })

    const vnode = renderContainerBlock.call(ctx, {}, {
      key: 'cell-1',
      type: 'td',
      align: 'center',
      column: 1,
      children: [],
      parent: {}
    }, [], [], false)

    expect(vnode.sel).to.include('.ag-cell-selected')
    expect(vnode.sel).to.include('.ag-cell-border-top')
    expect(vnode.sel).to.include('.ag-cell-border-bottom')
    expect(vnode.data.attrs.style).to.equal('text-align:center')
    expect(vnode.data.dataset.column).to.equal(1)
  })

  it('renders footnote figures with backlink icon', () => {
    const ctx = createRendererCtx()
    const vnode = renderContainerBlock.call(ctx, {}, {
      type: 'figure',
      functionType: 'footnote',
      children: [],
      parent: {}
    }, [], [], false)

    const backlink = vnode.children[vnode.children.length - 1]
    expect(backlink.sel).to.equal('i.ag-footnote-backlink')
    expect(backlink.text).to.equal('↩︎')
  })
})

describe('renderBlock - renderLeafBlock', () => {
  it('shows empty mermaid preview when code is missing', () => {
    const ctx = createRendererCtx()
    ctx.codeCache.set('pre-1', '')

    const vnode = renderLeafBlock.call(ctx, {}, {
      type: 'div',
      functionType: 'mermaid',
      preSibling: 'pre-1',
      parent: {}
    }, [], [], true)

    expect(vnode.sel).to.include(CLASS_OR_ID.AG_CONTAINER_PREVIEW)
    expect(vnode.sel).to.include(CLASS_OR_ID.AG_EMPTY)
    expect(vnode.data.attrs.spellcheck).to.equal('false')
    expect(vnode.text).to.equal('< Empty Mermaid Block >')
  })

  it('renders a checked task list checkbox input', () => {
    const ctx = createRendererCtx({ muya: { options: { fontSize: 16, lineHeight: 2 } } })

    const vnode = renderLeafBlock.call(ctx, {}, {
      type: 'input',
      checked: true,
      key: 'box-1',
      parent: {}
    }, [], [], false)

    expect(vnode.sel).to.equal(`input#box-1.${CLASS_OR_ID.AG_TASK_LIST_ITEM_CHECKBOX}.${CLASS_OR_ID.AG_CHECKBOX_CHECKED}`)
    expect(vnode.data.attrs.type).to.equal('checkbox')
    expect(vnode.data.attrs.style).to.contain('8.00px')
    expect(vnode.data.attrs.checked).to.be.true
  })
})

describe('renderBlock helpers', () => {
  it('renders footnote jump icon', () => {
    const vnode = footnoteJumpIcon()
    expect(vnode.sel).to.equal('i.ag-footnote-backlink')
    expect(vnode.text).to.equal('↩︎')
  })

  it('renders table drag bars as non-editable spans', () => {
    expect(renderLeftBar().sel).to.equal('span.ag-drag-handler.left')
    expect(renderLeftBar().data.attrs.contenteditable).to.equal('false')
    expect(renderBottomBar().sel).to.equal('span.ag-drag-handler.bottom')
    expect(renderBottomBar().data.attrs.contenteditable).to.equal('false')
  })

  it('builds a table toolbar and marks active alignment', () => {
    const vnode = renderTableTools([{}, { align: 'center' }])

    expect(vnode.sel).to.equal(`div.ag-tool-table.${CLASS_OR_ID.AG_TOOL_BAR}`)
    expect(vnode.data.attrs.contenteditable).to.equal(false)

    const ul = vnode.children[0]
    expect(ul.sel).to.equal('ul')
    expect(ul.children.length).to.equal(TABLE_TOOLS.length)

    const [tableItem, leftItem, centerItem] = ul.children
    expect(tableItem.data.dataset.label).to.equal('table')
    expect(leftItem.sel).to.equal('li')
    expect(centerItem.sel).to.include('.active')
    expect(centerItem.data.dataset.label).to.equal('center')
  })
})
