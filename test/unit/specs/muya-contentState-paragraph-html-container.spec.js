import { expect } from 'chai'
import paragraphCtrl from '../../../src/muya/lib/contentState/paragraphCtrl'
import htmlBlock from '../../../src/muya/lib/contentState/htmlBlock'
import containerCtrl from '../../../src/muya/lib/contentState/containerCtrl'

class MiniContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.blocks = []
    this.cursor = { start: null, end: null }
    this.muya = { options: { frontmatterType: '-' }, container: document.createElement('div') }
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

  // helpers used by tests
  createBlockP (text = '') {
    const p = this.createBlock('p')
    const span = this.createBlock('span', { type: 'span', text, functionType: 'paragraphContent' })
    this.appendChild(p, span)
    this.blocks.push(p)
    return p
  }
}

// attach controllers
paragraphCtrl(MiniContentState)
htmlBlock(MiniContentState)
containerCtrl(MiniContentState)

describe('contentState paragraph/html/container helpers', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('createContainerBlock returns figure with pre and preview children', () => {
    const cs = new MiniContentState()
    const fig = cs.createContainerBlock('html', '<div>ok</div>')
    expect(fig.type).to.equal('figure')
    expect(fig.functionType).to.equal('html')
    expect(fig.children).to.have.lengthOf(2)
    const pre = fig.children[0]
    expect(pre.type).to.equal('pre')
    const code = pre.children[0]
    expect(code.type).to.equal('code')
    expect(code.children[0].functionType).to.equal('codeContent')
  })

  it('initHtmlBlock converts block into figure html with preview and returns preBlock', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('plain text')
    const preBlock = cs.initHtmlBlock(p)
    expect(p.type).to.equal('figure')
    expect(p.functionType).to.equal('html')
    expect(p.children).to.have.lengthOf(2)
    expect(preBlock.functionType).to.equal('html')
  })

  it('updateHtmlBlock initializes when p contains opening html tag', () => {
    const cs = new MiniContentState()
    const p = cs.createBlockP('<div>')
    const res = cs.updateHtmlBlock(p)
    expect(res).to.be.ok
    expect(p.type).to.equal('figure')
    expect(p.functionType).to.equal('html')
  })
})
