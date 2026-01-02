import notification from '../../../src/renderer/store/notification'
import notice from '../../../src/renderer/services/notification'

const electron = window.require('electron')

describe('store notification extra', () => {
  const { actions } = notification
  const originalOn = electron.ipcRenderer.on
  const originalNotify = notice.notify
  const originalOpenExternal = electron.shell.openExternal
  let ipcHandlers
  let opened
  let notified

  beforeEach(() => {
    ipcHandlers = {}
    opened = null
    notified = []
    electron.ipcRenderer.on = (ch, handler) => { ipcHandlers[ch] = handler }
    electron.shell.openExternal = url => { opened = url }
    notice.notify = opts => {
      notified.push(opts)
      return Promise.resolve()
    }
  })

  afterEach(() => {
    electron.ipcRenderer.on = originalOn
    notice.notify = originalNotify
    electron.shell.openExternal = originalOpenExternal
  })

  it('shows notifications and opens pandoc link', async () => {
    actions.LISTEN_FOR_NOTIFICATION({})
    ipcHandlers['mt::show-notification']({}, { message: 'hello' })
    expect(notified[0].message).to.equal('hello')

    await ipcHandlers['mt::pandoc-not-exists']({}, { message: 'install' })
    expect(opened).to.include('pandoc')
  })
})
