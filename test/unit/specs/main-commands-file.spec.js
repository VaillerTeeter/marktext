import { COMMANDS } from '../../../src/main/commands'
import { loadFileCommands } from '../../../src/main/commands/file'

describe('main file commands', () => {
  it('sends quick open ipc when command executes', () => {
    const added = {}
    const manager = {
      add: (id, fn) => { added[id] = fn }
    }

    loadFileCommands(manager)
    const handler = added[COMMANDS.FILE_QUICK_OPEN]
    expect(handler).to.be.a('function')

    const sent = []
    const win = { webContents: { send: (...args) => sent.push(args) } }
    handler(win)

    expect(sent[0]).to.deep.equal(['mt::execute-command-by-id', 'file.quick-open'])

    // Ensure guard against missing webContents
    handler({})
    expect(sent.length).to.equal(1)
  })
})
