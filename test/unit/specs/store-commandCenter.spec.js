import commandCenter from '../../../src/renderer/store/commandCenter'
import bus from '../../../src/renderer/bus'
import log from 'electron-log/renderer'

describe('store commandCenter', () => {
  const { mutations, actions } = commandCenter
  const electron = window.require('electron')
  const originalOn = electron.ipcRenderer.on
  const originalBusOn = bus.$on
  const originalLogError = log.error

  let ipcHandlers
  let busHandlers
  let lastError

  beforeEach(() => {
    ipcHandlers = {}
    busHandlers = {}
    lastError = null
    electron.ipcRenderer.on = (channel, handler) => { ipcHandlers[channel] = handler }
    bus.$on = (evt, handler) => { busHandlers[evt] = handler }
    log.error = msg => { lastError = msg }
  })

  afterEach(() => {
    electron.ipcRenderer.on = originalOn
    bus.$on = originalBusOn
    log.error = originalLogError
  })

  it('registers and sorts commands', () => {
    const state = { rootCommand: { subcommands: [
      { id: 'b', description: 'beta' },
      { id: 'a', description: 'alpha' }
    ] } }

    mutations.REGISTER_COMMAND(state, { id: 'c', description: 'gamma' })
    expect(state.rootCommand.subcommands.map(c => c.id)).to.deep.equal(['b', 'a', 'c'])

    mutations.SORT_COMMANDS(state)
    expect(state.rootCommand.subcommands.map(c => c.id)).to.deep.equal(['a', 'b', 'c'])
  })

  it('LISTEN_COMMAND_CENTER_BUS wires handlers, executes commands, and handles errors', () => {
    const runFlags = { first: false, second: false }
    const state = { rootCommand: { subcommands: [
      { id: 'cmd-1', description: 'beta', execute: () => { runFlags.first = true } },
      { id: 'cmd-2', description: 'alpha', execute: () => { runFlags.second = true } }
    ] } }
    const commit = (type, payload) => mutations[type](state, payload)

    actions.LISTEN_COMMAND_CENTER_BUS({ commit, state })

    busHandlers['cmd::sort-commands']()
    expect(state.rootCommand.subcommands.map(c => c.id)).to.deep.equal(['cmd-2', 'cmd-1'])

    const newCmd = { id: 'cmd-3', description: 'delta', execute: () => { runFlags.third = true } }
    busHandlers['cmd::register-command'](newCmd)
    expect(state.rootCommand.subcommands.find(c => c.id === 'cmd-3')).to.exist

    ipcHandlers['mt::keybindings-response']({}, { 'cmd-2': 'CmdOrCtrl+Shift+P' })
    expect(state.rootCommand.subcommands.find(c => c.id === 'cmd-2').shortcut)
      .to.deep.equal(['Cmd', 'Shift', 'P'])

    busHandlers['cmd::execute']('cmd-2')
    expect(runFlags.second).to.equal(true)

    expect(() => ipcHandlers['mt::execute-command-by-id']({}, 'missing')).to.throw()
    expect(lastError).to.contain('Cannot execute command "missing"')
  })
})
