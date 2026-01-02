import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  hasMarkdownExtension,
  isImageFile,
  isMarkdownFile,
  isSamePathSync,
  isChildOfDirectory,
  getResourcesPath
} from '../../../src/common/filesystem/paths'

const { mkdtempSync, writeFileSync, symlinkSync, rmSync } = fs

describe('common filesystem paths extra2', () => {
  let tempDir

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'mt-paths2-'))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('detects markdown extensions case-insensitively', () => {
    expect(hasMarkdownExtension('note.MD')).to.equal(true)
    expect(hasMarkdownExtension('image.png')).to.equal(false)
  })

  it('detects image files and markdown symlinks', () => {
    const img = path.join(tempDir, 'pic.jpg')
    writeFileSync(img, 'data')
    expect(isImageFile(img)).to.equal(true)

    const md = path.join(tempDir, 'doc.md')
    writeFileSync(md, '# title')
    const link = path.join(tempDir, 'alias.md')
    symlinkSync(md, link)
    expect(isMarkdownFile(link)).to.equal(true)
  })

  it('compares paths and directory children', () => {
    const file = path.join(tempDir, 'x.txt')
    writeFileSync(file, 'x')
    const same = path.join(tempDir, 'X.txt')
    expect(isSamePathSync(file, same) || isSamePathSync(file, file)).to.equal(true)
    expect(isChildOfDirectory(tempDir, file)).to.equal(true)
    expect(isChildOfDirectory(tempDir, path.join(tempDir, '..'))).to.equal(false)
  })

  it('handles invalid inputs gracefully', () => {
    expect(hasMarkdownExtension(null)).to.equal(false)
    const missing = path.join(tempDir, 'missing.md')
    expect(isMarkdownFile(missing)).to.equal(false)
    expect(isImageFile(missing)).to.equal(false)
    expect(isSamePathSync(missing, path.join(tempDir, 'other.md'))).to.equal(false)
  })

  it('returns a non-empty resources path', () => {
    const res = getResourcesPath()
    expect(typeof res).to.equal('string')
    expect(res.length).to.be.greaterThan(0)
  })
})
