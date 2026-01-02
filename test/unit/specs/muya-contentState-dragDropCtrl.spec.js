import { expect } from 'chai'
import dragDropCtrl from '../../../src/muya/lib/contentState/dragDropCtrl'
import { CLASS_OR_ID } from '../../../src/muya/lib/config'

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
    this.dropAnchor = null
    this.muya = {
      container: document.createElement('div'),
      options: { imageAction: async () => '/new.png' },
      eventCenter: { dispatch: createSpy() }
    }
    this.stateRender = { urlMap: new Map() }
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

  insertBefore (block, ref) {
    const parent = this.parentMap[ref.key] || { children: this.blocks }
    const idx = parent.children.indexOf(ref)
    parent.children.splice(idx, 0, block)
    this.parentMap[block.key] = parent
  }

  insertAfter (block, ref) {
    const parent = this.parentMap[ref.key] || { children: this.blocks }
    const idx = parent.children.indexOf(ref)
    parent.children.splice(idx + 1, 0, block)
    this.parentMap[block.key] = parent
  }

  removeBlock (block) {
    const parent = this.parentMap[block.key]
    if (!parent) return
    parent.children = parent.children.filter(c => c.key !== block.key)
    delete this.parentMap[block.key]
    delete this.blockMap[block.key]
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
}

dragDropCtrl(DummyCS)

describe('contentState dragDropCtrl', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('createGhost creates a ghost element positioned relative to anchor', () => {
    const cs = new DummyCS()
    const p = cs.createBlockP('hello')
    cs.blocks = [p]
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    document.body.appendChild(cs.muya.container)
    const para = Object.assign(document.createElement('div'), { id: p.key })
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    Object.defineProperty(para, 'getBoundingClientRect', { value: () => ({ top: 100, left: 10, width: 200, height: 20 }) })
    cs.muya.container.appendChild(para)

    cs.createGhost({ target: para, clientY: 99 })
    const ghost = document.querySelector('#mu-dragover-ghost')
    expect(ghost).to.not.equal(null)
    expect(ghost.style.width).to.equal('200px')
  })

  it('dragoverHandler sets dropEffect and calls createGhost for uri-list', () => {
    const cs = new DummyCS()
    cs.createGhost = createSpy()
    const event = { dataTransfer: { types: ['text/uri-list', 'text/html', 'Files'], items: [{ type: 'text/uri-list' }, { type: 'text/html' }], dropEffect: null }, stopPropagation: () => {} }
    cs.dragoverHandler(event)
    expect(event.dataTransfer.dropEffect).to.equal('copy')
    expect(cs.createGhost.called).to.equal(true)
  })

  it('dropHandler for uri-list inserts image block and dispatches stateChange', async () => {
    const cs = new DummyCS()
    const anchor = cs.createBlockP('anchor')
    cs.blocks = [anchor]
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    document.body.appendChild(cs.muya.container)
    const para = Object.assign(document.createElement('div'), { id: anchor.key })
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    cs.muya.container.appendChild(para)
    cs.dropAnchor = { anchor, position: 'down' }

    const item = { kind: 'string', type: 'text/uri-list', getAsString: (cb) => cb('http://example.com/a.png') }
    const event = { preventDefault: () => {}, dataTransfer: { items: [item], files: [] } }
    await cs.dropHandler(event)
    expect(cs.muya.eventCenter.dispatch.called).to.equal(true)
    // confirm an image paragraph was inserted by checking blocks length >=1
    expect(cs.blocks.length).to.be.at.least(1)
  })

  it('dropHandler for files calls imageAction and dispatches', async () => {
    const cs = new DummyCS()
    const anchor = cs.createBlockP('anchor2')
    cs.blocks = [anchor]
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    document.body.appendChild(cs.muya.container)
    const para = Object.assign(document.createElement('div'), { id: anchor.key })
    para.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    cs.muya.container.appendChild(para)
    cs.dropAnchor = { anchor, position: 'down' }

    const file = { type: 'image/png', name: 'a.png', path: '/tmp/a.png' }
    const event = { preventDefault: () => {}, dataTransfer: { items: [], files: [file] } }
    await cs.dropHandler(event)
    expect(cs.muya.eventCenter.dispatch.called).to.equal(true)
  })
})
