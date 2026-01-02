import autoUpdates from '../../../src/renderer/store/autoUpdates'
import notice from '../../../src/renderer/services/notification'

describe('store autoUpdates actions', () => {
  const handlers = {}
  const electron = window.require('electron')
  const originalOn = electron.ipcRenderer.on
  const originalSend = electron.ipcRenderer.send
  const originalNotify = notice.notify
  let lastNotifyOpts

  before(() => {
    electron.ipcRenderer.on = (channel, cb) => { handlers[channel] = cb }
    electron.ipcRenderer.send = () => {}
    notice.notify = opts => {
      lastNotifyOpts = opts
      return Promise.resolve(opts)
    }
    autoUpdates.actions.LISTEN_FOR_UPDATE({ commit: () => {} })
  })

  after(() => {
    electron.ipcRenderer.on = originalOn
    electron.ipcRenderer.send = originalSend
    notice.notify = originalNotify
  })

  it('handles update error notification', async () => {
    await handlers['mt::UPDATE_ERROR']({}, 'err')
    expect(lastNotifyOpts).to.have.property('message', 'err')
  })

  it('handles update available confirm flow', async () => {
    let sentPayload
    electron.ipcRenderer.send = (channel, payload) => { sentPayload = payload }
    notice.notify = opts => {
      lastNotifyOpts = opts
      return Promise.resolve()
    }
    await handlers['mt::UPDATE_AVAILABLE']({}, 'msg')
    expect(sentPayload).to.deep.equal({ needUpdate: true })
    expect(lastNotifyOpts).to.have.property('showConfirm', true)
  })
})
