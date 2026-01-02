import LineEndingCommand from '../../../src/renderer/commands/lineEnding'

const electron = window.require('electron')

describe('command lineEnding', () => {
  const originalEmit = electron.ipcRenderer.emit

  afterEach(() => {
    electron.ipcRenderer.emit = originalEmit
  })

  it('marks current line ending in subcommands', async () => {
    const cmd = new LineEndingCommand({ currentFile: { lineEnding: 'crlf' } })
    await cmd.run()
    expect(cmd.subcommandSelectedIndex).to.equal(0)
    expect(cmd.subcommands[0].description).to.include('current')
  })

  it('sends ipc on executeSubcommand', async () => {
    let sent
    electron.ipcRenderer.emit = (...args) => { sent = args }
    const cmd = new LineEndingCommand({ currentFile: { lineEnding: 'lf' } })
    await cmd.run()
    await cmd.executeSubcommand(null, 'crlf')
    expect(sent[0]).to.equal('mt::set-line-ending')
    expect(sent[2]).to.equal('crlf')
  })
})
