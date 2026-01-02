import editor from '../../../src/renderer/store/editor'
import notice from '../../../src/renderer/services/notification'

const { mutations } = editor

describe('store editor mutations', () => {
  const electron = window.require('electron')
  const originalSend = electron.ipcRenderer.send
  const originalNotify = notice.notify

  afterEach(() => {
    electron.ipcRenderer.send = originalSend
    notice.notify = originalNotify
  })

  it('LOAD_CHANGE notifies when tab missing', () => {
    // Silence expected error log from mutation under test
    const originalConsoleError = console.error
    console.error = () => {}

    let lastNotice
    notice.notify = opts => { lastNotice = opts }

    const state = {
      tabs: [],
      currentFile: {}
    }
    const change = {
      pathname: '/tmp/missing.md',
      data: {
        markdown: 'x',
        filename: 'missing.md',
        pathname: '/tmp/missing.md',
        encoding: { encoding: 'utf8', isBom: false },
        lineEnding: 'lf',
        adjustLineEndingOnSave: false,
        trimTrailingNewline: 3,
        isMixedLineEndings: false
      }
    }

    mutations.LOAD_CHANGE(state, change)
    expect(lastNotice).to.exist
    expect(lastNotice.title).to.include('Error')

    // Restore console.error
    console.error = originalConsoleError
  })

  it('SET_SAVE_STATUS_WHEN_REMOVE marks matching tab unsaved', () => {
    const state = {
      tabs: [
        { pathname: '/a.md', isSaved: true },
        { pathname: '/b.md', isSaved: true }
      ]
    }
    mutations.SET_SAVE_STATUS_WHEN_REMOVE(state, { pathname: '/a.md' })
    expect(state.tabs[0].isSaved).to.equal(false)
    expect(state.tabs[1].isSaved).to.equal(true)
  })

  it('CLOSE_TABS sends IPC to free window resources', () => {
    const sent = []
    electron.ipcRenderer.send = (...args) => sent.push(args)
    const state = {
      tabs: [
        { id: 1, pathname: '/a.md' },
        { id: 2, pathname: '' },
        { id: 3, pathname: '/c.md' }
      ],
      currentFile: { id: 2 }
    }

    mutations.CLOSE_TABS(state, [1, 3])
    // It should send window-tab-closed for tabs with pathname
    const channels = sent.map(s => s[0])
    expect(channels.filter(c => c === 'mt::window-tab-closed').length).to.equal(2)
  })

  it('EXCHANGE_TABS_BY_ID reorders tabs', () => {
    const state = {
      tabs: [
        { id: 'A' },
        { id: 'B' },
        { id: 'C' }
      ]
    }

    mutations.EXCHANGE_TABS_BY_ID(state, { fromId: 'A', toId: 'C' })
    expect(state.tabs.map(t => t.id)).to.deep.equal(['B', 'A', 'C'])
  })
})
