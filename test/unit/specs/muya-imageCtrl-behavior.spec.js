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

describe('muya imageCtrl behavior', () => {
  let originalQuerySelector

  before(() => {
    originalQuerySelector = document.querySelector
  })

  afterEach(() => {
    document.querySelector = originalQuerySelector
  })

  it('inserts image, encodes URL and moves cursor', () => {
    const block = { key: 'k1', type: 'span', functionType: 'paragraphContent', text: 'hello' }
    const muya = createMuya()
    const cs = {
      cursor: {
        start: { key: block.key, offset: 0 },
        end: { key: block.key, offset: block.text.length }
      },
      selectionFormats: () => ({ formats: [] }),
      getBlock: key => (key === block.key ? block : null),
      partialRender: createSpy(),
      muya
    }

    ContentState.prototype.insertImage.call(cs, { src: 'http://a/b c#d' })

    expect(block.text).to.equal('![hello](http://a/b%20c%23d)')
    expect(cs.cursor.start.offset).to.equal(2)
    expect(cs.cursor.end.offset).to.equal(7)
    expect(cs.partialRender.callCount).to.equal(1)
    expect(muya.dispatchChange.callCount).to.equal(1)
  })

  it('replaces existing image token keeping alt when src empty', () => {
    const text = '![old]() trailing'
    const block = { key: 'k2', type: 'span', functionType: 'paragraphContent', text }
    const muya = createMuya()
    const cs = {
      cursor: {
        start: { key: block.key, offset: 1 },
        end: { key: block.key, offset: 1 }
      },
      selectionFormats: () => ({
        formats: [{
          type: 'image',
          alt: 'oldAlt',
          src: '',
          range: { start: 0, end: 8 }
        }]
      }),
      getBlock: () => block,
      partialRender: createSpy(),
      muya
    }

    ContentState.prototype.insertImage.call(cs, { src: '/tmp/foo bar#baz', alt: 'newAlt' })

    expect(block.text).to.equal('![oldAlt](/tmp/foo%20bar%23baz) trailing')
    expect(cs.cursor.start.offset).to.equal(2)
    expect(cs.cursor.end.offset).to.equal(8)
    expect(cs.partialRender.callCount).to.equal(1)
    expect(muya.dispatchChange.callCount).to.equal(1)
  })

  it('updates image html and dispatches change when element exists', () => {
    const block = { key: 'k3', text: '<img src="old">' }
    const muya = createMuya()
    const clickSpy = createSpy()
    document.querySelector = sel => {
      if (sel === '#img-id img') {
        return { click: clickSpy }
      }
      return null
    }
    const cs = {
      muya,
      getBlock: () => block,
      singleRender: createSpy()
    }

    ContentState.prototype.updateImage.call(cs, { imageId: 'img-id', key: block.key, token: { attrs: { src: 'old' }, range: { start: 0, end: block.text.length } } }, 'src', 'fresh')

    expect(block.text).to.contain('src="fresh"')
    expect(clickSpy.callCount).to.equal(1)
    expect(cs.singleRender.callCount).to.equal(1)
    expect(muya.dispatchChange.callCount).to.equal(1)
  })

  it('replaces markdown image with encoded url and title', () => {
    const block = { key: 'k4', text: '![x](old)', type: 'span' }
    const muya = createMuya()
    const cs = {
      muya,
      getBlock: () => block,
      singleRender: createSpy()
    }

    ContentState.prototype.replaceImage.call(cs, { key: block.key, token: { type: 'image', range: { start: 0, end: block.text.length } } }, { alt: 'alt', src: 'path name#1', title: 'Title' })

    expect(block.text).to.equal('![alt](path%20name%231 "Title")')
    expect(cs.singleRender.callCount).to.equal(1)
    expect(muya.dispatchChange.callCount).to.equal(1)
  })

  it('deletes image, updates cursor and hides toolbars', () => {
    const block = { key: 'k5', text: '![a](old)rest' }
    const muya = createMuya()
    muya.eventCenter = { dispatch: createSpy() }
    const cs = {
      muya,
      getBlock: () => block,
      singleRender: createSpy(),
      cursor: {}
    }

    ContentState.prototype.deleteImage.call(cs, { key: block.key, token: { range: { start: 0, end: 9 } } })

    expect(block.text).to.equal('rest')
    expect(cs.cursor.start.offset).to.equal(0)
    expect(cs.singleRender.callCount).to.equal(1)
    expect(muya.eventCenter.dispatch.callCount).to.equal(2)
    expect(muya.dispatchChange.callCount).to.equal(1)
  })

  it('selects image, renders previous and current outmost blocks', () => {
    const muya = createMuya()
    const outMost = { key: 'out' }
    const oldOut = { key: 'old-out' }
    const block = { key: 'img', parent: null }
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

    ContentState.prototype.selectImage.call(cs, { key: block.key, token: { range: { end: 4 } }, imageId: 'imgId' })

    expect(cs.selectedImage.key).to.equal('img')
    expect(cs.cursor.start.offset).to.equal(4)
    expect(cs.singleRender.callCount).to.equal(2)
  })
})
