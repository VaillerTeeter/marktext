import fs from 'fs'
import fsExtra from 'fs-extra'
import os from 'os'
import path from 'path'
import { ensureDirSync, exists, isDirectory, isDirectory2, isFile, isFile2, isSymbolicLink } from '../../../src/common/filesystem'

describe('common filesystem index (extra)', () => {
  let tempDir

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-fs-extra-'))
  })

  afterEach(() => {
    fsExtra.removeSync(tempDir)
  })

  it('ensures directories without throwing when existing', () => {
    ensureDirSync(tempDir)
    ensureDirSync(tempDir)
    expect(fs.existsSync(tempDir)).to.equal(true)
  })

  it('handles symbolic links pointing to directories and files', () => {
    const dir = path.join(tempDir, 'dir')
    const file = path.join(tempDir, 'file.txt')
    fsExtra.ensureDirSync(dir)
    fsExtra.writeFileSync(file, 'x')

    const dirLink = path.join(tempDir, 'dir-link')
    const fileLink = path.join(tempDir, 'file-link')
    fs.symlinkSync(dir, dirLink)
    fs.symlinkSync(file, fileLink)

    expect(isDirectory2(dirLink)).to.equal(true)
    expect(isFile2(fileLink)).to.equal(true)
    expect(isSymbolicLink(fileLink)).to.equal(true)
  })

  it('returns false for missing paths', () => {
    const missing = path.join(tempDir, 'nope')
    expect(isDirectory2(missing)).to.equal(false)
    expect(isFile2(missing)).to.equal(false)
    return exists(missing).then(result => {
      expect(result).to.equal(false)
    })
  })

  it('ignores EEXIST when ensuring directories', () => {
    const fsModuleId = require.resolve('../../../src/common/filesystem')
    const fsExtraId = require.resolve('fs-extra')
    const originalFsExtra = require.cache[fsExtraId]
    const originalFsModule = require.cache[fsModuleId]
    require.cache[fsExtraId] = { exports: {
      ensureDirSync: () => { const err = new Error('exists'); err.code = 'EEXIST'; throw err },
      existsSync: () => true,
      lstatSync: () => ({ isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false }),
      readlinkSync: () => tempDir
    } }
    delete require.cache[fsModuleId]
    const fresh = require('../../../src/common/filesystem')
    expect(() => fresh.ensureDirSync(tempDir)).to.not.throw()

    if (originalFsExtra) {
      require.cache[fsExtraId] = originalFsExtra
    } else {
      delete require.cache[fsExtraId]
    }
    if (originalFsModule) {
      require.cache[fsModuleId] = originalFsModule
    } else {
      delete require.cache[fsModuleId]
    }
  })

  it('rethrows unexpected ensureDir errors', () => {
    const fsModuleId = require.resolve('../../../src/common/filesystem')
    const fsExtraId = require.resolve('fs-extra')
    const originalFsExtra = require.cache[fsExtraId]
    const originalFsModule = require.cache[fsModuleId]
    require.cache[fsExtraId] = { exports: {
      ensureDirSync: () => { const err = new Error('denied'); err.code = 'EACCES'; throw err }
    } }
    delete require.cache[fsModuleId]
    const fresh = require('../../../src/common/filesystem')
    expect(() => fresh.ensureDirSync(tempDir)).to.throw()

    if (originalFsExtra) {
      require.cache[fsExtraId] = originalFsExtra
    } else {
      delete require.cache[fsExtraId]
    }
    if (originalFsModule) {
      require.cache[fsModuleId] = originalFsModule
    } else {
      delete require.cache[fsModuleId]
    }
  })

  it('returns false when fs operations throw', () => {
    const originalExists = fsExtra.existsSync
    const originalLstat = fsExtra.lstatSync
    const originalReadlink = fsExtra.readlinkSync

    fsExtra.existsSync = () => { throw new Error('boom') }
    expect(isDirectory('/missing')).to.equal(false)
    expect(isDirectory2('/missing')).to.equal(false)
    expect(isFile('/missing')).to.equal(false)
    expect(isSymbolicLink('/missing')).to.equal(false)

    fsExtra.existsSync = () => true
    fsExtra.lstatSync = () => ({ isFile: () => false, isSymbolicLink: () => false })
    expect(isFile2('/missing')).to.equal(false)

    fsExtra.lstatSync = () => { throw new Error('bad lstat') }
    expect(isFile2('/missing')).to.equal(false)
    fsExtra.readlinkSync = () => '/link-target'
    expect(isDirectory2('/missing')).to.equal(false)

    fsExtra.existsSync = originalExists
    fsExtra.lstatSync = originalLstat
    fsExtra.readlinkSync = originalReadlink
  })
})
