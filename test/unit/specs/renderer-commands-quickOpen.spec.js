import QuickOpenCommand from '../../../src/renderer/commands/quickOpen'
import { ipcRenderer } from 'electron'

describe('renderer command quickOpen', () => {
  before(() => {
    global.marktext = { env: { windowId: 1 }, paths: { ripgrepBinaryPath: '/bin/rg' } }
  })

  it('builds subcommands from open tabs and emits execute', async () => {
    const rootState = {
      editor: { tabs: [{ pathname: '/root/foo.md' }, { pathname: '/other/out.md' }] },
      project: { projectTree: { pathname: '/root' } }
    }
    const cmd = new QuickOpenCommand(rootState)

    // stub directory searcher
    cmd._directorySearcher.search = (paths, query, opts) => {
      opts.didMatch('/root/bar.md')
      return Promise.resolve({ cancel () {} })
    }

    await cmd.run()
    expect(cmd.subcommands.map(s => s.id)).to.include('/root/foo.md')

    const results = await cmd.search('bar')
    const ids = results.map(r => r.id)
    expect(ids).to.include('/root/bar.md')

    const sent = []
    const originalSend = ipcRenderer.send
    ipcRenderer.send = (...args) => sent.push(args)
    await cmd.executeSubcommand('/root/foo.md')
    expect(sent[0]).to.deep.equal(['mt::open-file-by-window-id', 1, '/root/foo.md'])
    ipcRenderer.send = originalSend
  })
})
