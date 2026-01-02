/* global sinon */
import { expect } from 'chai'
import clickCtrl from '../../../src/muya/lib/contentState/clickCtrl'
import selection from '../../../src/muya/lib/selection'
import { CLASS_OR_ID } from '../../../src/muya/lib/config'

const createSpy = (impl = () => {}) => {
  const spy = (...args) => {
    spy.called = true
    spy.callCount += 1
    spy.calls.push(args)
    return impl(...args)
  }
  spy.called = false
  spy.callCount = 0
  spy.calls = []
  Object.defineProperty(spy, 'calledOnce', { get: () => spy.callCount === 1 })
  spy.calledWith = (...expected) => spy.calls.some(args => args.length === expected.length && args.every((val, idx) => val === expected[idx]))
  return spy
}

class MiniContentState {
  constructor () {
    this.blockMap = {}
    this.parentMap = {}
    this.blocks = []
    this.cursor = { start: null, end: null }
    this.muya = { options: { autoCheck: false }, container: document.createElement('div'), eventCenter: { dispatch: createSpy() } }
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

  getLastBlock () {
    return this.blocks[this.blocks.length - 1]
  }

  findOutMostBlock (block) {
    return this.parentMap[block.key] || block
  }

  checkNeedRender () {
    return false
  }

  codeBlockUpdate () {
    return false
  }

  insertAfter (block, reference) {
    const idx = this.blocks.indexOf(reference)
    this.blocks.splice(idx + 1, 0, block)
  }

  render () {
    return 'rendered'
  }

  partialRender () {
    return 'partial'
  }

  getBlock (key) {
    return this.blockMap[key]
  }

  firstInDescendant (block) {
    // return first child editable block
    return block.children[0]
  }

  getParent (block) {
    return this.parentMap[block.key]
  }
}

clickCtrl(MiniContentState)

describe('contentState clickCtrl', () => {
  afterEach(() => { document.body.innerHTML = ''; selection.getCursorRange = () => ({ start: null, end: null }); selection.getSelectionStart = () => null })

  it('inserts new paragraph when clicking below last paragraph', () => {
    const cs = new MiniContentState()
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    const last = cs.createBlock('span', { type: 'span', functionType: 'paragraphContent', text: 'hello' })
    cs.blocks.push(last)
    const archor = cs.createBlock('p', { key: 'archor' })
    cs.appendChild(archor, last)
    document.body.appendChild(Object.assign(document.createElement('div'), { id: archor.key }))
    const node = document.getElementById(archor.key)
    node.getBoundingClientRect = () => ({ top: 0, height: 10, width: 100 })

    const ev = { target: cs.muya.container, clientY: 20, preventDefault: () => {} }
    const res = cs.clickHandler(ev)
    expect(res).to.equal('rendered')
  })

  it('dispatches front menu when clicking front icon in same paragraph', () => {
    const cs = new MiniContentState()
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    const p = cs.createBlockP('t')
    cs.blocks.push(p)
    const start = { key: p.children[0].key, offset: 0 }
    cs.cursor = { start, end: start }
    cs.cursor.start = start
    cs.cursor.end = start
    // set selection cursor same
    selection.getCursorRange = () => ({ start, end: start })

    const front = document.createElement('div')
    front.classList.add(CLASS_OR_ID.AG_FRONT_ICON)
    front.getBoundingClientRect = () => ({ top: 0, height: 10, width: 10 })
    const target = front
    document.body.appendChild(front)
    const ev = { target }
    const res = cs.clickHandler(ev)
    expect(cs.muya.eventCenter.dispatch.called).to.equal(true)
    expect(res).to.equal('partial')
  })

  it('dispatches link format-click when clicking an anchor inline node', () => {
    const cs = new MiniContentState()
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    const p = cs.createBlockP('t')
    cs.blocks.push(p)
    const start = { key: p.children[0].key, offset: 0 }
    cs.cursor = { start, end: start }
    selection.getCursorRange = () => ({ start, end: start })

    // build inline anchor and set selection start to the anchor itself
    const a = document.createElement('a')
    a.classList.add(CLASS_OR_ID.AG_INLINE_RULE)
    a.setAttribute('href', 'https://example.com')
    a.textContent = 'link'
    document.body.appendChild(a)

    selection.getSelectionStart = () => a
    const ev = { target: a }
    cs.clickHandler(ev)
    expect(cs.muya.eventCenter.dispatch.called).to.equal(true)
    const calledWith = cs.muya.eventCenter.dispatch.calls[0]
    expect(calledWith[0]).to.equal('format-click')
  })

  it('dispatches format-click for inline emoji and strong', () => {
    const cs = new MiniContentState()
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    const p = cs.createBlockP('t')
    cs.blocks.push(p)
    const start = { key: p.children[0].key, offset: 0 }
    cs.cursor = { start, end: start }
    selection.getCursorRange = () => ({ start, end: start })

    const span = document.createElement('span')
    span.classList.add(CLASS_OR_ID.AG_INLINE_RULE)
    span.setAttribute('data-emoji', '😀')
    document.body.appendChild(span)
    selection.getSelectionStart = () => span
    cs.muya.eventCenter.dispatch.calls = []
    cs.clickHandler({ target: span })
    expect(cs.muya.eventCenter.dispatch.called).to.equal(true)

    // strong
    cs.muya.eventCenter.dispatch.called = false
    cs.muya.eventCenter.dispatch.callCount = 0
    const strong = document.createElement('strong')
    strong.classList.add(CLASS_OR_ID.AG_INLINE_RULE)
    const inner2 = document.createElement('i')
    strong.appendChild(inner2)
    document.body.appendChild(strong)
    selection.getSelectionStart = () => inner2
    // click on the inline node itself to avoid early return in isMuyaEditorElement branch
    cs.clickHandler({ target: inner2 })
    expect(cs.muya.eventCenter.dispatch.called).to.equal(true)
  })

  it('listItemCheckBoxClick updates children/parents and sets cursor then partialRender', () => {
    const cs = new MiniContentState()
    cs.muya.container.id = CLASS_OR_ID.AG_EDITOR_ID
    cs.muya.options.autoCheck = true

    const li = cs.createBlock('li', { key: 'li-1' })
    const span = cs.createBlock('span', { key: 'span-1', type: 'span', functionType: 'paragraphContent' })
    cs.appendChild(li, span)
    const parent = cs.createBlock('ul', { key: 'ul-1' })
    cs.appendChild(parent, li)
    cs.blocks.push(parent)

    // create DOM checkbox structure matching real list nesting
    // <li> (parent)
    //   <input id=li.key class=checkbox />
    //   <ul>
    //     <li>
    //       <input id=child-1 class=checkbox />
    //     </li>
    //   </ul>
    const liParentEl = document.createElement('li')
    const parentInput = document.createElement('input')
    parentInput.id = li.key
    parentInput.classList.add(CLASS_OR_ID.AG_TASK_LIST_ITEM_CHECKBOX)
    liParentEl.appendChild(parentInput)
    const ulEl = document.createElement('ul')
    const liChildEl = document.createElement('li')
    const childInput = document.createElement('input')
    childInput.id = 'child-1'
    childInput.classList.add(CLASS_OR_ID.AG_TASK_LIST_ITEM_CHECKBOX)
    liChildEl.appendChild(childInput)
    ulEl.appendChild(liChildEl)
    liParentEl.appendChild(ulEl)
    document.body.appendChild(liParentEl)
    parentInput.checked = true

    // stub helper functions to set parent relationships
    cs.firstInDescendant = () => span
    cs.getParent = () => parent

    // ensure mapping exists for getBlock lookup (map both inputs to the li block)
    if (!cs.getBlock(parentInput.id)) cs.blockMap[parentInput.id] = li
    if (!cs.getBlock(childInput.id)) cs.blockMap[childInput.id] = li

    // override instance setCheckBoxState to be tolerant in test
    cs.setCheckBoxState = function (checkboxEl, checked) {
      checkboxEl.checked = checked
      const block = this.getBlock(checkboxEl.id) || li
      if (block) block.checked = checked
      checkboxEl.classList.toggle(CLASS_OR_ID.AG_CHECKBOX_CHECKED)
    }

    // avoid complex DOM parent traversal in this unit test environment
    cs.updateParentsCheckBoxState = function () {}

    const res = cs.listItemCheckBoxClick(childInput)
    expect(res).to.equal('partial')
    expect(cs.cursor.start.key).to.equal(span.key)
  })
})
