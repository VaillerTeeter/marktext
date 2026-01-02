import ImageToolbar from '../../../src/muya/lib/ui/imageToolbar'
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

const createMuya = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return {
    container,
    eventCenter: new EventCenter(),
    contentState: {
      deleteImage: createSpy(),
      updateImage: createSpy()
    }
  }
}

describe('muya imageToolbar', () => {
  const toolbars = []
  const tick = () => new Promise(resolve => setTimeout(resolve))

  afterEach(() => {
    while (toolbars.length) {
      toolbars.pop().destroy()
    }
    document.body.innerHTML = ''
  })

  const buildImageInfo = (align = 'inline') => ({
    token: { attrs: { 'data-align': align } }
  })

  const buildReference = () => ({
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 10, height: 10 })
  })

  it('shows on event, renders icons, and marks active alignment', async () => {
    const muya = createMuya()
    const toolbar = new ImageToolbar(muya, { showArrow: false })
    toolbars.push(toolbar)

    muya.eventCenter.dispatch('muya-image-toolbar', {
      reference: buildReference(),
      imageInfo: buildImageInfo('left')
    })

    await tick()

    expect(toolbar.status).to.equal(true)
    const root = toolbar.oldVnode.elm
    const items = root.querySelectorAll('li.item')
    expect(items.length).to.equal(toolbar.icons.length)
    expect(root.querySelector('li.item.left.active')).to.not.equal(null)
    expect(root.querySelector('li.item.inline.active')).to.equal(null)
  })

  it('hides when reference is missing', async () => {
    const muya = createMuya()
    const toolbar = new ImageToolbar(muya, { showArrow: false })
    toolbars.push(toolbar)

    muya.eventCenter.dispatch('muya-image-toolbar', {
      reference: null,
      imageInfo: buildImageInfo()
    })

    await tick()
    expect(toolbar.status).to.equal(false)
  })

  it('updates alignment on click and hides', async () => {
    const muya = createMuya()
    const { updateImage } = muya.contentState
    const toolbar = new ImageToolbar(muya, { showArrow: false })
    toolbars.push(toolbar)

    muya.eventCenter.dispatch('muya-image-toolbar', {
      reference: buildReference(),
      imageInfo: buildImageInfo('inline')
    })

    await tick()
    const root = toolbar.oldVnode.elm
    const leftItem = root.querySelector('li.item.left')
    leftItem.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

    expect(updateImage.calledOnce).to.equal(true)
    expect(updateImage.calledWith(toolbar.imageInfo, 'data-align', 'left')).to.equal(true)
    expect(toolbar.status).to.equal(false)
  })

  it('deletes image and hides transformer on delete', async () => {
    const muya = createMuya()
    const { deleteImage } = muya.contentState
    const transformerEvents = []
    muya.eventCenter.subscribe('muya-transformer', payload => transformerEvents.push(payload))

    const toolbar = new ImageToolbar(muya, { showArrow: false })
    toolbars.push(toolbar)

    const imageInfo = buildImageInfo('inline')
    muya.eventCenter.dispatch('muya-image-toolbar', { reference: buildReference(), imageInfo })
    await tick()

    const root = toolbar.oldVnode.elm
    root.querySelector('li.item.delete').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

    expect(deleteImage.calledOnce).to.equal(true)
    expect(deleteImage.calledWith(imageInfo)).to.equal(true)
    expect(transformerEvents[0]).to.deep.include({ reference: null })
    expect(toolbar.status).to.equal(false)
  })

  it('dispatches image selector on edit and hides', async () => {
    const muya = createMuya()
    const selectorEvents = []
    const transformerEvents = []
    muya.eventCenter.subscribe('muya-image-selector', payload => selectorEvents.push(payload))
    muya.eventCenter.subscribe('muya-transformer', payload => transformerEvents.push(payload))

    const toolbar = new ImageToolbar(muya, { showArrow: false })
    toolbars.push(toolbar)

    const imageInfo = buildImageInfo('inline')
    muya.eventCenter.dispatch('muya-image-toolbar', { reference: buildReference(), imageInfo })
    await tick()

    const root = toolbar.oldVnode.elm
    root.querySelector('li.item.edit').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

    expect(transformerEvents[0]).to.deep.include({ reference: null })
    expect(selectorEvents.length).to.equal(1)
    expect(selectorEvents[0].imageInfo).to.equal(imageInfo)
    expect(typeof selectorEvents[0].reference.getBoundingClientRect).to.equal('function')
    expect(toolbar.status).to.equal(false)
  })
})
