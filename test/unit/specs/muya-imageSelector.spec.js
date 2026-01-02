import { expect } from 'chai'
import ImageSelector from '../../../src/muya/lib/ui/imageSelector'
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

const nextTick = () => new Promise(resolve => setTimeout(resolve))

const createMuya = (withUnsplash = true, overrideOptions = {}) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const eventCenter = new EventCenter()
  const replaceImage = createSpy()
  const contentState = {
    replaceImage,
    selectedImage: { id: 'selected' },
    stateRender: { urlMap: new Map() }
  }
  const imagePathPicker = {
    status: false,
    step: createSpy(),
    selectItem: createSpy()
  }
  const options = Object.assign({
    unsplashAccessKey: withUnsplash ? 'fake-key' : undefined,
    imageAction: async src => `http://cdn.example/${src}`,
    imagePathPicker: async () => '/tmp/picked.png',
    imagePathAutoComplete: async () => [{ text: 'picked.png' }],
    photoCreatorClick: createSpy()
  }, overrideOptions)
  const muya = { container, eventCenter, contentState, imagePathPicker, options }
  return { muya, spies: { replaceImage, photoCreatorClick: options.photoCreatorClick, imagePathPicker } }
}

describe('muya imageSelector', () => {
  const floats = []

  afterEach(() => {
    while (floats.length) {
      const f = floats.pop()
      if (f.destroy) f.destroy()
    }
    document.body.innerHTML = ''
  })

  it('renders link tab, trims file protocol, handles enter/link action and autocomplete dispatch', async () => {
    const { muya, spies } = createMuya(false)
    const selector = new ImageSelector(muya, muya.options)
    floats.push(selector)
    selector.hide = createSpy()

    const reference = document.createElement('div')
    document.body.appendChild(reference)
    const payloads = []
    muya.eventCenter.subscribe('muya-image-picker', data => payloads.push(data))

    muya.eventCenter.dispatch('muya-image-selector', {
      reference,
      cb: createSpy(),
      imageInfo: { token: { attrs: { alt: 'old', src: 'file:///tmp/old.png', title: 't' } } }
    })

    expect(muya.contentState.selectedImage).to.equal(null)
    expect(selector.state.src).to.equal('/tmp/old.png')

    const root = selector.oldVnode.elm
    const embed = root.querySelector('button.muya-button.role-button.link')
    embed.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(spies.replaceImage.callCount).to.be.greaterThan(0)
    expect(selector.hide.callCount).to.equal(1)

    const prevent = createSpy()
    selector.handleKeyDown({ key: 'Enter', stopPropagation: createSpy(), preventDefault: prevent })
    await nextTick()
    expect(spies.replaceImage.callCount).to.be.greaterThan(0)

    selector.handleKeyUp({ key: 'ArrowUp', target: { value: 'foo' } })
    await selector.handleKeyUp({ key: 'a', target: { value: 'dir/file' } })
    expect(payloads.length).to.equal(1)
    payloads[0].cb({ text: 'file.png' })
    expect(selector.state.src).to.equal('dir/file.png')

    muya.imagePathPicker.status = true
    selector.srcInputKeyDown({ key: 'ArrowUp', preventDefault: prevent, stopPropagation: createSpy() })
    selector.srcInputKeyDown({ key: 'ArrowDown', preventDefault: prevent, stopPropagation: createSpy() })
    selector.srcInputKeyDown({ key: 'Tab', preventDefault: prevent, stopPropagation: createSpy() })
    selector.srcInputKeyDown({ key: 'Enter', preventDefault: prevent, stopPropagation: createSpy() })
    expect(spies.imagePathPicker.step.callCount).to.equal(3)
    expect(spies.imagePathPicker.selectItem.callCount).to.equal(1)
  })

  it('select tab triggers imagePathPicker flow and warns when picker missing', async () => {
    const { muya, spies } = createMuya(false)
    const selector = new ImageSelector(muya, muya.options)
    floats.push(selector)
    selector.hide = createSpy()

    selector.tab = 'select'
    selector.render()
    const root = selector.oldVnode.elm
    root.querySelector('button.muya-button.role-button.select').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(spies.replaceImage.callCount).to.equal(1)
    expect(selector.hide.callCount).to.equal(1)

    const warn = createSpy()
    const selectorNoPicker = new ImageSelector({ ...muya, options: { ...muya.options, imagePathPicker: undefined } }, { ...muya.options, imagePathPicker: undefined })
    floats.push(selectorNoPicker)
    selectorNoPicker.hide = createSpy()
    const origWarn = console.warn
    console.warn = warn
    await selectorNoPicker.handleSelectButtonClick()
    console.warn = origWarn
    expect(warn.callCount).to.equal(1)
  })

  it('unsplash tab renders loading/no-data/photos and handles clicks', async () => {
    const { muya, spies } = createMuya(true)
    const selector = new ImageSelector(muya, muya.options)
    floats.push(selector)
    selector.hide = createSpy()

    // override unsplash to avoid network
    const listSpy = createSpy()
    const getSpy = createSpy()
    const trackSpy = createSpy()
    selector.unsplash = {
      photos: {
        list: () => { listSpy(); return Promise.resolve({ type: 'success', response: { results: [] } }) },
        get: () => { getSpy(); return Promise.resolve({ type: 'success', response: { links: { download_location: 'dl' } } }) },
        trackDownload: trackSpy
      },
      search: {
        getPhotos: () => Promise.resolve({ type: 'success', response: { results: [] } })
      }
    }

    selector.tab = 'unsplash'
    selector.loading = true
    selector.render()
    let root = selector.oldVnode.elm
    expect(root.querySelector('.ag-plugin-loading')).to.not.equal(null)

    selector.loading = false
    selector.photoList = []
    selector.render()
    root = selector.oldVnode.elm
    expect(root.textContent).to.contain('No result')

    const photo = {
      urls: {
        thumb: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
        regular: 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
      },
      color: '#123',
      alt_description: 'alt',
      user: { name: 'user', links: { html: 'http://user' } },
      id: 'pid',
      links: { download_location: 'dl' }
    }
    selector.photoList = [photo]
    selector.replaceImageAsync = createSpy()
    selector.render()
    root = selector.oldVnode.elm
    root.querySelector('div.image-wrapper').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(selector.replaceImageAsync.callCount).to.equal(1)
    expect(getSpy.callCount).to.equal(1)
    expect(trackSpy.callCount).to.equal(1)

    const link = root.querySelector('div.des a')
    link.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(spies.photoCreatorClick.callCount).to.equal(1)

    await selector.searchPhotos('cat')
    await nextTick()
    expect(selector.loading).to.equal(false)
  })

  it('toggleMode flips full/simple rendering and tab switch works', () => {
    const { muya } = createMuya(false)
    const selector = new ImageSelector(muya, muya.options)
    floats.push(selector)
    selector.hide = createSpy()

    selector.tabClick({}, { value: 'link' })
    selector.render()
    let root = selector.oldVnode.elm
    const toggle = root.querySelector('span.description a')
    toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    selector.render()
    expect(selector.isFullMode).to.equal(true)

    selector.tabClick({}, { value: 'select' })
    expect(selector.tab).to.equal('select')
  })
})
