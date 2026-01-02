import FileEncodingCommand from '../../../src/renderer/commands/fileEncoding'

const electron = window.require('electron')

describe('command fileEncoding', () => {
  const originalEmit = electron.ipcRenderer.emit

  afterEach(() => {
    electron.ipcRenderer.emit = originalEmit
  })

  it('builds subcommands and highlights current encoding', async () => {
    const editorState = { currentFile: { encoding: { encoding: 'utf8', isBom: false } } }
    const cmd = new FileEncodingCommand(editorState)
    await cmd.run()
    expect(cmd.subcommands[0].description).to.include('current')
  })

  it('executes subcommand by sending ipc', async () => {
    let sent
    electron.ipcRenderer.emit = (...args) => { sent = args }
    const editorState = { currentFile: { encoding: { encoding: 'utf8', isBom: false } } }
    const cmd = new FileEncodingCommand(editorState)
    await cmd.run()
    await cmd.executeSubcommand('utf16le')
    expect(sent[0]).to.equal('mt::set-file-encoding')
    expect(sent[2]).to.equal('utf16le')
  })
})
