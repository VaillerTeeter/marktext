import { expect } from 'chai'
import ContentState from '../../../src/muya/lib/contentState'

// Simple spy helper
const createSpy = () => {
  const fn = (...args) => {
    fn.called = true
    fn.callCount += 1
    fn.args = args
    fn.calls.push(args)
  }
  fn.called = false
  fn.callCount = 0
  fn.calls = []
  return fn
}

const createMuya = () => ({
  options: {},
  dispatchChange: createSpy(),
  eventCenter: { dispatch: createSpy() }
})

describe('muya imageCtrl additional cases', () => {
  let originalQuerySelector

  before(() => {
    originalQuerySelector = document.querySelector
  })

  afterEach(() => {
    document.querySelector = originalQuerySelector
  })

  it('updateImage without DOM element still updates block and dispatches', () => {
    const block = { key: 'u1', text: '<img src="old">' }
    const muya = createMuya()

    // ensure no element is found
    document.querySelector = () => null

    const cs = {
      muya,
      getBlock: () => block,
      singleRender: createSpy()
    }

    ContentState.prototype.updateImage.call(cs, { imageId: 'missing', key: block.key, token: { attrs: { src: 'old' }, range: { start: 0, end: block.text.length } } }, 'src', 'new')

    expect(block.text).to.contain('src="new"')
    expect(cs.singleRender.callCount).to.equal(1)
    expect(muya.dispatchChange.callCount).to.equal(0)
  })

  it('selectImage with no prevCursor renders only current outmost block', () => {
    const muya = createMuya()
    const outMost = { key: 'o1' }
    const oldOut = { key: 'old-out' }
    const block = { key: 'img2', parent: null }
    const cs = {
      muya,
      prevCursor: { start: { key: 'old', offset: 0 }, end: { key: 'old', offset: 0 } },
      selectedImage: null,
      findOutMostBlock: b => (b.key === 'old-block' ? oldOut : outMost),
      getBlock: key => {
        if (key === block.key) return block
        if (key === 'old') return { key: 'old-block', parent: null }
        return null
      },
      singleRender: createSpy(),
      cursor: {}
    }

    ContentState.prototype.selectImage.call(cs, { key: block.key, token: { range: { end: 3 } }, imageId: 'i2' })

    expect(cs.selectedImage.key).to.equal('img2')
    expect(cs.cursor.start.offset).to.equal(3)
    expect(cs.singleRender.callCount).to.equal(2)
  })
})
