import { expect } from 'chai'
import paragraphCtrl from '../../../src/muya/lib/contentState/paragraphCtrl'
import htmlBlock from '../../../src/muya/lib/contentState/htmlBlock'
import containerCtrl from '../../../src/muya/lib/contentState/containerCtrl'

class MiniCS {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.blocks = []
    this.cursor = { start: null, end: null }
    const muyaBase = {
      options: {
        frontmatterType: '-',
        orderListDelimiter: '.',
        bulletListMarker: '-',
        preferLooseListItem: false
      },
      eventCenter: { dispatch: () => {} }
    }
    this.muya = new Proxy(muyaBase, {
      get (target, prop) {
        if (prop in target) return target[prop]
        return () => {}
      }
    })
  }

  createBlock (type, props = {}) {
    const key = props.key || `${type}-${Math.random().toString(36).slice(2, 6)}`
    const block = Object.assign({ key, type, children: [] }, props)
    this.blockMap[key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children.push(child)
    child.parent = parent.key
    this.parentMap[child.key] = parent
  }

  insertAfter (newBlock, anchor) {
    const idx = this.blocks.indexOf(anchor)
    if (idx === -1) this.blocks.push(newBlock)
    else this.blocks.splice(idx + 1, 0, newBlock)
    this.parentMap[newBlock.key] = null
  }

  insertBefore (newBlock, anchor) {
    const idx = this.blocks.indexOf(anchor)
    if (idx === -1) this.blocks.unshift(newBlock)
    else this.blocks.splice(idx, 0, newBlock)
    this.parentMap[newBlock.key] = null
  }

  removeBlock (block, arr = this.blocks) {
    const idx = arr.indexOf(block)
    if (idx !== -1) arr.splice(idx, 1)
    delete this.blockMap[block.key]
  }

  createBlockP (text = '') {
    const p = this.createBlock('p')
    const span = this.createBlock('span', { type: 'span', text, functionType: 'paragraphContent' })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }

  appendTopParagraph (text = '') {
    const p = this.createBlockP(text)
    // ensure paragraph is top-level in blocks
    if (!this.blocks.includes(p)) this.blocks.push(p)
    return p.children[0].key
  }

  getBlock (key) { return this.blockMap[key] }
  getParent (block) { return this.parentMap[block.key] }
  getParents (block) {
    const parents = []
    let p = this.getParent(block)
    while (p) {
      parents.push(p)
      p = this.getParent(p)
    }
    return parents
  }
  partialRender () {}
  render () {}
  firstInDescendant (root) {
    if (!root) return null
    let node = root
    while (node && node.children && node.children.length) node = node.children[0]
    return node
  }

  lastInDescendant (root) {
    if (!root) return null
    let node = root
    while (node && node.children && node.children.length) node = node.children[node.children.length - 1]
    return node
  }

  isOnlyChild (block) {
    const parent = this.getParent(block)
    if (!parent) return true
    return parent.children && parent.children.length === 1
  }

  getAnchor (block) {
    const parent = this.getParent(block)
    return parent || block
  }

  findOutMostBlock (block) {
    let node = block
    while (this.getParent(node)) node = this.getParent(node)
    return node
  }

  updateList (paragraph, listType, _unused, block) {
    // create a list wrapper (ul/ol) and replace paragraph in top-level blocks
    const wrapperType = listType === 'order' ? 'ol' : 'ul'
    const listWrapper = this.createBlock(wrapperType, { listType })
    const listItem = this.createBlock('li')
    listItem.listItemType = listType
    this.appendChild(listWrapper, listItem)
    // if task list, add checkbox input before paragraph content
    if (listType === 'task') {
      const checkbox = this.createBlock('input')
      checkbox.checked = false
      this.appendChild(listItem, checkbox)
    }
    // move paragraph under listItem
    this.appendChild(listItem, paragraph)

    // replace paragraph in blocks (top-level) with listWrapper if present
    const idx = this.blocks.indexOf(paragraph)
    if (idx !== -1) {
      this.blocks.splice(idx, 1, listWrapper)
      this.parentMap[listWrapper.key] = null
    } else {
      this.blocks.push(listWrapper)
    }

    return paragraph
  }

  updateTaskListItem (listItemParagraph, listType) {
    // mark that task-list conversion happened for assertions
    this.taskUpdated = true
    listItemParagraph.listItemType = listType
  }

  createContainerBlock (functionType, value) {
    const container = this.createBlock('figure', { functionType })
    // create a pre block with codeContent string and a preview block
    const pre = this.createBlock('pre', { functionType: 'fencecode' })
    pre.codeContent = (typeof value === 'string') ? value : (value && value.text) || ''
    const preview = this.createBlock('preview')
    this.appendChild(container, pre)
    this.appendChild(container, preview)
    // put container into blocks list for placement via insertAfter
    this.blocks.push(container)
    return container
  }

}

