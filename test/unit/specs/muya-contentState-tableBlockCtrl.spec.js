import { expect } from 'chai'
import tableBlockCtrl from '../../../src/muya/lib/contentState/tableBlockCtrl'

const createSpy = () => {
  const fn = (...args) => { fn.called = true; fn.args = args }
  fn.called = false
  return fn
}

class DummyCS {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.blocks = []
    this.cursor = { start: null, end: null }
    this.muya = {
      container: document.createElement('div'),
      eventCenter: { dispatch: createSpy() }
    }
    this.render = createSpy()
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

  createBlockP (text = '') {
    const p = this.createBlock('p')
    const span = this.createBlock('span', { type: 'span', text, functionType: 'paragraphContent' })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }

  getBlock (key) { return this.blockMap[key] }
  getAnchor (block) { return block }
  firstInDescendant (root) {
    const stack = [root]
    while (stack.length) {
      const node = stack.shift()
      if (!node) continue
      if (node.functionType === 'cellContent') return node
      if (node.children && node.children.length) {
        for (const c of node.children) stack.push(c)
      }
    }
    return null
  }
}

tableBlockCtrl(DummyCS)

describe('contentState tableBlockCtrl', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('tableBlockUpdate returns false when not a table paragraph', () => {
    const cs = new DummyCS()
    const p = cs.createBlockP('not a table')
    cs.blocks = [p]
    const res = cs.tableBlockUpdate(p)
    expect(res).to.equal(false)
  })

  it('initTable creates figure/table structure from table markdown', () => {
    const cs = new DummyCS()
    const p = cs.createBlockP('| a | b |')
    cs.blocks = [p]
    // simulate container nodes
    cs.muya.container.id = 'editor'
    document.body.appendChild(cs.muya.container)

    const pre = cs.initTable(p)
    // initTable should convert paragraph into a figure/table structure
    expect(p.type).to.equal('figure')
    expect(p.functionType).to.equal('table')
    expect(p.children.length).to.be.greaterThan(0)
    // returned pre (first cell content in tbody) may exist
    expect(pre === null || pre).to.satisfy(x => x === null || typeof x === 'object')
  })
})
