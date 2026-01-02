/* global __webpack_require__ */
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { normalizeAndResolvePath, writeFile } from '../../../src/main/filesystem'

const commonFilesystemId = require.resolve('../../../src/common/filesystem')
const mainFilesystemId = require.resolve('../../../src/main/filesystem')

describe('main filesystem index', () => {
  const tmpRoot = path.join(os.tmpdir(), 'mt-fs-index')

  afterEach(() => {
    fs.removeSync(tmpRoot)
  })

  it('resolves symbolic links and normal paths', () => {
    fs.ensureDirSync(tmpRoot)
    const filePath = path.join(tmpRoot, 'file.txt')
    const linkPath = path.join(tmpRoot, 'file-link')
    fs.writeFileSync(filePath, 'content')
    fs.symlinkSync(filePath, linkPath)

    const resolvedLink = normalizeAndResolvePath(linkPath)
    expect(resolvedLink).to.equal(path.resolve(filePath))

    const resolvedFile = normalizeAndResolvePath(filePath)
    expect(resolvedFile).to.equal(path.resolve(filePath))
  })

  it('rejects writeFile when no pathname', async () => {
    let error = null
    try {
      await writeFile('', 'data')
    } catch (err) {
      error = err
    }
    expect(error).to.be.an('error')
  })

  it('returns empty string when symlink target is missing', () => {
    fs.ensureDirSync(tmpRoot)
    const target = path.join(tmpRoot, 'file.txt')
    const danglingLink = path.join(tmpRoot, 'dangling')
    fs.writeFileSync(target, 'content')
    fs.symlinkSync(target, danglingLink)

    const originalError = console.error
    const originalCommonFs = __webpack_require__.c[commonFilesystemId]
    delete __webpack_require__.c[mainFilesystemId]
    __webpack_require__.c[commonFilesystemId] = { exports: { isSymbolicLink: () => true, isFile: () => false, isDirectory: () => false } }
    let logged = false
    console.error = () => { logged = true }

    const { normalizeAndResolvePath: freshNormalize } = require('../../../src/main/filesystem')
    const result = freshNormalize(danglingLink)

    expect(result).to.equal('')
    expect(logged).to.equal(true)

    __webpack_require__.c[commonFilesystemId] = originalCommonFs
    delete __webpack_require__.c[mainFilesystemId]
    console.error = originalError
  })

  it('appends extension when missing', async () => {
    fs.ensureDirSync(tmpRoot)
    const file = path.join(tmpRoot, 'note')
    await writeFile(file, 'hello', '.txt')
    expect(fs.readFileSync(`${file}.txt`, 'utf8')).to.equal('hello')
  })
})
