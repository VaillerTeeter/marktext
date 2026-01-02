import { expect } from 'chai'
import bus from '@/bus'
import * as actions from '@/contextMenu/sideBar/actions'
import {
  SEPARATOR,
  NEW_FILE,
  NEW_DIRECTORY,
  COPY,
  CUT,
  PASTE,
  RENAME,
  DELETE,
  SHOW_IN_FOLDER
} from '@/contextMenu/sideBar/menuItems'
import { createShowContextMenu } from '@/contextMenu/sideBar/index'

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

describe('sidebar context menu actions', () => {
  let emitSpy
  let originalEmit

  beforeEach(() => {
    emitSpy = createSpy()
    originalEmit = bus.$emit
    bus.$emit = emitSpy
  })

  afterEach(() => {
    bus.$emit = originalEmit
  })

  it('emits new file', () => {
    actions.newFile()
    expect(emitSpy.calledWith('SIDEBAR::new', 'file')).to.be.true
  })

  it('emits new directory', () => {
    actions.newDirectory()
    expect(emitSpy.calledWith('SIDEBAR::new', 'directory')).to.be.true
  })

  it('emits copy/cut', () => {
    actions.copy()
    actions.cut()
    expect(emitSpy.calledWith('SIDEBAR::copy-cut', 'copy')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::copy-cut', 'cut')).to.be.true
  })

  it('emits paste/rename/remove/show-in-folder', () => {
    actions.paste()
    actions.rename()
    actions.remove()
    actions.showInFolder()
    expect(emitSpy.calledWith('SIDEBAR::paste')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::rename')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::remove')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::show-in-folder')).to.be.true
  })
})

describe('sidebar context menu items', () => {
  let emitSpy
  let originalEmit

  beforeEach(() => {
    emitSpy = createSpy()
    originalEmit = bus.$emit
    bus.$emit = emitSpy
  })

  afterEach(() => {
    bus.$emit = originalEmit
  })

  it('delegates click handlers', () => {
    NEW_FILE.click()
    NEW_DIRECTORY.click()
    COPY.click()
    CUT.click()
    PASTE.click()
    RENAME.click()
    DELETE.click()
    SHOW_IN_FOLDER.click()

    expect(emitSpy.calledWith('SIDEBAR::new', 'file')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::new', 'directory')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::copy-cut', 'copy')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::copy-cut', 'cut')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::paste')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::rename')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::remove')).to.be.true
    expect(emitSpy.calledWith('SIDEBAR::show-in-folder')).to.be.true
  })
})

describe('sidebar showContextMenu', () => {
  let showWithStubbedRemote
  let fakeMenuInstances

  beforeEach(() => {
    fakeMenuInstances = []

    class FakeMenu {
      constructor () {
        this.appendCalls = []
        this.popupArgs = null
        fakeMenuInstances.push(this)
      }

      append (item) {
        this.appendCalls.push(item)
      }

      popup (...args) {
        this.popupArgs = args
      }
    }

    class FakeMenuItem {
      constructor (item) {
        this.item = item
      }
    }

    const fakeRemote = {
      getCurrentWindow: () => 'win',
      Menu: FakeMenu,
      MenuItem: FakeMenuItem
    }

    showWithStubbedRemote = createShowContextMenu(fakeRemote, {
      SEPARATOR,
      NEW_FILE,
      NEW_DIRECTORY,
      COPY,
      CUT,
      PASTE,
      RENAME,
      DELETE,
      SHOW_IN_FOLDER
    })
  })

  it('builds menu, toggles paste enabled, and pops up at event coords', () => {
    showWithStubbedRemote({ clientX: 10, clientY: 20 }, true)
    expect(PASTE.enabled).to.be.true
    expect(fakeMenuInstances[0].appendCalls.length).to.equal(11)
    expect(fakeMenuInstances[0].popupArgs[0][0]).to.deep.equal({ window: 'win', x: 10, y: 20 })

    showWithStubbedRemote({ clientX: 1, clientY: 2 }, false)
    expect(PASTE.enabled).to.be.false
    expect(fakeMenuInstances[1].appendCalls.length).to.equal(11)
  })
})
