import commands from '../../../src/renderer/commands'
import bus from '../../../src/renderer/bus'

const find = id => commands.find(cmd => cmd.id === id)

describe('commands index basic wiring', () => {
  let sent
  let emitted
  let opened
  let originalSend
  let originalEmit
  let originalOpen
  let originalBusEmit

  beforeEach(() => {
    sent = []
    emitted = []
    opened = []
    const electron = window.require('electron')
    originalSend = electron.ipcRenderer.send
    originalEmit = electron.ipcRenderer.emit
    originalOpen = electron.shell.openExternal
    electron.ipcRenderer.send = (...args) => sent.push(args)
    electron.ipcRenderer.emit = (...args) => emitted.push(args)
    electron.shell.openExternal = url => opened.push(url)
    originalBusEmit = bus.$emit
    bus.$emit = (...args) => emitted.push(args)
  })

  afterEach(() => {
    const electron = window.require('electron')
    electron.ipcRenderer.send = originalSend
    electron.ipcRenderer.emit = originalEmit
    electron.shell.openExternal = originalOpen
    bus.$emit = originalBusEmit
  })

  it('sends open-folder via ipc', async () => {
    await find('file.open-folder').execute()
    expect(sent[0][0]).to.equal('mt::cmd-open-folder')
  })

  it('emits export pdf via subcommand', async () => {
    const exportCmd = find('file.export-file')
    const pdfCmd = exportCmd.subcommands.find(c => c.id === 'file.export-file-pdf')
    await pdfCmd.execute()
    const last = emitted[emitted.length - 1]
    expect(last[0]).to.equal('showExportDialog')
    expect(last[1]).to.equal('pdf')
  })

  it('emits print dialog after delay', async () => {
    await find('file.print').execute()
    await new Promise(resolve => setTimeout(resolve, 60))
    const last = emitted[emitted.length - 1]
    expect(last[0]).to.equal('showExportDialog')
    expect(last[1]).to.equal('print')
  })

  it('toggles sidebar via bus event', async () => {
    await find('view.toggle-sidebar').execute()
    const last = emitted[emitted.length - 1]
    expect(last[0]).to.equal('view:toggle-layout-entry')
    expect(last[1]).to.equal('showSideBar')
  })

  it('fires edit.undo via bus after focus', async () => {
    await find('edit.undo').execute()
    await new Promise(r => setTimeout(r, 170))
    const last = emitted[emitted.length - 1]
    expect(last[0]).to.equal('undo')
    expect(last[1]).to.equal('undo')
  })

  it('zooms window via subcommand', async () => {
    const zoom = find('file.zoom')
    await zoom.executeSubcommand(null, 1.25)
    const last = emitted[emitted.length - 1]
    expect(last[0]).to.equal('mt::window-zoom')
    expect(last[2]).to.equal(1.25)
  })

  it('changes theme via ipc subcommand', async () => {
    const themeCmd = find('window.change-theme')
    const dark = themeCmd.subcommands.find(c => c.value === 'dark')
    await themeCmd.executeSubcommand(null, dark.value)
    expect(sent[0][0]).to.equal('mt::set-user-preference')
    expect(sent[0][1]).to.deep.equal({ theme: 'dark' })
  })

  it('opens markdown docs via shell', async () => {
    await find('docs.markdown-syntax').execute()
    expect(opened[0]).to.include('MARKDOWN_SYNTAX.md')
  })

  it('sends text-direction preference via subcommand', async () => {
    const cmd = find('view.text-direction')
    await cmd.executeSubcommand(null, 'rtl')
    const lastSend = sent[sent.length - 1]
    expect(lastSend[0]).to.equal('mt::set-user-preference')
    expect(lastSend[1]).to.deep.equal({ textDirection: 'rtl' })
  })
})
