import { expect } from 'chai'
import path from 'path'
import editor from '../../../src/renderer/store/editor'
import bus from '../../../src/renderer/bus'
import { defaultFileState } from '../../../src/renderer/store/help'

const { actions } = editor
const electron = window.require('electron')
const originalSend = electron.ipcRenderer.send
const originalOn = electron.ipcRenderer.on
const originalOnce = electron.ipcRenderer.once
const originalSetTimeout = global.setTimeout
const originalClearTimeout = global.clearTimeout
const originalBusEmit = bus.$emit

const createSpy = () => {
  const fn = (...args) => {
    fn.called = true
    fn.callCount += 1
    fn.args = args
    fn.calls.push(args)
  }
  fn.called = false
  fn.callCount = 0
  fn.calls = []
  return fn
}

describe('store editor actions', () => {
  afterEach(() => {
    electron.ipcRenderer.send = originalSend
    electron.ipcRenderer.on = originalOn
    electron.ipcRenderer.once = originalOnce
    global.setTimeout = originalSetTimeout
    global.clearTimeout = originalClearTimeout
    bus.$emit = originalBusEmit
  })

  const cloneDefaultFile = () => JSON.parse(JSON.stringify(defaultFileState))

  it('SET_SEARCH updates search state', () => {
    const localState = { currentFile: { searchMatches: null } }

    editor.mutations.SET_SEARCH(localState, { matches: [1, 2], index: 1 })

    expect(localState.currentFile.searchMatches).to.deep.equal({ matches: [1, 2], index: 1 })
  })

  it('SET_TOC stores list and tree toc', () => {
    const localState = { listToc: [], toc: [] }
    const toc = [{ lvl: 1, content: 'title', children: [] }]

    editor.mutations.SET_TOC(localState, toc)

    expect(localState.listToc).to.equal(toc)
    expect(localState.toc.length).to.equal(1)
  })

  it('SET_CURRENT_FILE updates current file and emits change', () => {
    const emitSpy = createSpy()
    bus.$emit = emitSpy
    const localState = { currentFile: {} }
    const currentFile = { id: 'id-1', markdown: 'md', cursor: {}, history: {}, pathname: '/docs/a.md' }

    editor.mutations.SET_CURRENT_FILE(localState, currentFile)

    expect(localState.currentFile).to.deep.equal(currentFile)
    expect(window.DIRNAME).to.equal('/docs')
    expect(emitSpy.called).to.equal(true)
    expect(emitSpy.calls[0][0]).to.equal('file-changed')
  })

  it('REMOVE_FILE_WITHIN_TABS clears autoSave timer and selects neighbor', () => {
    const clearSpy = createSpy()
    global.clearTimeout = clearSpy
    const emitSpy = createSpy()
    bus.$emit = emitSpy

    const base = cloneDefaultFile()
    const file = Object.assign(cloneDefaultFile(), { id: 't1', pathname: '/a.md', markdown: 'old', history: { stack: [], index: -1 } })
    const neighbor = Object.assign(cloneDefaultFile(), { id: 't2', pathname: '/b.md', markdown: 'b', history: { stack: [], index: -1 } })
    const state = { tabs: [file, neighbor], currentFile: file, listToc: [], toc: [] }
    const rootState = { preferences: { autoSaveDelay: 10 }, project: {} }

    // set a pending auto-save timer
    global.setTimeout = () => 42
    actions.HANDLE_AUTO_SAVE({ commit: () => {}, state, rootState }, {
      id: 't1', filename: 'a.md', pathname: '/a.md', markdown: 'text', options: {
        encoding: file.encoding,
        lineEnding: file.lineEnding,
        adjustLineEndingOnSave: file.adjustLineEndingOnSave,
        trimTrailingNewline: file.trimTrailingNewline
      }
    })

    editor.mutations.REMOVE_FILE_WITHIN_TABS(state, file)

    expect(clearSpy.called).to.equal(true)
    expect(state.tabs.length).to.equal(1)
    expect(state.currentFile.id).to.equal('t2')
    expect(emitSpy.called).to.equal(true)
  })

  it('HANDLE_AUTO_SAVE schedules one save and clears previous timer', () => {
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy

    // simple timer harness
    const scheduled = []
    global.setTimeout = (fn, delay) => {
      const id = scheduled.length
      scheduled.push({ fn, delay })
      return id
    }
    global.clearTimeout = id => { if (scheduled[id]) scheduled[id] = null }

    const state = {
      tabs: [{ id: '1', isSaved: false }]
    }
    const rootState = { preferences: { autoSaveDelay: 50 }, project: {} }

    actions.HANDLE_AUTO_SAVE({ commit: () => {}, state, rootState }, {
      id: '1', filename: 'a.md', pathname: '/a.md', markdown: 'text', options: {}
    })
    // second call should clear the first timer and reschedule once
    actions.HANDLE_AUTO_SAVE({ commit: () => {}, state, rootState }, {
      id: '1', filename: 'a.md', pathname: '/a.md', markdown: 'text2', options: {}
    })

    // execute pending timers
    scheduled.forEach(job => job && job.fn())
    expect(sendSpy.callCount).to.equal(1)
    expect(sendSpy.calls[0][0]).to.equal('mt::response-file-save')
  })

  it('ASK_FOR_IMAGE_AUTO_PATH resolves files when pathname exists', async () => {
    const onceCalls = createSpy()
    electron.ipcRenderer.once = (channel, cb) => {
      onceCalls(channel, cb)
      cb(null, ['img1'])
    }
    electron.ipcRenderer.send = () => {}

    const state = { currentFile: { pathname: '/path/doc.md' } }
    const files = await actions.ASK_FOR_IMAGE_AUTO_PATH({ commit: () => {}, state }, '/img.png')

    expect(files).to.deep.equal(['img1'])
    expect(onceCalls.callCount).to.equal(1)
  })

  it('ASK_FOR_IMAGE_AUTO_PATH returns empty list when no pathname', () => {
    const state = { currentFile: { pathname: '' } }
    const files = actions.ASK_FOR_IMAGE_AUTO_PATH({ commit: () => {}, state }, '/img.png')
    expect(files).to.deep.equal([])
  })

  it('LISTEN_FOR_FILE_CHANGE reloads saved tab when autoSave enabled', () => {
    let handler
    electron.ipcRenderer.on = (channel, cb) => { handler = cb }

    const commitSpy = createSpy()
    const state = {
      tabs: [{ id: 't1', pathname: '/a.md', isSaved: true, filename: 'a.md' }]
    }
    const rootState = { preferences: { autoSave: true } }

    actions.LISTEN_FOR_FILE_CHANGE({ commit: commitSpy, state, rootState })

    const change = { pathname: '/a.md', data: { markdown: 'x' } }
    handler({}, { type: 'change', change })

    expect(commitSpy.callCount).to.equal(1)
    expect(commitSpy.calls[0][0]).to.equal('LOAD_CHANGE')
  })

  it('LISTEN_FOR_SAVE responds with file info and default path', () => {
    let handler
    electron.ipcRenderer.on = (channel, cb) => { handler = cb }
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy

    const file = Object.assign(cloneDefaultFile(), { id: 'f1', filename: 'f.md', pathname: '/f.md', markdown: 'text' })
    const state = { currentFile: file }
    const rootState = { project: { projectTree: { pathname: '/root' } } }

    actions.LISTEN_FOR_SAVE({ state, rootState })
    handler()

    expect(sendSpy.callCount).to.equal(1)
    expect(sendSpy.calls[0][0]).to.equal('mt::response-file-save')
    expect(sendSpy.calls[0][1].defaultPath).to.equal('/root')
  })

  it('LISTEN_FOR_SAVE_AS responds with file info', () => {
    let handler
    electron.ipcRenderer.on = (channel, cb) => { handler = cb }
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy

    const file = Object.assign(cloneDefaultFile(), { id: 'f1', filename: 'f.md', pathname: '/f.md', markdown: 'text' })
    const state = { currentFile: file }
    const rootState = { project: { projectTree: { pathname: '/root' } } }

    actions.LISTEN_FOR_SAVE_AS({ state, rootState })
    handler()

    expect(sendSpy.calls[0][0]).to.equal('mt::response-file-save-as')
    expect(sendSpy.calls[0][1].defaultPath).to.equal('/root')
  })

  it('LISTEN_FOR_CLOSE sends confirmation for unsaved files and closes otherwise', () => {
    let handler
    electron.ipcRenderer.on = (channel, cb) => { handler = cb }
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy

    const saved = Object.assign(cloneDefaultFile(), { id: 's', filename: 's.md', pathname: '/s.md', markdown: 'saved', isSaved: true })
    const unsaved = Object.assign(cloneDefaultFile(), { id: 'u', filename: 'u.md', pathname: '/u.md', markdown: 'dirty', isSaved: false })
    const state = { tabs: [saved, unsaved] }

    actions.LISTEN_FOR_CLOSE({ state })
    handler()

    expect(sendSpy.calls[0][0]).to.equal('mt::close-window-confirm')
    expect(sendSpy.calls[0][1][0].id).to.equal('u')

    // invoke again with all saved
    sendSpy.called = false
    state.tabs = [Object.assign({}, saved, { isSaved: true }), Object.assign({}, unsaved, { isSaved: true })]
    handler()
    expect(sendSpy.calls[1][0]).to.equal('mt::close-window')
  })

  it('LISTEN_FOR_MOVE_TO saves when new and moves when existing', () => {
    let handler
    electron.ipcRenderer.on = (channel, cb) => { handler = cb }
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy
    const file = Object.assign(cloneDefaultFile(), { id: 'f1', filename: 'f.md', pathname: '', markdown: 'text' })
    const state = { currentFile: file }
    const rootState = { project: { projectTree: { pathname: '/proj' } } }

    actions.LISTEN_FOR_MOVE_TO({ state, rootState })
    handler()

    expect(sendSpy.calls[0][0]).to.equal('mt::response-file-save')
    expect(sendSpy.calls[0][1].defaultPath).to.equal('/proj')

    // switch to existing file branch
    state.currentFile.pathname = '/f.md'
    handler()
    expect(sendSpy.calls[1][0]).to.equal('mt::response-file-move-to')
    expect(sendSpy.calls[1][1]).to.deep.equal({ id: 'f1', pathname: '/f.md' })
  })

  it('RESPONSE_FOR_RENAME saves new file and emits bus on existing', () => {
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy
    const emitSpy = createSpy()
    bus.$emit = emitSpy
    const file = Object.assign(cloneDefaultFile(), { id: 'f1', filename: 'f.md', pathname: '', markdown: 'text' })
    const state = { currentFile: file }
    const rootState = { project: { projectTree: { pathname: '/proj' } } }

    actions.RESPONSE_FOR_RENAME({ state, rootState })
    expect(sendSpy.calls[0][0]).to.equal('mt::response-file-save')

    state.currentFile.pathname = '/f.md'
    actions.RESPONSE_FOR_RENAME({ state, rootState })
    expect(emitSpy.called).to.equal(true)
    expect(emitSpy.calls[0][0]).to.equal('rename')
  })

  it('RENAME sends rename request when filename changes', () => {
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy
    const file = Object.assign(cloneDefaultFile(), { id: 'f1', filename: 'old.md', pathname: '/tmp/old.md' })
    const state = { currentFile: file }

    actions.RENAME({ commit: () => {}, state }, 'new.md')

    expect(sendSpy.callCount).to.equal(1)
    expect(sendSpy.calls[0][0]).to.equal('mt::rename')
    expect(sendSpy.calls[0][1]).to.deep.equal({ id: 'f1', pathname: '/tmp/old.md', newPathname: path.join('/tmp', 'new.md') })
  })

  it('UPDATE_LINE_ENDING_MENU sends ipc with window id', () => {
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy
    global.marktext = { env: { windowId: 7 } }
    const state = { currentFile: { lineEnding: 'lf' } }

    actions.UPDATE_LINE_ENDING_MENU({ state })

    expect(sendSpy.calls[0]).to.deep.equal(['mt::update-line-ending-menu', 7, 'lf'])
  })

  it('CLOSE_TAB dispatches correct branch', () => {
    const dispatch = createSpy()
    actions.CLOSE_TAB({ dispatch }, { isSaved: true })
    actions.CLOSE_TAB({ dispatch }, { isSaved: false })

    expect(dispatch.calls[0][0]).to.equal('FORCE_CLOSE_TAB')
    expect(dispatch.calls[1][0]).to.equal('CLOSE_UNSAVED_TAB')
  })

  it('CLOSE_OTHER_TABS closes all except current', () => {
    const dispatch = createSpy()
    const tabs = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    actions.CLOSE_OTHER_TABS({ state: { tabs }, dispatch }, { id: 'b' })

    const closed = dispatch.calls.map(c => c[1].id)
    expect(closed).to.deep.equal(['a', 'c'])
  })

  it('CLOSE_SAVED_TABS closes only saved files', () => {
    const dispatch = createSpy()
    const tabs = [{ id: 'a', isSaved: true }, { id: 'b', isSaved: false }]

    actions.CLOSE_SAVED_TABS({ state: { tabs }, dispatch })

    expect(dispatch.callCount).to.equal(1)
    expect(dispatch.calls[0][1].id).to.equal('a')
  })

  it('CLOSE_ALL_TABS closes every tab', () => {
    const dispatch = createSpy()
    const tabs = [{ id: 'a' }, { id: 'b' }]

    actions.CLOSE_ALL_TABS({ state: { tabs }, dispatch })

    expect(dispatch.callCount).to.equal(2)
    expect(dispatch.calls.map(c => c[1].id)).to.deep.equal(['a', 'b'])
  })

  it('LISTEN_FOR_SET_PATHNAME closes duplicate tab and updates pathname', () => {
    const handlers = {}
    electron.ipcRenderer.on = (channel, cb) => { handlers[channel] = cb }
    const commit = createSpy()
    const dispatch = createSpy()
    const a = Object.assign(cloneDefaultFile(), { id: 'a', pathname: '/a.md' })
    const dup = Object.assign(cloneDefaultFile(), { id: 'dup', pathname: '/dup.md' })
    const state = { tabs: [a, dup] }

    actions.LISTEN_FOR_SET_PATHNAME({ commit, dispatch, state })
    handlers['mt::set-pathname']({}, { id: 'a', filename: 'dup.md', pathname: '/dup.md' })

    expect(dispatch.callCount).to.equal(1)
    expect(dispatch.calls[0][0]).to.equal('CLOSE_TAB')
    expect(commit.calls[0][0]).to.equal('SET_PATHNAME')
    expect(commit.calls[0][1].fileInfo.pathname).to.equal('/dup.md')
  })

  it('RENAME_IF_NEEDED updates pathnames matching src', () => {
    const tabs = [Object.assign(cloneDefaultFile(), { pathname: '/old.md', filename: 'old.md' })]
    const state = { tabs }

    editor.mutations.RENAME_IF_NEEDED(state, { src: '/old.md', dest: '/new.md' })

    expect(tabs[0].pathname).to.equal('/new.md')
    expect(tabs[0].filename).to.equal('new.md')
  })

  it('SHOW_TAB_VIEW toggles tab bar when needed', () => {
    const commit = createSpy()
    const dispatch = createSpy()
    const state = { tabs: [{}] }

    actions.SHOW_TAB_VIEW({ commit, dispatch, state }, false)

    expect(commit.calls[0][0]).to.equal('SET_LAYOUT')
    expect(dispatch.calls[0][0]).to.equal('DISPATCH_LAYOUT_MENU_ITEMS')
  })

  it('CLOSE_UNSAVED_TAB asks main process to save and close', () => {
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy
    const file = { id: 't1', pathname: '/x.md', filename: 'x.md', markdown: 'md', encoding: { encoding: 'utf8', isBom: false }, lineEnding: 'lf', adjustLineEndingOnSave: false, trimTrailingNewline: 3 }

    actions.CLOSE_UNSAVED_TAB({ commit: () => {}, state: {} }, file)

    expect(sendSpy.callCount).to.equal(1)
    expect(sendSpy.calls[0][0]).to.equal('mt::save-and-close-tabs')
    expect(sendSpy.calls[0][1][0].id).to.equal('t1')
  })

  it('ASK_FOR_SAVE_ALL closes saved tabs and sends save-and-close when requested', () => {
    const commits = []
    const sendSpy = createSpy()
    electron.ipcRenderer.send = sendSpy
    const state = {
      tabs: [
        { id: 's1', isSaved: true, markdown: 'ok', pathname: '/ok.md', filename: 'ok.md', encoding: { encoding: 'utf8', isBom: false }, lineEnding: 'lf', adjustLineEndingOnSave: false, trimTrailingNewline: 3 },
        { id: 'u1', isSaved: false, markdown: 'dirty', pathname: '/dirty.md', filename: 'dirty.md', encoding: { encoding: 'utf8', isBom: false }, lineEnding: 'lf', adjustLineEndingOnSave: false, trimTrailingNewline: 3 }
      ],
      currentFile: { id: 'u1' }
    }

    actions.ASK_FOR_SAVE_ALL({ commit: (type, payload) => commits.push([type, payload]), state }, true)

    expect(commits[0][0]).to.equal('CLOSE_TABS')
    expect(sendSpy.callCount).to.equal(1)
    expect(sendSpy.calls[0][0]).to.equal('mt::save-and-close-tabs')
    expect(sendSpy.calls[0][1][0].id).to.equal('u1')
  })

  it('LISTEN_FOR_SAVE_CLOSE commits CLOSE_TABS when event received', () => {
    let handler
    electron.ipcRenderer.on = (channel, cb) => { handler = cb }
    const commitSpy = createSpy()

    actions.LISTEN_FOR_SAVE_CLOSE({ commit: commitSpy })
    handler({}, ['a', 'b'])

    expect(commitSpy.callCount).to.equal(1)
    expect(commitSpy.calls[0]).to.deep.equal(['CLOSE_TABS', ['a', 'b']])
  })
})
