import project from '../../../src/renderer/store/project'
import path from 'path'

const { mutations } = project

const createRoot = () => {
  const state = {}
  // Use platform-agnostic root path
  const rootPath = process.platform === 'win32' ? 'C:\\test' : '/root'
  mutations.SET_ROOT_DIRECTORY(state, rootPath)
  return state
}

describe('store project mutations', () => {
  it('initializes root directory and caches names', () => {
    const state = {}
    // Test with platform-specific root
    const testRoot = process.platform === 'win32' ? 'C:\\' : '/'
    mutations.SET_ROOT_DIRECTORY(state, testRoot)
    // Normalize path separators for comparison
    const pathname = state.projectTree.pathname.replace(/\\/g, '/')
    expect(pathname === '/' || pathname === 'C:/').to.be.true
  })

  it('adds and removes files and directories', () => {
    const path = require('path')
    const state = createRoot()
    const rootPath = process.platform === 'win32' ? 'C:\\test' : '/root'
    
    // Test adding and removing a file
    const filePath = path.join(rootPath, 'docs', 'a.md')
    const change = { pathname: filePath, name: 'a.md', birthTime: 0, isFile: true, isDirectory: false, isMarkdown: true }
    mutations.ADD_FILE(state, change)
    expect(state.projectTree.folders[0].files[0].name).to.equal('a.md')

    mutations.UNLINK_FILE(state, { pathname: filePath })
    expect(state.projectTree.folders[0].files).to.have.length(0)

    // At this point, docs folder still exists but is empty
    expect(state.projectTree.folders[0].name).to.equal('docs')

    // Test adding and removing a directory
    const subDirPath = path.join(rootPath, 'docs', 'sub')
    mutations.ADD_DIRECTORY(state, { pathname: subDirPath })
    expect(state.projectTree.folders[0].folders[0].name).to.equal('sub')
    
    mutations.UNLINK_DIRECTORY(state, { pathname: subDirPath })
    expect(state.projectTree.folders[0].folders).to.have.length(0)
    
    // Now unlink the empty docs folder
    const docsPath = path.join(rootPath, 'docs')
    mutations.UNLINK_DIRECTORY(state, { pathname: docsPath })
    expect(state.projectTree.folders).to.have.length(0)
  })

  it('tracks active item and caches clipboard/rename', () => {
    const state = createRoot()
    const rootPath = process.platform === 'win32' ? 'C:\\test' : '/root'
    mutations.SET_ACTIVE_ITEM(state, { pathname: rootPath })
    expect(state.activeItem.pathname).to.equal(rootPath)
    mutations.SET_CLIPBOARD(state, { src: `${rootPath}/a.md` })
    expect(state.clipboard.src).to.equal(`${rootPath}/a.md`)
    mutations.SET_RENAME_CACHE(state, `${rootPath}/a.md`)
    expect(state.renameCache).to.equal(`${rootPath}/a.md`)
  })
})
