import { expect } from 'chai'
import FrontMenu from '../../../src/muya/lib/ui/frontMenu'
import { getLabel, getSubMenu } from '../../../src/muya/lib/ui/frontMenu/config'
import EventCenter from '../../../src/muya/lib/eventHandler/event'

const createSpy = () => {
  const fn = (...args) => {
    fn.called = true
    fn.callCount += 1
    fn.args = args
  }
  fn.called = false
  fn.callCount = 0
  return fn
}

const createMuya = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const eventCenter = new EventCenter()
  const duplicate = createSpy()
  const deleteParagraph = createSpy()
  const insertParagraph = createSpy()
  const updateParagraph = createSpy()
  const contentState = {
    duplicate,
    deleteParagraph,
    insertParagraph,
    updateParagraph,
    selectedBlock: null
  }
  return { muya: { container, eventCenter, contentState }, spies: { duplicate, deleteParagraph, insertParagraph, updateParagraph } }
}

describe('muya frontMenu', () => {
  const floats = []
  let originalSetTimeout
  let originalClientHeight

  beforeEach(() => {
    originalSetTimeout = global.setTimeout
    originalClientHeight = Object.getOwnPropertyDescriptor(document.documentElement, 'clientHeight')
  })

  afterEach(() => {
    global.setTimeout = originalSetTimeout
    if (originalClientHeight && originalClientHeight.configurable) {
      Object.defineProperty(document.documentElement, 'clientHeight', originalClientHeight)
    }
    while (floats.length) {
      const float = floats.pop()
      if (float.destroy) float.destroy()
    }
    document.body.innerHTML = ''
  })

  it('renders submenu, marks active, and inserts new paragraph', () => {
    const { muya, spies } = createMuya()
    const menu = new FrontMenu(muya, { showArrow: false })
    floats.push(menu)

    // run timers synchronously for hide()
    global.setTimeout = fn => { fn(); return 0 }

    Object.defineProperty(document.documentElement, 'clientHeight', { value: 200, configurable: true })

    const reference = document.createElement('div')
    reference.getBoundingClientRect = () => ({ bottom: 180 })
    document.body.appendChild(reference)

    menu.hide = createSpy()
    menu.reference = reference
    menu.outmostBlock = { type: 'p' }
    menu.startBlock = { key: 'k1' }
    menu.endBlock = { key: 'k1' }

    menu.render()

    const root = menu.oldVnode.elm
    const submenu = root.querySelector('div.submenu')
    expect(submenu.classList.contains('align-bottom')).to.equal(true)

    const active = submenu.querySelector('li.item.paragraph')
    expect(active.classList.contains('active')).to.equal(true)

    const newItem = root.querySelector('li.item.new')
    newItem.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(spies.insertParagraph.callCount).to.equal(1)
    expect(menu.hide.callCount).to.equal(1)
  })

  it('skips duplicate when front matter block', () => {
    const { muya, spies } = createMuya()
    const menu = new FrontMenu(muya, { showArrow: false })
    floats.push(menu)
    menu.hide = createSpy()

    menu.reference = document.createElement('div')
    menu.outmostBlock = { type: 'pre', functionType: 'frontmatter' }
    menu.startBlock = { key: 'k1' }
    menu.endBlock = { key: 'k1' }
    menu.render()

    const root = menu.oldVnode.elm
    root.querySelector('li.item.duplicate').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(spies.duplicate.callCount).to.equal(0)
    expect(menu.hide.callCount).to.equal(0)
  })

  it('does not hide when clicking turnInto', () => {
    const { muya } = createMuya()
    const menu = new FrontMenu(muya, { showArrow: false })
    floats.push(menu)
    menu.hide = createSpy()

    menu.reference = document.createElement('div')
    menu.outmostBlock = { type: 'p' }
    menu.startBlock = { key: 'k1' }
    menu.endBlock = { key: 'k1' }
    menu.render()

    const root = menu.oldVnode.elm
    root.querySelector('li.item.turnInto').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(menu.hide.callCount).to.equal(0)
  })

  it('hides when event dispatch has no reference', () => {
    const { muya } = createMuya()
    const menu = new FrontMenu(muya, { showArrow: false })
    floats.push(menu)
    menu.hide = createSpy()

    muya.eventCenter.dispatch('muya-front-menu', { reference: null })
    expect(menu.hide.callCount).to.equal(1)
  })
})

describe('frontMenu config helpers', () => {
  it('maps block types to labels', () => {
    expect(getLabel({ type: 'p' })).to.equal('paragraph')
    expect(getLabel({ type: 'figure', functionType: 'table' })).to.equal('table')
    expect(getLabel({ type: 'figure', functionType: 'html' })).to.equal('html')
    expect(getLabel({ type: 'figure', functionType: 'multiplemath' })).to.equal('mathblock')
    expect(getLabel({ type: 'pre', functionType: 'fencecode' })).to.equal('pre')
    expect(getLabel({ type: 'pre', functionType: 'indentcode' })).to.equal('pre')
    expect(getLabel({ type: 'pre', functionType: 'frontmatter' })).to.equal('front-matter')
    expect(getLabel({ type: 'ul', listType: 'task' })).to.equal('ul-task')
    expect(getLabel({ type: 'ul', listType: 'bullet' })).to.equal('ul-bullet')
    expect(getLabel({ type: 'ol' })).to.equal('ol-order')
    expect(getLabel({ type: 'blockquote' })).to.equal('blockquote')
    expect(getLabel({ type: 'h1' })).to.equal('heading 1')
    expect(getLabel({ type: 'h2' })).to.equal('heading 2')
    expect(getLabel({ type: 'h3' })).to.equal('heading 3')
    expect(getLabel({ type: 'h4' })).to.equal('heading 4')
    expect(getLabel({ type: 'h5' })).to.equal('heading 5')
    expect(getLabel({ type: 'h6' })).to.equal('heading 6')
    expect(getLabel({ type: 'hr' })).to.equal('hr')
    expect(getLabel({ type: 'unknown' })).to.equal('paragraph')
  })

  it('builds submenu options based on block type and range', () => {
    const start = { key: 'a' }
    const end = { key: 'a' }
    const pMenu = getSubMenu({ type: 'p' }, start, end)
    expect(pMenu.some(item => item.label === 'front-matter')).to.equal(false)
    expect(pMenu.length).to.be.greaterThan(0)

    const multiMenu = getSubMenu({ type: 'p' }, { key: 'a' }, { key: 'b' })
    expect(multiMenu.some(item => /heading/.test(item.label))).to.equal(false)

    const headingMenu = getSubMenu({ type: 'h1' }, start, end)
    expect(headingMenu.every(item => /heading|paragraph/.test(item.label))).to.equal(true)

    const listMenu = getSubMenu({ type: 'ul' }, start, end)
    expect(listMenu.every(item => /ul|ol/.test(item.label))).to.equal(true)

    const emptyMenu = getSubMenu({ type: 'blockquote' }, start, end)
    expect(emptyMenu.length).to.equal(0)
  })
})
