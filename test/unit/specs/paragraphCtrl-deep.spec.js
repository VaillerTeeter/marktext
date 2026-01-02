import { expect } from 'chai'
import paragraphCtrl from '../../../src/muya/lib/contentState/paragraphCtrl'
import containerCtrl from '../../../src/muya/lib/contentState/containerCtrl'

class MiniCSDeep {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.blocks = []
    this.cursor = { start: null, end: null }
    this._id = 0
    this.muya = { options: { orderListDelimiter: '.', bulletListMarker: '-', preferLooseListItem: false }, eventCenter: { dispatch: () => {} }, dispatchSelectionChange: () => {}, dispatchSelectionFormats: () => {}, dispatchChange: () => {} }
  }

  createBlock (type, props = {}) {
    const key = props.key || `${type}-${Math.random().toString(36).slice(2,6)}`
    const block = Object.assign({ key, type, children: [] }, props)
    this.blockMap[key] = block
    return block
  }

  appendChild (parent, child) {
    parent.children = parent.children || []
    child.parent = parent.key
    this.parentMap[child.key] = parent
    parent.children.push(child)
  }

  getBlock (key) { return this.blockMap[key] }
  getParent (block) { return this.parentMap[block.key] }
  getParents (block) {
    const parents = []
    let p = this.getParent(block)
    while (p) { parents.push(p); p = this.getParent(p) }
    return parents
  }

  createBlockP (text = '') {
    const p = this.createBlock('p')
    const span = this.createBlock('span', { text, functionType: 'paragraphContent' })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }

  partialRender () {}

  // mimic updateList used by paragraphCtrl
  updateList (paragraph, listType, _unused, block) {
    const wrapperType = listType === 'order' ? 'ol' : 'ul'
    const listWrapper = this.createBlock(wrapperType, { listType })
    const listItem = this.createBlock('li')
    listItem.listItemType = listType
    this.appendChild(listWrapper, listItem)
    if (listType === 'task') {
      const checkbox = this.createBlock('input')
      checkbox.checked = false
      this.appendChild(listItem, checkbox)
    }
    this.appendChild(listItem, paragraph)
    const idx = this.blocks.indexOf(paragraph)
    if (idx !== -1) this.blocks.splice(idx, 1, listWrapper)
    else this.blocks.push(listWrapper)
    return paragraph
  }

  updateTaskListItem (listItemParagraph, listType) { this.taskUpdated = true }

  createContainerBlock (functionType, value) {
    const container = this.createBlock('figure', { functionType })
    const pre = this.createBlock('pre', { functionType: 'fencecode' })
    const code = this.createBlock('code')
    const span = this.createBlock('span', { functionType: 'codeContent', text: (typeof value === 'string') ? value : (value && value.text) || '' })
    this.appendChild(code, span)
    this.appendChild(pre, code)
    const preview = this.createBlock('preview')
    this.appendChild(container, pre)
    this.appendChild(container, preview)
    this.blocks.push(container)
    return container
  }
}

paragraphCtrl(MiniCSDeep)
containerCtrl(MiniCSDeep)

describe('paragraphCtrl deep cases', () => {
  it('wraps a paragraph into ordered list via updateList', () => {
    const cs = new MiniCSDeep()
    const p1 = cs.createBlockP('one')
    cs.blocks = [p1]

    const res = cs.updateList(p1, 'order')
    expect(res).to.equal(p1)
    const found = cs.blocks.find(b => b.type === 'ol')
    expect(found).to.exist
    expect(found.listType).to.equal('order')
  })

  it('task-list single block schedules updateTaskListItem', function(done) {
    const cs = new MiniCSDeep()
    const p = cs.createBlockP('task')
    cs.blocks = [p]
    cs.cursor = { start: { key: p.children[0].key }, end: { key: p.children[0].key } }

    cs.handleListMenu('ul-task')
    // setTimeout invoked in handleListMenu; wait for async update
    setTimeout(() => {
      expect(cs.taskUpdated).to.be.true
      done()
    }, 20)
  })

  it('createContainerBlock creates pre with codeContent', () => {
    const cs = new MiniCSDeep()
    const container = cs.createContainerBlock('fencecode', 'console.log(1)')
    const pre = container.children[0]
    const code = pre.children[0]
    const content = code.children[0]
    expect(pre.functionType).to.equal('fencecode')
    expect(content.text).to.equal('console.log(1)')
  })
})
