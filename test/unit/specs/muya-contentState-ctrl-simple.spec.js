import { expect } from 'chai'
import ContentState from '../../../src/muya/lib/contentState'
import selection from '../../../src/muya/lib/selection'

// Lightweight spy helper reused across controller cases.
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

// Minimal muya stub sufficient for controller interactions.
const createMuya = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return {
    container,
    options: { fontSize: 16, lineHeight: 1.5 },
    blur: () => {},
    dispatchSelectionChange: createSpy(),
    dispatchSelectionFormats: createSpy(),
    dispatchChange: createSpy(),
    eventCenter: { dispatch: createSpy() }
  }
}

describe('contentState controller basics', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('emojiCtrl', () => {
    it('replaces emoji token under cursor and updates cursor offsets', () => {
      const muya = createMuya()
      const cs = new ContentState(muya, { bulletListMarker: '-' })
      const block = { key: 'b1', text: ':smile:', type: 'span' }
      cs.getBlock = key => (key === block.key ? block : null)
      cs.partialRender = createSpy()
      cs.cursor = {
        start: { key: block.key, offset: 1 },
        end: { key: block.key, offset: 1 }
      }

      cs.setEmoji({ aliases: ['joy'] })

      expect(block.text).to.include(':joy:')
      expect(cs.cursor.start.offset).to.be.greaterThan(0)
      expect(cs.partialRender.callCount).to.equal(1)
    })

    it('does nothing when cursor is not on an emoji token', () => {
      const muya = createMuya()
      const cs = new ContentState(muya, { bulletListMarker: '-' })
      const block = { key: 'b2', text: 'plain text', type: 'span' }
      cs.getBlock = () => block
      cs.partialRender = createSpy()
      cs.cursor = {
        start: { key: block.key, offset: 0 },
        end: { key: block.key, offset: 0 }
      }

      cs.setEmoji({ aliases: ['wave'] })

      expect(block.text).to.equal('plain text')
      expect(cs.partialRender.called).to.equal(false)
    })
  })

  describe('tocCtrl', () => {
    it('collects headings, trimming setext and atx styles', () => {
      const muya = createMuya()
      const cs = new ContentState(muya, { bulletListMarker: '-' })
      const h1 = { type: 'h1', headingStyle: 'setext', key: 'h1', children: [{ text: ' Title 1 ' }] }
      const h2 = { type: 'h2', headingStyle: 'atx', key: 'h2', children: [{ text: '# Title 2 ' }] }
      const para = { type: 'p', key: 'p', children: [{ text: 'body' }] }
      cs.blocks = [h1, h2, para]

      const toc = cs.getTOC()

      expect(toc).to.deep.equal([
        { content: 'Title 1', lvl: 1, slug: 'h1' },
        { content: 'Title 2', lvl: 2, slug: 'h2' }
      ])
    })
  })

  describe('linkCtrl', () => {
    it('unlinks markdown link tokens and renders once', () => {
      const muya = createMuya()
      const cs = new ContentState(muya, { bulletListMarker: '-' })
      const block = { key: 'link-block', text: '[foo](http://x)', type: 'span' }
      cs.getBlock = () => block
      cs.singleRender = createSpy()

      cs.unlink({
        key: block.key,
        token: {
          type: 'link',
          href: 'http://x',
          range: { start: 0, end: block.text.length }
        }
      })

      expect(block.text).to.equal('http://x')
      expect(cs.cursor.start.offset).to.equal(0)
      expect(cs.cursor.end.offset).to.equal(block.text.length)
      expect(cs.singleRender.callCount).to.equal(1)
      expect(muya.dispatchChange.callCount).to.equal(1)
    })

    it('falls back to console error when anchor missing', () => {
      const muya = createMuya()
      const cs = new ContentState(muya, { bulletListMarker: '-' })
      const block = { key: 'plain', text: 'no link', type: 'span' }
      cs.getBlock = () => block
      const originalError = console.error
      console.error = createSpy()

      cs.unlink({ key: block.key, token: { type: 'text', raw: '[]', range: { start: 0, end: 2 } } })

      expect(block.text).to.equal('no link')
      expect(console.error.called).to.equal(true)

      console.error = originalError
    })
  })

  describe('footnoteCtrl', () => {
    it('transforms footnote line into figure and repositions cursor', () => {
      const muya = createMuya()
      const cs = new ContentState(muya, { bulletListMarker: '-' })

      // Lightweight tree helpers to satisfy updateFootnote expectations.
      const blocks = []
      cs.blocks = blocks
      cs.createBlock = (type, props = {}) => ({ type, key: `${type}-${Math.random().toString(36).slice(2, 8)}`, children: [], ...props })
      cs.createBlockP = text => ({ type: 'p', key: `p-${Math.random().toString(36).slice(2, 8)}`, children: [{ key: `t-${Math.random().toString(36).slice(2, 8)}`, text }] })
      cs.appendChild = (parent, child) => { child.parent = parent.key; parent.children.push(child) }
      cs.insertBefore = (node, ref) => { const i = blocks.indexOf(ref); if (i >= 0) { blocks.splice(i, 0, node) } else { blocks.unshift(node) } }
      cs.removeBlock = node => { const i = blocks.indexOf(node); if (i >= 0) { blocks.splice(i, 1) } }
      cs.checkInlineUpdate = createSpy()
      cs.isCollapse = () => true
      cs.render = createSpy()

      const line = { text: '[^id]: footnote', key: 'line', children: [] }
      const block = { key: 'wrap', type: 'p' }
      blocks.push(block)
      cs.cursor = { start: { key: 'line', offset: 5 }, end: { key: 'line', offset: 5 } }

      const wrapper = cs.updateFootnote(block, line)

      expect(wrapper.type).to.equal('figure')
      expect(blocks[0]).to.equal(wrapper)
      expect(cs.cursor.start.offset).to.equal(3) // offset reduced by identifier length
      expect(cs.checkInlineUpdate.callCount).to.equal(1)
      expect(cs.render.callCount).to.equal(1)
    })

    it('creates footnote at document end and scrolls into view when found', () => {
      const muya = createMuya()
      const cs = new ContentState(muya, { bulletListMarker: '-' })
      const blocks = [{ key: 'last' }]
      cs.blocks = blocks
      cs.createBlockP = text => ({ key: 'p-last', children: [{ key: 'p-text', text }] })
      cs.insertAfter = (node, ref) => { const i = blocks.indexOf(ref); blocks.splice(i + 1, 0, node) }
      cs.updateFootnote = createSpy()

      // Add matching element to exercise scrollIntoView path.
      const el = document.createElement('div')
      el.id = 'section'
      document.body.appendChild(el)
      cs.updateFootnote = (block, line) => ({ key: 'section', block, line })

      cs.createFootnote('id')

      expect(blocks[1].children[0].text).to.equal('[^id]: ')
      expect(cs.cursor.start.key).to.equal('p-text')
      expect(cs.cursor.start.offset).to.equal(blocks[1].children[0].text.length)
    })
  })

  describe('deleteCtrl', () => {
    it('deletes selected image first', () => {
      const muya = createMuya()
      const cs = new ContentState(muya, { bulletListMarker: '-' })
      cs.selectedImage = { src: 'img.png' }
      cs.deleteImage = createSpy()

      const event = { preventDefault: createSpy() }
      cs.docDeleteHandler(event)

      expect(cs.selectedImage).to.equal(null)
      expect(cs.deleteImage.callCount).to.equal(1)
      expect(event.preventDefault.callCount).to.equal(1)
    })

    it('merges heading blocks when cursor at end', () => {
      const muya = createMuya()
      const startBlock = { key: 'h1', type: 'h1', text: 'A', parent: null }
      const nextBlock = { key: 'h2', type: 'h2', text: 'B', parent: null }
      const fake = {
        muya,
        selectedImage: null,
        selectedTableCells: null,
        cursor: { start: { key: 'h1', offset: 1 }, end: { key: 'h1', offset: 1 } },
        getBlock: key => {
          if (key === startBlock.key) return startBlock
          if (key === nextBlock.key) return nextBlock
          return null
        },
        findNextBlockInLocation: () => nextBlock,
        isOnlyRemoveableChild: () => false,
        getParent: () => ({ key: 'root' }),
        removeBlock: createSpy(),
        render: createSpy()
      }

      const originalRange = selection.getCursorRange
      selection.getCursorRange = () => ({ start: { key: 'h1', offset: 1 }, end: { key: 'h1', offset: 1 } })

      const event = { preventDefault: createSpy() }
      ContentState.prototype.deleteHandler.call(fake, event)

      expect(startBlock.text).to.equal('AB')
      expect(fake.render.callCount).to.equal(1)
      expect(event.preventDefault.callCount).to.equal(1)

      selection.getCursorRange = originalRange
    })

    it('strips leading header marker when caret at line start', () => {
      const startBlock = { key: 'span', type: 'span', text: '#\ntext', parent: null }
      const fake = {
        selectedImage: null,
        selectedTableCells: null,
        getBlock: key => (key === startBlock.key ? startBlock : null),
        findNextBlockInLocation: () => null,
        cursor: { start: { key: 'span', offset: 0 }, end: { key: 'span', offset: 0 } },
        singleRender: createSpy()
      }

      const originalRange = selection.getCursorRange
      selection.getCursorRange = () => ({ start: { key: 'span', offset: 0 }, end: { key: 'span', offset: 0 } })

      const event = { preventDefault: createSpy() }
      ContentState.prototype.deleteHandler.call(fake, event)

      expect(startBlock.text).to.equal('text')
      expect(fake.cursor.start.offset).to.equal(0)
      expect(event.preventDefault.callCount).to.equal(1)

      selection.getCursorRange = originalRange
    })
  })
})
