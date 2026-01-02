import TrailingNewlineCommand from '../../../src/renderer/commands/trailingNewline'

const electron = window.require('electron')

describe('command trailing newline', () => {
  const originalEmit = electron.ipcRenderer.emit

  afterEach(() => {
    electron.ipcRenderer.emit = originalEmit
  })

  it('sets current option based on trimTrailingNewline', async () => {
    const cmd = new TrailingNewlineCommand({ currentFile: { trimTrailingNewline: 1 } })
    await cmd.run()
    expect(cmd.subcommandSelectedIndex).to.equal(1)
    expect(cmd.subcommands[1].description).to.include('current')
  })

  it('emits ipc when applying selection', async () => {
    let sent
    electron.ipcRenderer.emit = (...args) => { sent = args }
    const cmd = new TrailingNewlineCommand({ currentFile: { trimTrailingNewline: 3 } })
    await cmd.run()
    await cmd.executeSubcommand(null, 0)
    expect(sent[0]).to.equal('mt::set-final-newline')
    expect(sent[2]).to.equal(0)
  })
})
