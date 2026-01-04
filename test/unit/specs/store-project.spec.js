import project from '../../../src/renderer/store/project'
import bus from '../../../src/renderer/bus'
import notice from '../../../src/renderer/services/notification'

const { actions } = project

describe('store project actions', () => {
  const handlers = {}
  const busHandlers = {}
  const electron = window.require('electron')
  const originalOn = electron.ipcRenderer.on
  const originalInvoke = electron.ipcRenderer.invoke
  const originalSend = electron.ipcRenderer.send
  const originalNotify = notice.notify
  const originalBusOn = bus.$on
  const originalBusEmit = bus.$emit
  let lastNotice

  beforeEach(() => {
    lastNotice = null
    electron.ipcRenderer.on = (channel, cb) => { handlers[channel] = cb }
    electron.ipcRenderer.invoke = () => Promise.resolve()
    electron.ipcRenderer.send = () => {}
    notice.notify = opts => {
      lastNotice = opts
      return Promise.resolve()
    }
    bus.$on = (evt, cb) => { busHandlers[evt] = cb }
    bus.$emit = () => {}
  })

  afterEach(() => {
    electron.ipcRenderer.on = originalOn
    electron.ipcRenderer.invoke = originalInvoke
    electron.ipcRenderer.send = originalSend
    notice.notify = originalNotify
    bus.$on = originalBusOn
    bus.$emit = originalBusEmit
  })

  it('opens new markdown file and updates current file', async () => {
    const state = { newFileNameCache: '/tmp/new.md' }
    const dispatchCalls = []
    const commit = (type, payload) => {
      if (type === 'SET_NEWFILENAME') state.newFileNameCache = payload
    }
    const dispatch = (type, payload) => dispatchCalls.push({ type, payload })

    actions.LISTEN_FOR_UPDATE_PROJECT({ commit, state, dispatch })
    await handlers['mt::update-object-tree']({}, {
      type: 'add',
      change: {
        pathname: '/tmp/new.md',
        data: {
          markdown: 'hi',
          filename: 'new.md',
          pathname: '/tmp/new.md',
          encoding: { encoding: 'utf8', isBom: false },
          lineEnding: 'lf',
          adjustLineEndingOnSave: false,
          trimTrailingNewline: 3
        },
        isMarkdown: true
      }
    })

    expect(dispatchCalls[0].type).to.equal('UPDATE_CURRENT_FILE')
    expect(state.newFileNameCache).to.equal('')
  })

  it('warns when pasting to same location', async () => {
    const state = {
      activeItem: { pathname: '/tmp/test.md', isDirectory: false },
      clipboard: { src: '/tmp/test.md', type: 'copy' }
    }
    const commit = (type, payload) => {
      if (type === 'SET_CLIPBOARD') state.clipboard = payload
    }

    actions.LISTEN_FOR_SIDEBAR_CONTEXT_MENU({ commit, state })
    busHandlers['SIDEBAR::paste']()

    expect(lastNotice).to.exist
    expect(lastNotice.type).to.equal('warning')
    expect(lastNotice.message).to.include('Source and destination')
    expect(state.clipboard.src).to.equal('/tmp/test.md')
  })

  it('creates by sidebar new and emits input', () => {
    const commits = []
    const state = { activeItem: { pathname: '/dir', isDirectory: true } }
    const commit = (type, payload) => commits.push({ type, payload })

    actions.LISTEN_FOR_SIDEBAR_CONTEXT_MENU({ commit, state })
    let emitted = false
    bus.$emit = (evt) => { if (evt === 'SIDEBAR::show-new-input') emitted = true }
    busHandlers['SIDEBAR::new']('file')

    const createCommit = commits.find(c => c.type === 'CREATE_PATH')
    expect(createCommit.payload.dirname).to.equal('/dir')
    expect(createCommit.payload.type).to.equal('file')
    expect(emitted).to.equal(true)
  })

  it('notifies on remove error', async () => {
    let last
    notice.notify = o => { last = o; return Promise.resolve() }
    const state = { activeItem: { pathname: '/nope', isDirectory: false } }
    const commit = () => {}
    const electron = window.require('electron')
    electron.ipcRenderer.invoke = () => Promise.reject(new Error('boom'))

    actions.LISTEN_FOR_SIDEBAR_CONTEXT_MENU({ commit, state })
    await busHandlers['SIDEBAR::remove']()

    expect(last).to.exist
    expect(last.type).to.equal('error')
    expect(last.message).to.include('boom')
  })

  it('rename caches pathname and emits rename input', () => {
    const commits = []
    const state = { activeItem: { pathname: '/old.md', isDirectory: false } }
    const commit = (type, payload) => commits.push({ type, payload })

    actions.LISTEN_FOR_SIDEBAR_CONTEXT_MENU({ commit, state })
    let emitted = false
    bus.$emit = evt => { if (evt === 'SIDEBAR::show-rename-input') emitted = true }
    busHandlers['SIDEBAR::rename']()

    const cacheCommit = commits.find(c => c.type === 'SET_RENAME_CACHE')
    expect(cacheCommit.payload).to.equal('/old.md')
    expect(emitted).to.equal(true)
  })

  it('loads root directory and toggles layout when opening project', () => {
    const commits = []
    const dispatches = []
    const commit = (type, payload) => commits.push({ type, payload })
    const dispatch = (type, payload) => dispatches.push({ type, payload })
    actions.LISTEN_FOR_LOAD_PROJECT({ commit, dispatch })
    handlers['mt::open-directory']({}, '/workspace')

    const setRoot = commits.find(c => c.type === 'SET_ROOT_DIRECTORY')
    expect(setRoot.payload).to.equal('/workspace')
    const layout = commits.find(c => c.type === 'SET_LAYOUT')
    expect(layout.payload.showSideBar).to.equal(true)
    expect(dispatches[0].type).to.equal('DISPATCH_LAYOUT_MENU_ITEMS')
  })

  it('handles all update-project change types', () => {
    const commits = []
    const dispatches = []
    const state = { newFileNameCache: '' }
    const commit = (type, payload) => commits.push({ type, payload })
    const dispatch = (type, payload) => dispatches.push({ type, payload })

    actions.LISTEN_FOR_UPDATE_PROJECT({ commit, state, dispatch })

    // add
    handlers['mt::update-object-tree']({}, { type: 'add', change: { pathname: '/x.md', data: {}, isMarkdown: false } })
    // unlink
    handlers['mt::update-object-tree']({}, { type: 'unlink', change: { pathname: '/x.md' } })
    // addDir
    handlers['mt::update-object-tree']({}, { type: 'addDir', change: { pathname: '/dir' } })
    // unlinkDir
    handlers['mt::update-object-tree']({}, { type: 'unlinkDir', change: { pathname: '/dir' } })
    // change branch (no-op)
    handlers['mt::update-object-tree']({}, { type: 'change', change: {} })
    // default case
    handlers['mt::update-object-tree']({}, { type: 'unknown', change: {} })

    expect(commits.some(c => c.type === 'ADD_FILE')).to.equal(true)
    expect(commits.some(c => c.type === 'UNLINK_FILE')).to.equal(true)
    expect(commits.some(c => c.type === 'ADD_DIRECTORY')).to.equal(true)
    expect(commits.some(c => c.type === 'UNLINK_DIRECTORY')).to.equal(true)
    expect(commits.some(c => c.type === 'SET_SAVE_STATUS_WHEN_REMOVE')).to.equal(true)
  })

  it('creates file/directory with proper extension and caches filename', async () => {
    const fs = require('fs-extra')
    const path = require('path')
    const os = require('os')
    // Use platform-agnostic temp directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'marktext-'))
    const commits = []
    const state = { createCache: { dirname: tmpDir, type: 'file' }, newFileNameCache: '' }
    const commit = (type, payload) => {
      commits.push({ type, payload })
      if (type === 'CREATE_PATH') state.createCache = payload
      if (type === 'SET_NEWFILENAME') state.newFileNameCache = payload
    }

    await actions.CREATE_FILE_DIRECTORY({ commit, state }, 'note')
    await new Promise(resolve => setTimeout(resolve, 0))
    const createdPath = path.join(tmpDir, 'note.md')
    expect(fs.pathExistsSync(createdPath)).to.equal(true)
    // Normalize paths for comparison - actions uses / separator, path.join uses platform separator
    const normalizedCached = state.newFileNameCache.replace(/\\/g, '/')
    const normalizedExpected = createdPath.replace(/\\/g, '/')
    expect(normalizedCached).to.equal(normalizedExpected)
    expect(state.createCache.dirname).to.equal(undefined)
    fs.removeSync(tmpDir)
  })

  it('renames items via util and updates tabs', async () => {
    const fs = require('fs-extra')
    const path = require('path')
    const os = require('os')
    // Use platform-agnostic temp directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'marktext-'))
    const src = path.join(tmpDir, 'old.md')
    fs.writeFileSync(src, 'hello')
    let renamed
    const commits = []
    const state = { renameCache: src }
    const commit = (type, payload) => commits.push({ type, payload })

    await actions.RENAME_IN_SIDEBAR({ commit, state }, 'new.md')
    await new Promise(resolve => setTimeout(resolve, 0))
    const dest = path.join(tmpDir, 'new.md')
    if (fs.pathExistsSync(dest)) {
      renamed = { src, dest }
    }
    expect(renamed.dest).to.equal(dest)
    expect(commits.some(c => c.type === 'RENAME_IF_NEEDED')).to.equal(true)
    fs.removeSync(tmpDir)
  })

  it('asks main process to open project', () => {
    const sent = []
    const electron = window.require('electron')
    electron.ipcRenderer.send = (...args) => sent.push(args)
    actions.ASK_FOR_OPEN_PROJECT({})
    expect(sent[0][0]).to.equal('mt::ask-for-open-project-in-sidebar')
  })
})
