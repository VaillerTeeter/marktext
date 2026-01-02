const { expect } = require('chai')
const _tableBlockCtrl = require('../../../src/muya/lib/contentState/tableBlockCtrl')
const tableBlockCtrl = _tableBlockCtrl && _tableBlockCtrl.default ? _tableBlockCtrl.default : _tableBlockCtrl

describe('muya contentState: tableBlockCtrl remaining edge branches', function() {
  function Dummy () {
    this.blockMap = {}
    this.parentMap = {}
    this.cursor = { start: null, end: null }
    this._id = 0
    this.muya = { eventCenter: { dispatch: () => {} } }
  }

  Dummy.prototype.createBlock = function (type, props = {}) {
    const key = `k_${++this._id}`
    const block = Object.assign({ key, type, children: [], parent: null, text: '' }, props)
    this.blockMap[key] = block
    return block
  }
  Dummy.prototype.appendChild = function (parent, child) {
    parent.children = parent.children || []
    child.parent = parent.key
    this.parentMap[child.key] = parent
    parent.children.push(child)
  }
  Dummy.prototype.getBlock = function (key) { return this.blockMap[key] }
  Dummy.prototype.getParent = function (block) { return this.parentMap[block.key] }
  Dummy.prototype.firstInDescendant = function (block) {
    if (!block.children || !block.children.length) return block
    let cur = block
    while (cur.children && cur.children.length) cur = cur.children[0]
    return cur
  }
  Dummy.prototype.closest = function (block, type) {
    let cur = block
    while (cur) {
      const p = this.getParent(cur)
      if (!p) return null
      if (p.type === type) return p
      cur = p
    }
    return null
  }
  Dummy.prototype.partialRender = function () {}

  it('throws when cursor spans multiple blocks', function() {
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    const p1 = cs.createBlock('p')
    const s1 = cs.createBlock('span', { text: '' })
    const p2 = cs.createBlock('p')
    const s2 = cs.createBlock('span', { text: '' })
    cs.appendChild(p1, s1)
    cs.appendChild(p2, s2)

    cs.cursor = { start: { key: s1.key }, end: { key: s2.key } }

    expect(() => cs.editTable({ target: 'row', action: 'insert', location: 'current' })).to.throw(Error)
  })

  it('throws when cursor not in table cell content', function() {
    tableBlockCtrl(Dummy)
    const cs = new Dummy()

    const p = cs.createBlock('p')
    const s = cs.createBlock('span', { text: '' })
    cs.appendChild(p, s)
    cs.cursor = { start: { key: s.key }, end: { key: s.key } }

    expect(() => cs.editTable({ target: 'row', action: 'insert', location: 'current' })).to.throw(Error)
  })
})
