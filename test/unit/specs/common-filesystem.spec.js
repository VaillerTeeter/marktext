import fs from 'fs'
import fsExtra from 'fs-extra'
import os from 'os'
import path from 'path'
import {
  exists,
  ensureDirSync,
  isDirectory,
  isDirectory2,
  isFile,
  isFile2,
  isSymbolicLink
} from '../../../src/common/filesystem'
import {
  hasMarkdownExtension,
  isImageFile,
  isMarkdownFile,
  isSamePathSync,
  isChildOfDirectory,
  getResourcesPath
} from '../../../src/common/filesystem/paths'

describe('common filesystem helpers', () => {
  let tempDir

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-fs-'))
  })

  afterEach(() => {
    fsExtra.removeSync(tempDir)
  })

  it('checks existence and directory creation helpers', async () => {
    const filePath = path.join(tempDir, 'note.md')
    await fsExtra.outputFile(filePath, '# test')
    expect(await exists(filePath)).to.equal(true)

    ensureDirSync(path.join(tempDir, 'nested'))
    expect(isDirectory(path.join(tempDir, 'nested'))).to.equal(true)
  })

  it('detects directories, files, and symbolic links', () => {
    const dirPath = path.join(tempDir, 'dir')
    const filePath = path.join(dirPath, 'file.txt')
    fsExtra.ensureDirSync(dirPath)
    fsExtra.writeFileSync(filePath, 'content')

    expect(isDirectory(dirPath)).to.equal(true)
    expect(isDirectory2(dirPath)).to.equal(true)
    expect(isFile(filePath)).to.equal(true)
    expect(isFile2(filePath)).to.equal(true)

    const linkPath = path.join(tempDir, 'link-to-file')
    fs.symlinkSync(filePath, linkPath)
    expect(isSymbolicLink(linkPath)).to.equal(true)
    expect(isFile2(linkPath)).to.equal(true)
  })

  it('recognizes markdown and image files', () => {
    const mdPath = path.join(tempDir, 'readme.MD')
    const pngPath = path.join(tempDir, 'image.png')
    fsExtra.writeFileSync(mdPath, 'md')
    fsExtra.writeFileSync(pngPath, 'png')

    expect(hasMarkdownExtension(mdPath)).to.equal(true)
    expect(isMarkdownFile(mdPath)).to.equal(true)
    expect(isImageFile(pngPath)).to.equal(true)
  })

  it('resolves markdown via symbolic links', () => {
    const mdPath = path.join(tempDir, 'linked.md')
    const linkPath = path.join(tempDir, 'alias')
    fsExtra.writeFileSync(mdPath, 'md')
    fs.symlinkSync(mdPath, linkPath)
    expect(isMarkdownFile(linkPath)).to.equal(true)
  })

  it('compares paths and child relationships', () => {
    const parent = path.join(tempDir, 'parent')
    const child = path.join(parent, 'child.md')
    fsExtra.ensureDirSync(parent)
    fsExtra.writeFileSync(child, 'content')

    expect(isSamePathSync(child, path.normalize(child))).to.equal(true)
    expect(isSamePathSync(child, path.join(parent, 'other.md'))).to.equal(false)
    expect(isChildOfDirectory(parent, child)).to.equal(true)
    expect(isChildOfDirectory(parent, tempDir)).to.equal(false)
  })

  it('handles empty inputs and case-insensitive inode comparisons', () => {
    expect(isSamePathSync('', '')).to.equal(false)

    const originalStat = fs.statSync
    fs.statSync = () => ({ ino: 1 })
    expect(isSamePathSync('/tmp/A', '/tmp/a', true)).to.equal(true)
    fs.statSync = originalStat

    expect(isChildOfDirectory('', '')).to.equal(false)
  })

  it('returns a resources path based on current environment', () => {
    const result = getResourcesPath()
    if (process.env.NODE_ENV === 'development') {
      expect(result.includes('resources')).to.equal(true)
    } else {
      expect(result).to.equal(process.resourcesPath)
    }
  })

  it('builds darwin resources path in development mode', () => {
    const envKey = 'NODE_ENV'
    const originalEnv = process.env[envKey]
    const platformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')
    Object.defineProperty(process, 'platform', { value: 'darwin' })
    process.env[envKey] = 'development'

    const pathsModuleId = require.resolve('../../../src/common/filesystem/paths')
    const originalModule = require.cache[pathsModuleId]
    delete require.cache[pathsModuleId]
    const { getResourcesPath: freshGetResourcesPath } = require('../../../src/common/filesystem/paths')
    const result = freshGetResourcesPath()
    expect(result.includes('resources')).to.equal(true)

    if (originalModule) {
      require.cache[pathsModuleId] = originalModule
    } else {
      delete require.cache[pathsModuleId]
    }
    process.env[envKey] = originalEnv
    Object.defineProperty(process, 'platform', platformDescriptor)
  })

  it('uses packaged resources path outside development', () => {
    const envKey = 'NODE_ENV'
    const originalEnv = process.env[envKey]
    process.env[envKey] = 'production'

    const pathsModuleId = require.resolve('../../../src/common/filesystem/paths')
    const originalModule = require.cache[pathsModuleId]
    delete require.cache[pathsModuleId]
    const { getResourcesPath: freshGetResourcesPath } = require('../../../src/common/filesystem/paths')
    const result = freshGetResourcesPath()
    expect(result).to.be.a('string')
    expect(result.length).to.be.greaterThan(0)

    if (originalModule) {
      require.cache[pathsModuleId] = originalModule
    } else {
      delete require.cache[pathsModuleId]
    }
    process.env[envKey] = originalEnv
  })
})
