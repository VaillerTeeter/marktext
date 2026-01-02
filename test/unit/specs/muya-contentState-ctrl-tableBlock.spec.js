import { expect } from 'chai'
import tableBlockCtrl from '../../../src/muya/lib/contentState/tableBlockCtrl'

class DummyContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.cursor = { start: null, end: null }
    this.initTable = block => {
      this.initCalledWith = block
      return { key: 'first-cell' }
    }
  }

  addBlock (block, parent = null) {
    this.blockMap[block.key] = block
    if (parent) {
      this.parentMap[block.key] = parent
      parent.children.push(block)
    }
    return block
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  getParents (block) {
    const parents = []
    let current = this.parentMap[block.key]
    while (current) {
      parents.push(current)
      current = this.parentMap[current.key]
    }
    return parents
  }
}

tableBlockCtrl(DummyContentState)

describe('contentState tableBlockCtrl', () => {
  it('tableBlockUpdate detects table paragraph and delegates to initTable', () => {
    const cs = new DummyContentState()
    const paragraph = cs.addBlock({ key: 'p1', type: 'p', children: [] })
    cs.addBlock({ key: 'text1', type: 'span', text: '|a|b|', children: [] }, paragraph)

    const result = cs.tableBlockUpdate(paragraph)

    expect(result).to.deep.equal({ key: 'first-cell' })
    expect(cs.initCalledWith.key).to.equal('p1')
  })

  it('tableBlockUpdate returns false when pattern does not match', () => {
    const cs = new DummyContentState()
    const paragraph = cs.addBlock({ key: 'p2', type: 'p', children: [] })
    cs.addBlock({ key: 'text2', type: 'span', text: 'plain', children: [] }, paragraph)

    const result = cs.tableBlockUpdate(paragraph)

    expect(result).to.equal(false)
    expect(cs.initCalledWith).to.equal(undefined)
  })

  it('getTableBlock returns common figure ancestor', () => {
    const cs = new DummyContentState()
    const figure = cs.addBlock({ key: 'figure', type: 'figure', children: [] })
    const childA = cs.addBlock({ key: 'a', type: 'p', children: [] }, figure)
    const childB = cs.addBlock({ key: 'b', type: 'p', children: [] }, figure)
    cs.cursor = {
      start: { key: 'a' },
      end: { key: 'b' }
    }

    const found = cs.getTableBlock()

    expect(found.key).to.equal('figure')
  })
})
