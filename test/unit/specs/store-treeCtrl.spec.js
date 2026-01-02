import { addFile, addDirectory, unlinkFile, unlinkDirectory } from '../../../src/renderer/store/treeCtrl'

const createRoot = () => ({ pathname: '/root', folders: [], files: [] })

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
    addDirectory(tree, { pathname: '/root/first/second' })

    expect(tree.folders).to.have.length(1)
    expect(tree.folders[0].name).to.equal('first')
    expect(tree.folders[0].folders[0].name).to.equal('second')
  })

  it('adds files into correct folder with sorting', () => {
    const tree = createRoot()
    addFile(tree, sampleFile('/root/docs/b.md', 'b.md'))
    addFile(tree, sampleFile('/root/docs/a.md', 'a.md'))

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
    addFile(tree, sampleFile('/root/docs/a.md', 'a.md'))
    addDirectory(tree, { pathname: '/root/docs/sub' })

    unlinkFile(tree, { pathname: '/root/docs/a.md' })
    expect(tree.folders[0].files).to.have.length(0)

    unlinkDirectory(tree, { pathname: '/root/docs/sub' })
    expect(tree.folders[0].folders).to.have.length(0)
  })
})
