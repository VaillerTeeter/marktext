import editor from '../../../src/renderer/store/editor'

const { mutations } = editor
const electron = window.require('electron')
const originalSend = electron.ipcRenderer.send
const originalEmit = electron.ipcRenderer.emit
const originalBusEmit = require('../../../src/renderer/bus').$emit

describe('store editor tab management', () => {
  afterEach(() => {
    electron.ipcRenderer.send = originalSend
    electron.ipcRenderer.emit = originalEmit
    require('../../../src/renderer/bus').$emit = originalBusEmit
  })

  it('reorders tabs by id', () => {
    const state = { tabs: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] }
    mutations.EXCHANGE_TABS_BY_ID(state, { fromId: 'a', toId: 'c' })
    expect(state.tabs.map(t => t.id)).to.deep.equal(['b', 'a', 'c'])
  })

  it('pushes tab notifications with exclusive type', () => {
    const state = { tabs: [{ id: 't1', notifications: [{ exclusiveType: 'once', msg: 'old' }] }] }
    mutations.PUSH_TAB_NOTIFICATION(state, { tabId: 't1', msg: 'new', exclusiveType: 'once' })
    expect(state.tabs[0].notifications).to.have.length(1)
    expect(state.tabs[0].notifications[0].msg).to.equal('new')
  })

  it('closes tabs and notifies main process', () => {
    const tab = { id: 'x', pathname: '/tmp/a.md', markdown: 'text', cursor: {}, history: { stack: [], index: -1 } }
    const state = { tabs: [tab], currentFile: tab, listToc: ['toc'], toc: ['toc'] }
    const sent = []
    electron.ipcRenderer.send = (...args) => sent.push(args)
    mutations.CLOSE_TABS(state, ['x'])
    expect(sent[0][0]).to.equal('mt::window-tab-closed')
    expect(state.tabs).to.have.length(0)
    expect(state.toc).to.deep.equal([])
  })
})
