import notification from '../../../src/renderer/store/notification'
import notice from '../../../src/renderer/services/notification'

const electron = window.require('electron')

describe('store notification actions', () => {
  const handlers = {}
  const originalOn = electron.ipcRenderer.on
  const originalOpen = electron.shell.openExternal
  const originalNotify = notice.notify
  let lastNotifyOpts

  before(() => {
    electron.ipcRenderer.on = (channel, cb) => { handlers[channel] = cb }
    electron.shell.openExternal = () => {}
    notice.notify = opts => {
      lastNotifyOpts = opts
      return Promise.resolve(opts)
    }
    notification.actions.LISTEN_FOR_NOTIFICATION({ commit: () => {} })
  })

  after(() => {
    electron.ipcRenderer.on = originalOn
    electron.shell.openExternal = originalOpen
    notice.notify = originalNotify
  })

  it('shows generic notification', async () => {
    await handlers['mt::show-notification']({}, { message: 'hi' })
    expect(lastNotifyOpts).to.have.property('message', 'hi')
  })

  it('opens pandoc link on missing pandoc', async () => {
    let opened = false
    electron.shell.openExternal = () => { opened = true }
    await handlers['mt::pandoc-not-exists']({}, { message: 'missing pandoc' })
    expect(opened).to.equal(true)
  })
})
