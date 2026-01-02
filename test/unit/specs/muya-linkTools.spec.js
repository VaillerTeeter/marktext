/* global sinon */
import LinkTools from '../../../src/muya/lib/ui/linkTools'
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
  const ref = document.createElement('a')
  ref.textContent = 'link'
  document.body.appendChild(ref)
  return ref
}

const createMuya = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return {
    container,
    eventCenter: new EventCenter(),
    contentState: {
      unlink: createSpy()
    }
  }
}

const stubTimers = () => {
  const originalSetTimeout = window.setTimeout
  const originalClearTimeout = window.clearTimeout
  const timeouts = new Map()
  let id = 0
  window.setTimeout = (fn, delay) => {
    const handle = ++id
    timeouts.set(handle, { fn, delay })
    return handle
  }
  window.clearTimeout = handle => {
    timeouts.delete(handle)
  }
  const runTimers = delay => {
    for (const [handle, timer] of [...timeouts]) {
      if (timer.delay === delay) {
        timer.fn()
        timeouts.delete(handle)
      }
    }
  }
  const restore = () => {
    window.setTimeout = originalSetTimeout
    window.clearTimeout = originalClearTimeout
  }
  return { runTimers, restore, timeouts }
}

describe('muya linkTools', () => {
  const toolbars = []

  afterEach(() => {
    while (toolbars.length) {
      toolbars.pop().destroy()
    }
    document.body.innerHTML = ''
  })

  it('shows on event and renders icons', async () => {
    const muya = createMuya()
    const jumpClick = createSpy()
    const toolbar = new LinkTools(muya, { jumpClick })
    toolbars.push(toolbar)

    const linkInfo = { href: 'https://example.com' }
    muya.eventCenter.dispatch('muya-link-tools', {
      reference: createReference(),
      linkInfo
    })

    await tick()

    expect(toolbar.status).to.equal(true)
    expect(toolbar.oldVnode).to.not.equal(null)
    const items = toolbar.oldVnode.elm.querySelectorAll('li.item')
    expect(items.length).to.equal(toolbar.icons.length)
    expect(items[0].classList.contains(toolbar.icons[0].type)).to.equal(true)
  })

  it('hides after delay when reference is missing', () => {
    const timers = stubTimers()
    const muya = createMuya()
    const toolbar = new LinkTools(muya, {})
    toolbars.push(toolbar)

    const linkInfo = { href: 'https://example.com' }
    muya.eventCenter.dispatch('muya-link-tools', { reference: createReference(), linkInfo })
    timers.runTimers(0)
    expect(toolbar.status).to.equal(true)

    muya.eventCenter.dispatch('muya-link-tools', { reference: null, linkInfo })
    timers.runTimers(499)
    expect(toolbar.status).to.equal(true)
    timers.runTimers(500)
    expect(toolbar.status).to.equal(false)
    timers.restore()
  })

  it('cancels hide timer on mouseover', () => {
    const timers = stubTimers()
    const muya = createMuya()
    const toolbar = new LinkTools(muya, {})
    toolbars.push(toolbar)

    const linkInfo = { href: 'https://example.com' }
    muya.eventCenter.dispatch('muya-link-tools', { reference: createReference(), linkInfo })
    timers.runTimers(0)
    expect(toolbar.status).to.equal(true)

    muya.eventCenter.dispatch('muya-link-tools', { reference: null, linkInfo })
    toolbar.container.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }))
    timers.runTimers(500)
    expect(toolbar.status).to.equal(true)
    timers.restore()
  })

  it('hides on mouseleave', async () => {
    const muya = createMuya()
    const toolbar = new LinkTools(muya, {})
    toolbars.push(toolbar)

    muya.eventCenter.dispatch('muya-link-tools', {
      reference: createReference(),
      linkInfo: { href: 'https://example.com' }
    })

    await tick()
    toolbar.container.dispatchEvent(new window.MouseEvent('mouseleave', { bubbles: true }))
    expect(toolbar.status).to.equal(false)
  })

  it('unlinks and hides on unlink click', async () => {
    const muya = createMuya()
    const toolbar = new LinkTools(muya, {})
    toolbars.push(toolbar)

    const linkInfo = { href: 'https://example.com' }
    muya.eventCenter.dispatch('muya-link-tools', { reference: createReference(), linkInfo })
    await tick()

    const unlinkItem = toolbar.oldVnode.elm.querySelector('li.item.unlink')
    unlinkItem.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

    expect(muya.contentState.unlink.calledOnce).to.equal(true)
    expect(muya.contentState.unlink.calledWith(linkInfo)).to.equal(true)
    expect(toolbar.status).to.equal(false)
  })

  it('jumps and hides on jump click', async () => {
    const muya = createMuya()
    const jumpClick = createSpy()
    const toolbar = new LinkTools(muya, { jumpClick })
    toolbars.push(toolbar)

    const linkInfo = { href: 'https://example.com' }
    muya.eventCenter.dispatch('muya-link-tools', { reference: createReference(), linkInfo })
    await tick()

    const jumpItem = toolbar.oldVnode.elm.querySelector('li.item.jump')
    jumpItem.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

    expect(jumpClick.calledOnce).to.equal(true)
    expect(jumpClick.calledWith(linkInfo)).to.equal(true)
    expect(toolbar.status).to.equal(false)
  })
})
