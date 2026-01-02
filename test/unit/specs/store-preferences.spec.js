import preferences from '../../../src/renderer/store/preferences'
import bus from '../../../src/renderer/bus'

const { mutations, actions, state } = preferences

describe('store preferences', () => {
  const electron = window.require('electron')
  const originalSend = electron.ipcRenderer.send
  const originalOn = electron.ipcRenderer.on
  const originalEmit = bus.$emit
  const originalOnBus = bus.$on
  const snapshot = JSON.parse(JSON.stringify(state))

  beforeEach(() => {
    electron.ipcRenderer.__sentLog = []
    electron.ipcRenderer.send = (...args) => {
      electron.ipcRenderer.__sent = args
      electron.ipcRenderer.__sentLog.push(args)
    }
    electron.ipcRenderer.on = (channel, handler) => { electron.ipcRenderer.__handler = handler }
    bus.$emit = (...args) => { bus.__emitted = args }
    bus.$on = (event, handler) => { bus.__handler = handler }
    global.marktext = { env: { windowId: 1 } }
    Object.keys(state).forEach(key => { state[key] = snapshot[key] })
  })

  afterEach(() => {
    electron.ipcRenderer.send = originalSend
    electron.ipcRenderer.on = originalOn
    bus.$emit = originalEmit
    bus.$on = originalOnBus
  })

  it('sets user preferences safely', () => {
    mutations.SET_USER_PREFERENCE(state, { autoSave: true, unknown: 'x' })
    expect(state.autoSave).to.equal(true)
    expect(state.unknown).to.equal(undefined)
  })

  it('toggles view entries', () => {
    const before = state.focus
    mutations.TOGGLE_VIEW_MODE(state, 'focus')
    expect(state.focus).to.equal(!before)
  })

  it('dispatches editor view state to main process', () => {
    actions.DISPATCH_EDITOR_VIEW_STATE({}, { showSideBar: true })
    expect(electron.ipcRenderer.__sent[0]).to.equal('mt::view-layout-changed')
    expect(electron.ipcRenderer.__sent[1]).to.equal(1)
    expect(electron.ipcRenderer.__sent[2]).to.deep.equal({ showSideBar: true })
  })

  it('asks for user preference and wires listeners', () => {
    const commits = []
    const commit = (...args) => commits.push(args)
    const handlers = {}
    electron.ipcRenderer.on = (channel, handler) => { handlers[channel] = handler }

    actions.ASK_FOR_USER_PREFERENCE({ commit })

    expect(electron.ipcRenderer.__sentLog[0][0]).to.equal('mt::ask-for-user-preference')
    expect(electron.ipcRenderer.__sentLog[1][0]).to.equal('mt::ask-for-user-data')

    const prefs = { autoSave: true }
    handlers['mt::user-preference']({}, prefs)
    expect(commits.find(c => c[0] === 'SET_USER_PREFERENCE')[1]).to.equal(prefs)
  })

  it('sends preference update commands to main', () => {
    actions.SET_SINGLE_PREFERENCE({}, { type: 'autoSave', value: true })
    expect(electron.ipcRenderer.__sent).to.deep.equal(['mt::set-user-preference', { autoSave: true }])

    actions.SET_USER_DATA({}, { type: 'foo', value: 1 })
    expect(electron.ipcRenderer.__sent).to.deep.equal(['mt::set-user-data', { foo: 1 }])

    actions.SET_IMAGE_FOLDER_PATH({}, '/tmp')
    expect(electron.ipcRenderer.__sent).to.deep.equal(['mt::ask-for-modify-image-folder-path', '/tmp'])

    actions.SELECT_DEFAULT_DIRECTORY_TO_OPEN({})
    expect(electron.ipcRenderer.__sent).to.deep.equal(['mt::select-default-directory-to-open'])
  })

  it('listens for view events and dispatches layout changes', () => {
    const handlers = {}
    electron.ipcRenderer.on = (channel, cb) => { handlers[channel] = cb }

    let emitted
    bus.$emit = (...args) => { emitted = args }
    actions.LISTEN_FOR_VIEW({ commit: () => {}, dispatch: () => {} })
    handlers['mt::show-command-palette']()
    expect(emitted[0]).to.equal('show-command-palette')

    let committed
    const dispatch = (...args) => { emitted = args }
    actions.LISTEN_FOR_VIEW({ commit: (...args) => { committed = args }, dispatch })
    handlers['mt::toggle-view-mode-entry']({}, 'focus')
    expect(committed[0]).to.equal('TOGGLE_VIEW_MODE')
    expect(emitted[0]).to.equal('DISPATCH_EDITOR_VIEW_STATE')
  })

  it('listens for toggle view events via bus', () => {
    let committed
    const dispatch = (type, payload) => actions[type]({ commit: () => {}, dispatch: () => {}, state }, payload)
    actions.LISTEN_TOGGLE_VIEW({ commit: (...args) => { committed = args }, dispatch, state })
    bus.__handler('focus')
    expect(committed[0]).to.equal('TOGGLE_VIEW_MODE')
    expect(committed[1]).to.equal('focus')
    expect(electron.ipcRenderer.__sent[0]).to.equal('mt::view-layout-changed')
  })
})
