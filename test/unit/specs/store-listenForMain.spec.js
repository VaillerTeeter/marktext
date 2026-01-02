import listenForMain from '../../../src/renderer/store/listenForMain'
import bus from '../../../src/renderer/bus'

describe('store listenForMain', () => {
  const { actions } = listenForMain
  const electron = window.require('electron')
  const originalOn = electron.ipcRenderer.on
  const originalBusEmit = bus.$emit
  let ipcHandlers
  let emitted

  beforeEach(() => {
    ipcHandlers = {}
    emitted = []
    electron.ipcRenderer.on = (ch, handler) => { ipcHandlers[ch] = handler }
    bus.$emit = (...args) => emitted.push(args)
  })

  afterEach(() => {
    electron.ipcRenderer.on = originalOn
    bus.$emit = originalBusEmit
  })

  it('handles edit events and triggers layout change', () => {
    const commits = []
    actions.LISTEN_FOR_EDIT({ commit: (...args) => commits.push(args) })

    ipcHandlers['mt::editor-edit-action']({}, 'findInFolder')
    expect(commits[0][0]).to.equal('SET_LAYOUT')
    expect(commits[0][1]).to.deep.equal({ rightColumn: 'search', showSideBar: true })
    expect(emitted[0]).to.deep.equal(['findInFolder', 'findInFolder'])

    ipcHandlers['mt::editor-edit-action']({}, 'focus')
    expect(emitted[1]).to.deep.equal(['focus', 'focus'])
  })

  it('shows dialogs from main process', () => {
    actions.LISTEN_FOR_SHOW_DIALOG({ commit: () => {} })

    ipcHandlers['mt::about-dialog']()
    expect(emitted[0]).to.deep.equal(['aboutDialog'])

    ipcHandlers['mt::show-export-dialog']({}, 'pdf')
    expect(emitted[1]).to.deep.equal(['showExportDialog', 'pdf'])
  })

  it('relays paragraph and format actions', () => {
    actions.LISTEN_FOR_PARAGRAPH_INLINE_STYLE({ commit: () => {} })

    ipcHandlers['mt::editor-paragraph-action']({}, { type: 'heading' })
    ipcHandlers['mt::editor-format-action']({}, { type: 'bold' })

    expect(emitted[0]).to.deep.equal(['paragraph', 'heading'])
    expect(emitted[1]).to.deep.equal(['format', 'bold'])
  })
})
