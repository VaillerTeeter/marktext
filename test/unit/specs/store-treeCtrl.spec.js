import { addFile, addDirectory, unlinkFile, unlinkDirectory } from '../../../src/renderer/store/treeCtrl'

const ROOT_PATH = process.platform === 'win32' ? 'C:\\root' : '/root'

const createRoot = () => ({ pathname: ROOT_PATH, folders: [], files: [] })

const sampleFile = (pathname, name = 'a.md') => ({
  pathname,
  name,
  birthTime: 1,
  isDirectory: false,
  isFile: true,
  isMarkdown: pathname.endsWith('.md')
})

describe('store treeCtrl', () => {
  it('adds nested directories', () => {
    const tree = createRoot()
    const nestedPath = process.platform === 'win32' ? 'C:\\root\\first\\second' : '/root/first/second'
    addDirectory(tree, { pathname: nestedPath })

    expect(tree.folders).to.have.length(1)
    expect(tree.folders[0].name).to.equal('first')
    expect(tree.folders[0].folders[0].name).to.equal('second')
  })

  it('adds files into correct folder with sorting', () => {
    const tree = createRoot()
    const docBPath = process.platform === 'win32' ? 'C:\\root\\docs\\b.md' : '/root/docs/b.md'
    const docAPath = process.platform === 'win32' ? 'C:\\root\\docs\\a.md' : '/root/docs/a.md'
    addFile(tree, sampleFile(docBPath, 'b.md'))
    addFile(tree, sampleFile(docAPath, 'a.md'))

    const docs = tree.folders[0]
    expect(docs.files.map(f => f.name)).to.deep.equal(['a.md', 'b.md'])
    expect(docs.files[0].isMarkdown).to.equal(true)
  })

  it('throws on relative path input', () => {
    const tree = createRoot()
    expect(() => addFile(tree, sampleFile('relative/path.md'))).to.throw('Invalid path!')
  })

  it('unlinks files and directories', () => {
    const tree = createRoot()
    const docAPath = process.platform === 'win32' ? 'C:\\root\\docs\\a.md' : '/root/docs/a.md'
    const subPath = process.platform === 'win32' ? 'C:\\root\\docs\\sub' : '/root/docs/sub'
    
    addFile(tree, sampleFile(docAPath, 'a.md'))
    addDirectory(tree, { pathname: subPath })

    unlinkFile(tree, { pathname: docAPath })
    expect(tree.folders[0].files).to.have.length(0)

    unlinkDirectory(tree, { pathname: subPath })
    expect(tree.folders[0].folders).to.have.length(0)
  })
})
