import tweet from '../../../src/renderer/store/tweet'
import bus from '../../../src/renderer/bus'

describe('store tweet', () => {
  const { actions } = tweet
  const electron = window.require('electron')
  const originalOn = electron.ipcRenderer.on
  const originalBusEmit = bus.$emit
  let ipcHandlers
  let emitted

  beforeEach(() => {
    ipcHandlers = {}
    emitted = []
    electron.ipcRenderer.on = (ch, handler) => { ipcHandlers[ch] = handler }
    bus.$emit = (...args) => emitted.push(args)
  })

  afterEach(() => {
    electron.ipcRenderer.on = originalOn
    bus.$emit = originalBusEmit
  })

  it('emits tweet dialog for twitter messages', () => {
    actions.LISTEN_FOR_TWEET()

    ipcHandlers['mt::tweet']({}, 'twitter')
    expect(emitted[0]).to.deep.equal(['tweetDialog'])

    emitted.length = 0
    ipcHandlers['mt::tweet']({}, 'other')
    expect(emitted).to.have.length(0)
  })
})