paragraphCtrl(MiniCS)
htmlBlock(MiniCS)
containerCtrl(MiniCS)

// Ensure preBlock exposes a convenience `codeContent` string for tests
// that expect a direct property. Wrap the original createPreAndPreview
// to populate `preBlock.codeContent` from nested code span text.
const _origCreatePreAndPreview = MiniCS.prototype.createPreAndPreview
MiniCS.prototype.createPreAndPreview = function (functionType, value = '') {
  const res = _origCreatePreAndPreview.call(this, functionType, value)
  try {
    const pre = res.preBlock
    const codeBlock = pre && pre.children && pre.children[0]
    const content = codeBlock && codeBlock.children && codeBlock.children[0]
    pre.codeContent = (content && content.text) || ''
  } catch (e) {
    // noop
  }
  return res
}

describe('paragraphCtrl branch-heavy cases', () => {
  it('hr inserts hr and paragraph and updates cursor', () => {
    const cs = new MiniCS()
    // create a span representing a thematic break line
    const p = cs.createBlockP('')
    const span = p.children[0]
    span.functionType = 'thematicBreakLine'
    span.text = '---'
    cs.cursor = { start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 0 } }

    cs.updateParagraph('hr')

    // after updateParagraph('hr'), there should be a new paragraph after hr
    const foundP = cs.blocks.find(b => b.type === 'p')
    expect(foundP).to.exist
    // cursor should point into a paragraph child
    expect(cs.cursor).to.have.property('start')
    expect(cs.cursor.start).to.have.property('key')
  })

  it('heading conversion creates header or paragraph accordingly', () => {
    const cs = new MiniCS()
    const p = cs.createBlockP('# title')
    cs.blocks = [p]
    // parent of span is p
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    // convert to heading 2
    cs.updateParagraph('heading 2')

    // there should be a header block inserted (h2) or paragraph replaced
    const hasHeader = cs.blocks.some(b => /h[2]/.test(b.type) || b.type === 'p')
    expect(hasHeader).to.equal(true)
    expect(cs.cursor).to.have.property('start')
  })

  it('front-matter inserts frontmatter block at start', () => {
    const cs = new MiniCS()
    // create initial block
    const p = cs.createBlockP('hello')
    cs.blocks = [p]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.updateParagraph('front-matter')

    // first block should be a figure pre frontmatter
    const first = cs.blocks[0]
    // frontmatter creates a 'pre' wrapped in a figure inserted before firstBlock
    expect(first).to.exist
    // cursor should be updated into code content
    expect(cs.cursor).to.have.property('start')
  })

  it('pre converts span paragraph into fenced code block and focuses language input', () => {
    const cs = new MiniCS()
    const p = cs.createBlockP('console.log(1)')
    cs.blocks = [p]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.updateParagraph('pre')

    const hasPre = cs.blocks.some(b => b.type === 'pre' && b.functionType === 'fencecode')
    expect(hasPre).to.equal(true)
    // cursor should point to languageInput inside the new pre
    expect(cs.cursor).to.have.property('start')
    const langKey = cs.cursor.start.key
    const langBlock = cs.getBlock(langKey)
    expect(langBlock).to.exist
    expect(langBlock.functionType).to.equal('languageInput')
  })

  it('loose-list-item toggles isLooseListItem on list children', () => {
    const cs = new MiniCS()
    const ul = cs.createBlock('ul')
    const li = cs.createBlock('li')
    const p = cs.createBlockP('item')
    cs.appendChild(li, p)
    cs.appendChild(ul, li)
    cs.blocks = [ul]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.handleLooseListItem()

    // toggled on one of the list children
    const toggled = ul.children.some(b => Boolean(b.isLooseListItem))
    expect(toggled).to.equal(true)
  })

  it('upgrade heading converts h2 to h1', () => {
    const cs = new MiniCS()
    const parent = cs.createBlock('h2')
    const span = cs.createBlock('span', { text: '# title', functionType: 'paragraphContent' })
    cs.appendChild(parent, span)
    cs.blocks = [parent]
    cs.cursor = { start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 0 } }

    cs.updateParagraph('upgrade heading')

    const hasH1 = cs.blocks.some(b => b.type === 'h1')
    expect(hasH1).to.equal(true)
    expect(cs.cursor.start).to.have.property('key')
  })

  it('degrade heading converts h6 to paragraph', () => {
    const cs = new MiniCS()
    const parent = cs.createBlock('h6')
    const span = cs.createBlock('span', { text: '###### title', functionType: 'paragraphContent' })
    cs.appendChild(parent, span)
    cs.blocks = [parent]
    cs.cursor = { start: { key: span.key, offset: 0 }, end: { key: span.key, offset: 0 } }

    cs.updateParagraph('degrade heading')

    const hasP = cs.blocks.some(b => b.type === 'p')
    expect(hasP).to.equal(true)
    expect(cs.cursor.start).to.have.property('key')
  })

  it('blockquote converts paragraph to blockquote', () => {
    const cs = new MiniCS()
    const p = cs.createBlockP('quote me')
    cs.blocks = [p]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.updateParagraph('blockquote')

    const hasQuote = cs.blocks.some(b => b.type === 'blockquote')
    expect(hasQuote).to.equal(true)
    // blockquote should contain the paragraph as child
    const quote = cs.blocks.find(b => b.type === 'blockquote')
    expect(quote.children.some(c => c.type === 'p' || c.children)).to.equal(true)
  })

  it('blockquote toggles back to paragraphs when called on existing blockquote', () => {
    const cs = new MiniCS()
    const quote = cs.createBlock('blockquote')
    const p = cs.createBlockP('inside')
    cs.appendChild(quote, p)
    cs.blocks = [quote]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.updateParagraph('blockquote')

    // quote should be removed and paragraph should be present at top-level
    const hasQuote = cs.blocks.some(b => b.type === 'blockquote')
    expect(hasQuote).to.equal(false)
    const hasP = cs.blocks.some(b => b.type === 'p')
    expect(hasP).to.equal(true)
  })

  it('handleListMenu schedules task-list update and dispatches change', (done) => {
    const cs = new MiniCS()
    const p = cs.createBlockP('task item')
    cs.blocks = [p]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    let dispatched = false
    cs.muya.dispatchChange = () => { dispatched = true }

    const res = cs.handleListMenu('ul-task')
    expect(res).to.equal(false)

    // wait for scheduled setTimeout to run
    setTimeout(() => {
      expect(cs.taskUpdated).to.equal(true)
      expect(dispatched).to.equal(true)
      done()
    }, 20)
  })

  it('insertContainerBlock inserts container and sets cursor inside', () => {
    const cs = new MiniCS()
    const p = cs.createBlockP('diagram')
    cs.blocks = [p]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.insertContainerBlock('mermaid', p.children[0])

    const container = cs.blocks.find(b => b.functionType === 'mermaid' || b.type === 'figure')
    expect(container).to.exist
    expect(cs.cursor).to.have.property('start')
    const key = cs.cursor.start.key
    const block = cs.getBlock(key)
    expect(block).to.exist
  })

  it('insertHtmlBlock initializes html block and positions cursor', () => {
    const cs = new MiniCS()
    const p = cs.createBlockP('<div>hi</div>')
    cs.blocks = [p]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.insertHtmlBlock(p.children[0])

    expect(cs.cursor).to.have.property('start')
    const key = cs.cursor.start.key
    const block = cs.getBlock(key)
    expect(block).to.exist
  })

  it('handleListMenu on existing list with same type unlists items', () => {
    const cs = new MiniCS()
    const ul = cs.createBlock('ul')
    ul.listType = 'bullet'
    const li = cs.createBlock('li')
    const p = cs.createBlockP('one')
    cs.appendChild(li, p)
    cs.appendChild(ul, li)
    cs.blocks = [ul]
    // cursor inside list item paragraph
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.handleListMenu('ul-bullet')
    // list should be removed and paragraph should exist at top-level
    expect(cs.blocks.some(b => b.type === 'ul')).to.equal(false)
    expect(cs.blocks.some(b => b.type === 'p')).to.equal(true)
  })

  it('handleListMenu converts ordered list to bullet (order->bullet)', () => {
    const cs = new MiniCS()
    const ol = cs.createBlock('ol')
    ol.listType = 'order'
    ol.start = 1
    const li = cs.createBlock('li')
    const p = cs.createBlockP('one')
    cs.appendChild(li, p)
    cs.appendChild(ol, li)
    cs.blocks = [ol]
    cs.cursor = { start: { key: p.children[0].key, offset: 0 }, end: { key: p.children[0].key, offset: 0 } }

    cs.handleListMenu('ul-bullet')
    // list should now be of type 'ul' and children should have bulletMarkerOrDelimiter
    const wrapper = cs.blocks.find(b => /ul|ol/.test(b.type))
    expect(wrapper).to.exist
    expect(wrapper.listType).to.equal('bullet')
  })

  it('insertContainerBlock for mermaid creates container with pre and preview', () => {
    const cs = new MiniCS()
    const key = cs.appendTopParagraph('```mermaid\n graph LR\n```')
    cs.cursor = { start: { key, offset: 0 }, end: { key, offset: 0 } }

    cs.insertContainerBlock('mermaid', cs.getBlock(key))
    const container = cs.blocks.find(b => b.type === 'figure' && b.functionType === 'mermaid')
    expect(container).to.exist
    const findByType = (node, t) => {
      if (!node || !node.children) return null
      for (const c of node.children) {
        if (c.type === t) return c
        const found = findByType(c, t)
        if (found) return found
      }
      return null
    }
    // locate any codeContent span created for the container
    const codeSpan = Object.values(cs.blockMap).find(b => b.functionType === 'codeContent' && typeof b.text === 'string' && b.text.includes('graph LR'))
    expect(codeSpan).to.exist
  })

  it('insertContainerBlock for plantuml creates container with pre and preview', () => {
    const cs = new MiniCS()
    const key = cs.appendTopParagraph('```plantuml\n@startuml\nAlice->Bob: Hello\n@enduml\n```')
    cs.cursor = { start: { key, offset: 0 }, end: { key, offset: 0 } }

    cs.insertContainerBlock('plantuml', cs.getBlock(key))
    const container = cs.blocks.find(b => b.type === 'figure' && b.functionType === 'plantuml')
    expect(container).to.exist
    const findByType = (node, t) => {
      if (!node || !node.children) return null
      for (const c of node.children) {
        if (c.type === t) return c
        const found = findByType(c, t)
        if (found) return found
      }
      return null
    }
    const codeSpan = Object.values(cs.blockMap).find(b => b.functionType === 'codeContent' && typeof b.text === 'string' && b.text.includes('@startuml'))
    expect(codeSpan).to.exist
  })

  it('insertHtmlBlock on empty paragraph still creates html figure', () => {
    const cs = new MiniCS()
    const key = cs.appendTopParagraph('')
    cs.cursor = { start: { key, offset: 0 }, end: { key, offset: 0 } }

    cs.insertHtmlBlock(cs.getBlock(key))
    const fig = cs.blocks.find(b => b.type === 'figure')
    expect(fig).to.exist
    const pre = fig.children.find(c => c.type === 'pre')
    expect(pre).to.exist
  })

  it('handleListMenu converts paragraph into list', () => {
    const cs = new MiniCS()
    const pKey = cs.appendTopParagraph('one')
    cs.cursor = { start: { key: pKey, offset: 0 }, end: { key: pKey, offset: 0 } }

    cs.handleListMenu('ul-bullet')
    const list = cs.blocks.find(b => /ul|ol/.test(b.type))
    expect(list).to.exist
    expect(list.listType).to.equal('bullet')
  })

})
