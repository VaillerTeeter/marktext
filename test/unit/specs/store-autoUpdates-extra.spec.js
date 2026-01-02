import autoUpdates from '../../../src/renderer/store/autoUpdates'
import notice from '../../../src/renderer/services/notification'

const electron = window.require('electron')

describe('store autoUpdates extra', () => {
  const { actions } = autoUpdates
  const originalOn = electron.ipcRenderer.on
  const originalSend = electron.ipcRenderer.send
  const originalNotify = notice.notify
  let ipcHandlers
  let sent
  let notified

  beforeEach(() => {
    ipcHandlers = {}
    sent = null
    notified = []
    electron.ipcRenderer.on = (ch, handler) => { ipcHandlers[ch] = handler }
    electron.ipcRenderer.send = (...args) => { sent = args }
    notice.notify = opts => {
      notified.push(opts)
      return Promise.resolve()
    }
  })

  afterEach(() => {
    electron.ipcRenderer.on = originalOn
    electron.ipcRenderer.send = originalSend
    notice.notify = originalNotify
  })

  it('shows notifications for update lifecycle', async () => {
    actions.LISTEN_FOR_UPDATE({})
    ipcHandlers['mt::UPDATE_ERROR']({}, 'err')
    ipcHandlers['mt::UPDATE_NOT_AVAILABLE']({}, 'none')
    ipcHandlers['mt::UPDATE_DOWNLOADED']({}, 'done')
    expect(notified.map(n => n.title)).to.deep.equal(['Update', 'Update not Available', 'Update Downloaded'])
  })

  it('sends NEED_UPDATE depending on confirmation', async () => {
    notice.notify = () => Promise.resolve()
    actions.LISTEN_FOR_UPDATE({})
    await ipcHandlers['mt::UPDATE_AVAILABLE']({}, 'update now')
    await Promise.resolve()
    expect(sent).to.deep.equal(['mt::NEED_UPDATE', { needUpdate: true }])

    notice.notify = () => Promise.reject(new Error('cancel'))
    actions.LISTEN_FOR_UPDATE({})
    sent = null
    await ipcHandlers['mt::UPDATE_AVAILABLE']({}, 'update now')
    await Promise.resolve()
    expect(sent).to.deep.equal(['mt::NEED_UPDATE', { needUpdate: false }])
  })
})
