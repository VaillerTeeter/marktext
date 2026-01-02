import ImagePathPicker from '../../../src/muya/lib/ui/imagePicker'
import EventCenter from '../../../src/muya/lib/eventHandler/event'

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

const createList = () => ([
  { text: 'Upload Image', iconClass: 'icon-upload' },
  { text: 'Select from Files', iconClass: 'icon-folder' }
])

const createMuya = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return {
    container,
    eventCenter: new EventCenter()
  }
}

describe('muya imagePicker', () => {
  const pickers = []

  afterEach(() => {
    while (pickers.length) {
      pickers.pop().destroy()
    }
    document.body.innerHTML = ''
  })

  it('shows on event, renders list, and marks first active', async () => {
    const muya = createMuya()
    const picker = new ImagePathPicker(muya)
    pickers.push(picker)

    const list = createList()
    muya.eventCenter.dispatch('muya-image-picker', {
      reference: createReference(),
      list,
      cb: () => {}
    })

    await tick()

    expect(picker.status).to.equal(true)
    const items = picker.oldVnode.elm.querySelectorAll('li.item')
    expect(items.length).to.equal(list.length)
    expect(picker.activeItem).to.equal(list[0])
    expect(picker.oldVnode.elm.querySelector('li.item.active').dataset.label).to.equal(list[0].text)
  })

  it('hides immediately when list is empty', () => {
    const muya = createMuya()
    const picker = new ImagePathPicker(muya)
    pickers.push(picker)

    muya.eventCenter.dispatch('muya-image-picker', {
      reference: createReference(),
      list: [],
      cb: () => {}
    })

    expect(picker.status).to.equal(false)
  })

  it('moves active item with keyboard navigation', async () => {
    const muya = createMuya()
    const picker = new ImagePathPicker(muya)
    pickers.push(picker)
    const list = createList()

    muya.eventCenter.dispatch('muya-image-picker', {
      reference: createReference(),
      list,
      cb: () => {}
    })

    await tick()

    const down = new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    muya.container.dispatchEvent(down)
    expect(picker.activeItem).to.equal(list[1])
    expect(picker.oldVnode.elm.querySelector('li.item.active').dataset.label).to.equal(list[1].text)
  })

  it('calls callback and hides after selection click', async () => {
    const muya = createMuya()
    const cb = createSpy()
    const picker = new ImagePathPicker(muya)
    pickers.push(picker)
    const list = createList()

    muya.eventCenter.dispatch('muya-image-picker', { reference: createReference(), list, cb })
    await tick()

    const secondItem = picker.oldVnode.elm.querySelector('[data-label="Select from Files"]')
    secondItem.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

    expect(cb.calledOnce).to.equal(true)
    expect(cb.calledWith(list[1])).to.equal(true)
    await tick()
    expect(picker.status).to.equal(false)
  })

  it('returns item element via getItemElement', async () => {
    const muya = createMuya()
    const picker = new ImagePathPicker(muya)
    pickers.push(picker)
    const list = createList()

    muya.eventCenter.dispatch('muya-image-picker', { reference: createReference(), list, cb: () => {} })
    await tick()

    const el = picker.getItemElement(list[0])
    expect(el).to.not.equal(null)
    expect(el.dataset.label).to.equal(list[0].text)
  })
})
