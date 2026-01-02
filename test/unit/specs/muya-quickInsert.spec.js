import QuickInsert from '../../../src/muya/lib/ui/quickInsert'
import EventCenter from '../../../src/muya/lib/eventHandler/event'
import { quickInsertObj } from '../../../src/muya/lib/ui/quickInsert/config'

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

const tick = () => new Promise(resolve => setTimeout(resolve))

const createReference = () => {
  const ref = document.createElement('div')
  document.body.appendChild(ref)
  return ref
}

const createBlock = (text = '@p') => ({ key: 'k1', text })

const createMuya = (canInserFrontMatterReturn = true) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return {
    container,
    eventCenter: new EventCenter(),
    contentState: {
      canInserFrontMatter: createSpy(() => canInserFrontMatterReturn),
      partialRender: createSpy(),
      updateParagraph: createSpy(),
      cursor: null
    }
  }
}

describe('muya quickInsert', () => {
  const pickers = []

  afterEach(() => {
    while (pickers.length) {
      pickers.pop().destroy()
    }
    document.body.innerHTML = ''
  })

  it('shows and renders default list when triggered', async () => {
    const muya = createMuya()
    const picker = new QuickInsert(muya)
    pickers.push(picker)

    const block = createBlock('@')
    muya.eventCenter.dispatch('muya-quick-insert', createReference(), block, true)
    await tick()

    expect(picker.status).to.equal(true)
    expect(picker.activeItem.label).to.equal(quickInsertObj['basic block'][0].label)
    const active = picker.oldVnode.elm.querySelector('div.item.active')
    expect(active.dataset.label).to.equal(picker.activeItem.label)
  })

  it('hides when event status is false', async () => {
    const muya = createMuya()
    const picker = new QuickInsert(muya)
    pickers.push(picker)
    const block = createBlock('@')

    muya.eventCenter.dispatch('muya-quick-insert', createReference(), block, true)
    await tick()
    expect(picker.status).to.equal(true)

    muya.eventCenter.dispatch('muya-quick-insert', null, block, false)
    expect(picker.status).to.equal(false)
  })

  it('filters results by search text and shows no-result when empty', async () => {
    const muya = createMuya()
    const picker = new QuickInsert(muya)
    pickers.push(picker)
    const block = createBlock('@')

    muya.eventCenter.dispatch('muya-quick-insert', createReference(), block, true)
    await tick()

    picker.search('header')
    const expectedHeaders = quickInsertObj.header.length
    expect(picker.renderArray.length).to.equal(expectedHeaders)
    expect(picker.oldVnode.elm.querySelectorAll('section').length).to.equal(1)

    picker.search('zzz')
    expect(picker.renderArray.length).to.equal(0)
    expect(picker.oldVnode.elm.querySelector('div.no-result').textContent).to.equal('No result')
  })

  it('removes front matter option when not allowed', async () => {
    const muya = createMuya(false)
    const picker = new QuickInsert(muya)
    pickers.push(picker)
    const block = createBlock('@')

    muya.eventCenter.dispatch('muya-quick-insert', createReference(), block, true)
    await tick()

    expect(muya.contentState.canInserFrontMatter.calledOnce).to.equal(true)
    const labels = picker.renderArray.map(item => item.label)
    expect(labels.includes('front-matter')).to.equal(false)
  })

  it('selects paragraph triggers partialRender and hide', async () => {
    const muya = createMuya()
    const picker = new QuickInsert(muya)
    pickers.push(picker)
    const block = createBlock('@')

    muya.eventCenter.dispatch('muya-quick-insert', createReference(), block, true)
    await tick()

    const paragraphItem = picker.oldVnode.elm.querySelector('[data-label="paragraph"]')
    paragraphItem.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

    expect(block.text).to.equal('')
    expect(muya.contentState.partialRender.calledOnce).to.equal(true)
    expect(muya.contentState.updateParagraph.called).to.equal(false)
    expect(muya.contentState.cursor).to.deep.equal({ start: { key: block.key, offset: 0 }, end: { key: block.key, offset: 0 } })
    await tick()
    expect(picker.status).to.equal(false)
  })

  it('selects other label updates paragraph and hides', async () => {
    const muya = createMuya()
    const picker = new QuickInsert(muya)
    pickers.push(picker)
    const block = createBlock('@')

    muya.eventCenter.dispatch('muya-quick-insert', createReference(), block, true)
    await tick()

    const bulletItem = picker.oldVnode.elm.querySelector('[data-label="ul-bullet"]')
    bulletItem.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

    expect(block.text).to.equal('')
    expect(muya.contentState.partialRender.called).to.equal(false)
    expect(muya.contentState.updateParagraph.calledWith('ul-bullet', true)).to.equal(true)
    await tick()
    expect(picker.status).to.equal(false)
  })
})
