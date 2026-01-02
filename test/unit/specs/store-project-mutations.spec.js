import project from '../../../src/renderer/store/project'

const { mutations } = project

const createRoot = () => {
  const state = {}
  mutations.SET_ROOT_DIRECTORY(state, '/root')
  return state
}

describe('store project mutations', () => {
  it('initializes root directory and caches names', () => {
    const state = {}
    mutations.SET_ROOT_DIRECTORY(state, '/')
    expect(state.projectTree.pathname).to.equal('/')
    expect(state.projectTree.name).to.equal('/')
  })

  it('adds and removes files and directories', () => {
    const state = createRoot()
    const change = { pathname: '/root/docs/a.md', name: 'a.md', birthTime: 0, isFile: true, isDirectory: false, isMarkdown: true }
    mutations.ADD_FILE(state, change)
    expect(state.projectTree.folders[0].files[0].name).to.equal('a.md')

    mutations.UNLINK_FILE(state, { pathname: '/root/docs/a.md' })
    expect(state.projectTree.folders[0].files).to.have.length(0)

    mutations.ADD_DIRECTORY(state, { pathname: '/root/docs' })
    expect(state.projectTree.folders[0].name).to.equal('docs')
    mutations.UNLINK_DIRECTORY(state, { pathname: '/root/docs' })
    expect(state.projectTree.folders).to.have.length(0)
  })

  it('tracks active item and caches clipboard/rename', () => {
    const state = createRoot()
    mutations.SET_ACTIVE_ITEM(state, { pathname: '/root' })
    expect(state.activeItem.pathname).to.equal('/root')
    mutations.SET_CLIPBOARD(state, { src: '/root/a.md' })
    expect(state.clipboard.src).to.equal('/root/a.md')
    mutations.SET_RENAME_CACHE(state, '/root/a.md')
    expect(state.renameCache).to.equal('/root/a.md')
  })
})
