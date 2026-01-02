import { expect } from 'chai'
import { ipcRenderer } from 'electron'
import bus from '../../../src/renderer/bus'
import { tabsMixins, loadingPageMixins, fileMixins, createFileOrDirectoryMixins } from '../../../src/renderer/mixins'

const createStore = () => {
  const actions = []
  return {
    actions,
    dispatch: (...args) => actions.push(args)
  }
}

const resetIpc = () => {
  ipcRenderer.__sent = null
}

describe('renderer mixins index', () => {
  let originalEmit
  let originalSend

  before(() => {
    originalEmit = bus.$emit
    originalSend = ipcRenderer.send
  })

  beforeEach(() => {
    resetIpc()
    bus.$emit = (...args) => { bus.__emitted = args }
    ipcRenderer.send = (...args) => { ipcRenderer.__sent = args }
  })

  afterEach(() => {
    bus.__emitted = null
  })

  after(() => {
    bus.$emit = originalEmit
    ipcRenderer.send = originalSend
  })

  it('selects and removes tabs with correct actions', () => {
    const store = createStore()
    const vm = { currentFile: { id: 1 }, $store: store }

    tabsMixins.methods.selectFile.call(vm, { id: 2 })
    tabsMixins.methods.selectFile.call(vm, { id: 1 })
    expect(store.actions[0]).to.deep.equal(['UPDATE_CURRENT_FILE', { id: 2 }])

    tabsMixins.methods.removeFileInTab.call(vm, { isSaved: true })
    tabsMixins.methods.removeFileInTab.call(vm, { isSaved: false })
    expect(store.actions[1]).to.deep.equal(['FORCE_CLOSE_TAB', { isSaved: true }])
    expect(store.actions[2]).to.deep.equal(['CLOSE_UNSAVED_TAB', { isSaved: false }])
  })

  it('hides loading page when present and ignores missing', () => {
    const loadingPage = document.createElement('div')
    loadingPage.id = 'loading-page'
    document.body.appendChild(loadingPage)

    loadingPageMixins.methods.hideLoadingPage()
    expect(document.querySelector('#loading-page')).to.equal(null)

    // No throw when already removed
    loadingPageMixins.methods.hideLoadingPage()
  })

  it('handles search result click in existing tab and updates cursor', () => {
    const store = createStore()
    const openedTab = { pathname: '/tmp/file.md', cursor: null }
    const vm = {
      currentFile: openedTab,
      tabs: [openedTab],
      searchResult: { filePath: '/tmp/file.md' },
      $store: store
    }
    const range = [[1, 2], [3, 4]]

    fileMixins.methods.handleSearchResultClick.call(vm, { range })

    expect(openedTab.cursor).to.deep.equal({
      isCollapsed: true,
      anchor: { line: 1, ch: 2 },
      focus: { line: 3, ch: 4 }
    })
    expect(bus.__emitted[0]).to.equal('file-changed')
    expect(bus.__emitted[1].renderCursor).to.equal(true)
  })

  it('handles search result click by switching tabs or opening new file', () => {
    const store = createStore()
    const existing = { pathname: '/tmp/existing.md' }
    const other = { pathname: '/tmp/other.md' }
    const vm = {
      currentFile: other,
      tabs: [existing, other],
      searchResult: { filePath: '/tmp/existing.md' },
      $store: store
    }

    // Switch to already opened but inactive tab
    fileMixins.methods.handleSearchResultClick.call(vm, { range: [[0, 0], [0, 0]] })
    expect(store.actions[0]).to.deep.equal(['UPDATE_CURRENT_FILE', existing])

    // Open a brand new file
    vm.searchResult.filePath = '/tmp/new.md'
    fileMixins.methods.handleSearchResultClick.call(vm, { range: [[0, 0], [0, 0]] })
    expect(ipcRenderer.__sent).to.deep.equal(['mt::open-file', '/tmp/new.md', { cursor: {
      isCollapsed: false,
      anchor: { line: 0, ch: 0 },
      focus: { line: 0, ch: 0 }
    } }])
  })

  it('handles file click with markdown and non-markdown cases', () => {
    const store = createStore()
    const tab = { pathname: '/tmp/file.md' }
    const vm = {
      file: { isMarkdown: true, pathname: '/tmp/file.md' },
      currentFile: tab,
      tabs: [tab],
      $store: store
    }

    fileMixins.methods.handleFileClick.call(vm)
    expect(store.actions.length).to.equal(0)

    const otherTab = { pathname: '/tmp/other.md' }
    vm.tabs = [tab, otherTab]
    vm.currentFile = tab
    vm.file = { isMarkdown: true, pathname: '/tmp/other.md' }
    fileMixins.methods.handleFileClick.call(vm)
    expect(store.actions[0]).to.deep.equal(['UPDATE_CURRENT_FILE', otherTab])

    // open new markdown file not already tabbed
    vm.tabs = [tab]
    vm.file = { isMarkdown: true, pathname: '/tmp/new.md' }
    fileMixins.methods.handleFileClick.call(vm)
    expect(ipcRenderer.__sent).to.deep.equal(['mt::open-file', '/tmp/new.md', {}])
  })

  it('focuses creation input and dispatches creation', () => {
    const store = createStore()
    const vm = {
      createName: 'old',
      folder: { isCollapsed: true },
      $refs: { input: { focused: false, focus () { this.focused = true } } },
      $nextTick: fn => fn(),
      $store: store
    }

    createFileOrDirectoryMixins.methods.handleInputFocus.call(vm)
    expect(vm.$refs.input.focused).to.equal(true)
    expect(vm.createName).to.equal('')
    expect(vm.folder.isCollapsed).to.equal(false)

    vm.createName = 'new-item'
    createFileOrDirectoryMixins.methods.handleInputEnter.call(vm)
    expect(store.actions.pop()).to.deep.equal(['CREATE_FILE_DIRECTORY', 'new-item'])
  })
})
