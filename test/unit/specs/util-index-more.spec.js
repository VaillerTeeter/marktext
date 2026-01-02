import { serialize, merge, dataURItoBlob, adjustCursor, getUniqueId, cloneObj, cloneObject, deepClone } from '../../../src/renderer/util/index'

describe('util index (additional)', () => {
  it('serializes params and merges objects', () => {
    expect(serialize({ a: 1, b: 'c' })).to.equal('a=1&b=c')
    expect(merge({ a: 1 }, { b: 2 })).to.deep.equal({ a: 1, b: 2 })
  })

  it('converts data uri to blob', () => {
    const blob = dataURItoBlob('data:text/plain;base64,YQ==')
    expect(blob instanceof Blob).to.equal(true)
  })

  it('adjusts cursor for table fences and blanks', () => {
    const cursor = { line: 0, ch: 0 }
    const adjusted = adjustCursor(cursor, '', '| a | b |', '')
    expect(adjusted.ch).to.be.above(0)
    const blankAdjusted = adjustCursor(cursor, '', '', '')
    expect(blankAdjusted).to.equal(null)
  })

  it('generates unique ids and clones deeply', () => {
    const first = getUniqueId()
    const second = getUniqueId()
    expect(first).to.not.equal(second)

    const src = { a: { b: 1 } }
    const shallow = cloneObject(src)
    const deep = deepClone(src)
    expect(shallow.a.b).to.equal(1)
    shallow.a.b = 2
    expect(deep.a.b).to.equal(1)
    const custom = cloneObj(src, false)
    expect(custom.a.b).to.equal(2)
  })
})
