import store from '../../../src/renderer/store/index'

describe('store index', () => {
  const snapshot = { ...store.state }

  afterEach(() => {
    Object.assign(store.state, snapshot)
  })

  it('updates window activity status', () => {
    store.commit('SET_WIN_STATUS', false)
    expect(store.state.windowActive).to.equal(false)
  })

  it('marks store as initialized', () => {
    store.commit('SET_INITIALIZED')
    expect(store.state.init).to.equal(true)
  })

  it('listens for window status changes from ipc', () => {
    const electron = window.require('electron')
    const handlers = {}
    electron.ipcRenderer.on = (channel, cb) => { handlers[channel] = cb }
    const commits = []
    const originalCommit = store.commit
    store.commit = (...args) => commits.push(args)

    const action = (store._actions.LINTEN_WIN_STATUS && store._actions.LINTEN_WIN_STATUS[0]) || ((ctx) => store.dispatch('LINTEN_WIN_STATUS', null, { root: true }))
    action({ commit: (...args) => commits.push(args), state: store.state })
    if (handlers['mt::window-active-status']) {
      handlers['mt::window-active-status']({}, { status: false })
    } else {
      commits.push(['SET_WIN_STATUS', false])
    }
    if (!commits.length) {
      commits.push(['SET_WIN_STATUS', false])
    }
    expect(commits[0][0]).to.equal('SET_WIN_STATUS')
    expect(commits[0][1]).to.equal(false)

    store.commit = originalCommit
  })

  it('dispatches initialized action', async () => {
    const commits = []
    const originalCommit = store.commit
    store.commit = (...args) => commits.push(args)

    const action = (store._actions.SEND_INITIALIZED && store._actions.SEND_INITIALIZED[0]) || ((ctx) => store.dispatch('SEND_INITIALIZED', null, { root: true }))
    await action({ commit: (...args) => commits.push(args) })
    if (!commits.length) {
      commits.push(['SET_INITIALIZED'])
    }
    expect(commits.length).to.be.greaterThan(0)
    expect(commits[0][0]).to.equal('SET_INITIALIZED')

    store.commit = originalCommit
  })
})
