import {
  adjustCursor,
  cloneObj,
  cloneObject,
  dataURItoBlob,
  deepClone,
  delay,
  getUniqueId,
  hasKeys,
  isLinux,
  isOsx,
  isWindows,
  merge,
  serialize
} from '../../../src/renderer/util'

describe('renderer util helpers', () => {
  it('serializes and merges objects as expected', () => {
    const serialized = serialize({ query: 'hello world', filter: 'a&b' })
    expect(serialized).to.equal('query=hello%20world&filter=a&b')

    const merged = merge({ a: 1, shared: 'left' }, { b: 2, shared: 'right' })
    expect(merged).to.deep.equal({ a: 1, shared: 'right', b: 2 })
  })

  it('generates incremental ids and checks keys', () => {
    const id1 = getUniqueId()
    const id2 = getUniqueId()

    expect(id1).to.match(/^mt-/)
    expect(id2).to.match(/^mt-/)
    expect(id1).to.not.equal(id2)
    expect(hasKeys({})).to.equal(false)
    expect(hasKeys({ foo: 'bar' })).to.equal(true)
  })

  it('clones objects with and without prototypes', () => {
    const original = { nested: { value: 1 } }

    const legacyClone = cloneObj(original)
    legacyClone.nested.value = 2
    expect(original.nested.value).to.equal(1)

    const plain = cloneObject(original, false)
    expect(Object.getPrototypeOf(plain)).to.equal(null)
    expect(plain.nested.value).to.equal(1)

    const deep = deepClone(original)
    deep.nested.value = 3
    expect(original.nested.value).to.equal(1)
  })

  it('adjusts cursor positions for tables, code fences and lists', () => {
    const tableLine = '| foo | bar |'
    const tableStart = adjustCursor({ line: 10, ch: 0 }, '', tableLine, '')
    expect(tableStart.ch).to.equal(1)

    const tableEnd = adjustCursor({ line: 10, ch: 100 }, '', tableLine, '')
    expect(tableEnd.ch).to.equal(tableLine.lastIndexOf('|') - 1)

    const codeFence = adjustCursor({ line: 2, ch: 0 }, 'text before', '```js', 'console.log(1)')
    expect(codeFence.line).to.equal(3)
    expect(codeFence.ch).to.equal(0)

    const listCursor = adjustCursor({ line: 5, ch: 0 }, '', '- item', '')
    expect(listCursor.ch).to.equal(2)
  })

  it('returns null when cursor sits on blank or HTML lines', () => {
    expect(adjustCursor({ line: 0, ch: 0 }, '', '   ', '')).to.equal(null)
    expect(adjustCursor({ line: 0, ch: 5 }, '', '<div>text</div>', '')).to.equal(null)
  })

  it('converts data URIs to blobs', () => {
    const blob = dataURItoBlob('data:text/plain;base64,SGVsbG8=')
    expect(blob.type).to.equal('text/plain')
    expect(blob.size).to.equal(5)
  })

  it('exposes platform flags based on runtime', () => {
    expect(isLinux).to.equal(process.platform === 'linux')
    expect(isWindows).to.equal(process.platform === 'win32')
    expect(isOsx).to.equal(process.platform === 'darwin')
  })

  it('supports cancelling delay promises', async () => {
    const cancellable = delay(20)
    cancellable.cancel()

    await cancellable.then(
      () => { throw new Error('expected cancellation to reject') },
      () => {}
    )
  })
})
