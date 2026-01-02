import layout from '../../../src/renderer/store/layout'
import bus from '../../../src/renderer/bus'

describe('store layout mutations/actions', () => {
  const { mutations, actions } = layout

  afterEach(() => {
    localStorage.clear()
  })

  it('TOGGLE_LAYOUT_ENTRY flips boolean flag', () => {
    const state = { showSideBar: false }
    mutations.TOGGLE_LAYOUT_ENTRY(state, 'showSideBar')
    expect(state.showSideBar).to.equal(true)
  })

  it('SET_SIDE_BAR_WIDTH clamps and persists width', () => {
    const state = { sideBarWidth: 0 }
    mutations.SET_SIDE_BAR_WIDTH(state, 180)
    expect(state.sideBarWidth).to.equal(180)
    expect(localStorage.getItem('side-bar-width')).to.equal('220')
  })

  it('DISPATCH_LAYOUT_MENU_ITEMS sends ipc with current flags', () => {
    const sent = []
    const electron = window.require('electron')
    const originalSend = electron.ipcRenderer.send
    electron.ipcRenderer.send = (...args) => sent.push(args)
    const originalMarktext = global.marktext
    global.marktext = { env: { windowId: 1 } }

    const ctx = { state: { showTabBar: true, showSideBar: false } }
    actions.DISPATCH_LAYOUT_MENU_ITEMS.call({ }, ctx)

    expect(sent[0][0]).to.equal('mt::view-layout-changed')
    expect(sent[0][2]).to.deep.equal({ showTabBar: true, showSideBar: false })

    electron.ipcRenderer.send = originalSend
    global.marktext = originalMarktext
  })

  it('SET_LAYOUT updates state and notifies sidebar change to main', () => {
    const electron = window.require('electron')
    const originalSend = electron.ipcRenderer.send
    const sent = []
    electron.ipcRenderer.send = (...args) => sent.push(args)
    const state = { showSideBar: false }
    const originalMarktext = global.marktext
    global.marktext = { env: { windowId: 3 } }

    mutations.SET_LAYOUT(state, { showSideBar: true, rightColumn: 'files' })

    expect(state.showSideBar).to.equal(true)
    expect(sent[0]).to.deep.equal(['mt::update-sidebar-menu', 3, true])

    electron.ipcRenderer.send = originalSend
    global.marktext = originalMarktext
  })

  it('LISTEN_FOR_LAYOUT responds to ipc and bus events', () => {
    const electron = window.require('electron')
    const originalOn = electron.ipcRenderer.on
    const originalSend = electron.ipcRenderer.send
    const ipcHandlers = {}
    const sent = []
    electron.ipcRenderer.on = (channel, handler) => { ipcHandlers[channel] = handler }
    electron.ipcRenderer.send = (...args) => sent.push(args)

    const busHandlers = {}
    const originalBusOn = bus.$on
    const originalBusEmit = bus.$emit
    bus.$on = (evt, handler) => { busHandlers[evt] = handler }
    bus.$emit = (...args) => sent.push(args)

    const state = { rightColumn: '', showSideBar: false, showTabBar: false }
    const commits = []
    const dispatches = []
    const commit = (type, payload) => commits.push([type, payload])
    const dispatch = (type, payload) => dispatches.push([type, payload])
    const originalMarktext = global.marktext
    global.marktext = { env: { windowId: 9 } }

    actions.LISTEN_FOR_LAYOUT({ state, commit, dispatch })

    ipcHandlers['mt::set-view-layout']({}, { rightColumn: 'files', showSideBar: false })
    expect(commits[0][0]).to.equal('SET_LAYOUT')
    expect(commits[0][1].rightColumn).to.equal('files')
    expect(commits[0][1].showSideBar).to.equal(true)
    expect(dispatches[0][0]).to.equal('DISPATCH_LAYOUT_MENU_ITEMS')

    ipcHandlers['mt::toggle-view-layout-entry']({}, 'showTabBar')
    expect(commits[1]).to.deep.equal(['TOGGLE_LAYOUT_ENTRY', 'showTabBar'])
    expect(dispatches[1][0]).to.equal('DISPATCH_LAYOUT_MENU_ITEMS')

    busHandlers['view:toggle-layout-entry']('showSideBar')
    expect(sent.pop()).to.deep.equal(['mt::view-layout-changed', 9, { showSideBar: state.showSideBar }])

    electron.ipcRenderer.on = originalOn
    electron.ipcRenderer.send = originalSend
    bus.$on = originalBusOn
    bus.$emit = originalBusEmit
    global.marktext = originalMarktext
  })

  it('CHANGE_SIDE_BAR_WIDTH commits SET_SIDE_BAR_WIDTH', () => {
    const commits = []
    actions.CHANGE_SIDE_BAR_WIDTH({ commit: (...args) => commits.push(args) }, 320)
    expect(commits[0]).to.deep.equal(['SET_SIDE_BAR_WIDTH', 320])
  })
})
