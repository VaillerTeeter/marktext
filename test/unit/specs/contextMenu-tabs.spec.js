import { expect } from 'chai'
import bus from '@/bus'

import * as actions from '@/contextMenu/tabs/actions'
import * as menuItems from '@/contextMenu/tabs/menuItems'

const createSpy = (impl = () => {}) => {
  const fn = (...args) => {
    fn.calls.push(args)
    fn.callCount += 1
    return impl(...args)
  }
  fn.calls = []
  fn.callCount = 0
  fn.calledWith = (...expected) => fn.calls.some(args => args.length === expected.length && args.every((val, idx) => val === expected[idx]))
  return fn
}

describe('tabs context menu actions', () => {
  let originalEmit
  let emitSpy

  beforeEach(() => {
    originalEmit = bus.$emit
    emitSpy = createSpy()
    bus.$emit = emitSpy
  })

  afterEach(() => {
    bus.$emit = originalEmit
  })

  it('emits all tab bus events', () => {
    const id = 'tab-1'
    actions.closeThis(id)
    actions.closeOthers(id)
    actions.closeSaved()
    actions.closeAll()
    actions.rename(id)
    actions.copyPath(id)
    actions.showInFolder(id)

    expect(emitSpy.calledWith('TABS::close-this', id)).to.be.true
    expect(emitSpy.calledWith('TABS::close-others', id)).to.be.true
    expect(emitSpy.calledWith('TABS::close-saved')).to.be.true
    expect(emitSpy.calledWith('TABS::close-all')).to.be.true
    expect(emitSpy.calledWith('TABS::rename', id)).to.be.true
    expect(emitSpy.calledWith('TABS::copy-path', id)).to.be.true
    expect(emitSpy.calledWith('TABS::show-in-folder', id)).to.be.true
  })
})

describe('tabs context menu items', () => {
  let originalEmit
  let emitSpy

  beforeEach(() => {
    originalEmit = bus.$emit
    emitSpy = createSpy()
    bus.$emit = emitSpy
  })

  afterEach(() => {
    bus.$emit = originalEmit
  })

  it('delegates clicks to actions with tab id', () => {
    const fakeMenuItem = { _tabId: 't1' }
    menuItems.CLOSE_THIS.click(fakeMenuItem)
    menuItems.CLOSE_OTHERS.click(fakeMenuItem)
    menuItems.CLOSE_SAVED.click(fakeMenuItem)
    menuItems.CLOSE_ALL.click(fakeMenuItem)
    menuItems.RENAME.click(fakeMenuItem)
    menuItems.COPY_PATH.click(fakeMenuItem)
    menuItems.SHOW_IN_FOLDER.click(fakeMenuItem)

    expect(emitSpy.calledWith('TABS::close-this', 't1')).to.be.true
    expect(emitSpy.calledWith('TABS::close-others', 't1')).to.be.true
    expect(emitSpy.calledWith('TABS::close-saved')).to.be.true
    expect(emitSpy.calledWith('TABS::close-all')).to.be.true
    expect(emitSpy.calledWith('TABS::rename', 't1')).to.be.true
    expect(emitSpy.calledWith('TABS::copy-path', 't1')).to.be.true
    expect(emitSpy.calledWith('TABS::show-in-folder', 't1')).to.be.true
  })
})

describe('tabs context menu popup', () => {
  const remoteModulePath = require.resolve('@electron/remote')
  const originalRemoteCache = require.cache[remoteModulePath]
  let menus
  let showContextMenu

  beforeEach(() => {
    menus = []
    class FakeMenu {
      constructor () {
        this.items = []
        this.popupArgs = null
        menus.push(this)
      }
      append (item) {
        this.items.push(item)
      }
      popup (...args) {
        this.popupArgs = args
      }
    }
    class FakeMenuItem {
      constructor (item) {
        Object.assign(this, item)
      }
    }
    const fakeRemote = {
      Menu: FakeMenu,
      MenuItem: FakeMenuItem,
      getCurrentWindow: () => 'win'
    }
    require.cache[remoteModulePath] = { exports: fakeRemote }

    delete require.cache[require.resolve('../../../src/renderer/contextMenu/tabs/index')]
    showContextMenu = require('../../../src/renderer/contextMenu/tabs/index').showContextMenu
  })

  afterEach(() => {
    if (originalRemoteCache) {
      require.cache[remoteModulePath] = originalRemoteCache
    } else {
      delete require.cache[remoteModulePath]
    }
    delete require.cache[require.resolve('../../../src/renderer/contextMenu/tabs/index')]
  })

  it('sets enabled flags based on pathname and attaches tab id', () => {
    const tabWithPath = { id: 't1', pathname: '/tmp/a.md' }
    showContextMenu({ clientX: 5, clientY: 6 }, tabWithPath)

    expect(menus[0].items.length).to.equal(8)
    menus[0].items.forEach(item => {
      expect(item._tabId).to.equal('t1')
    })
    // RENAME/COPY_PATH/SHOW_IN_FOLDER are enabled when pathname exists
    const enabledItems = menus[0].items.filter(i => i.enabled !== undefined)
    enabledItems.forEach(i => expect(i.enabled).to.equal(true))

    const tabWithoutPath = { id: 't2', pathname: '' }
    showContextMenu({ clientX: 1, clientY: 2 }, tabWithoutPath)
    const disabledItems = menus[1].items.filter(i => i.enabled !== undefined)
    disabledItems.forEach(i => expect(i.enabled).to.equal(false))
    expect(menus[1].popupArgs[0][0]).to.deep.equal({ window: 'win', x: 1, y: 2 })
  })
})
