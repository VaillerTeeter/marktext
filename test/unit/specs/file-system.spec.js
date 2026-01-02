import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { getHash, getContentHash, moveToRelativeFolder, moveImageToFolder, isFileExecutableSync } from '../../../src/renderer/util/fileSystem'

describe('renderer util fileSystem', () => {
  let tempDir

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mt-fs-'))
  })

  afterEach(async () => {
    if (tempDir) {
      await fs.remove(tempDir)
    }
  })

  it('computes stable hashes', () => {
    expect(getHash('hello', 'utf8', 'sha1')).to.equal('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
    expect(getContentHash('world')).to.equal('7c211433f02071597741e6ff5a8ea34789abbf43')
  })

  it('moves images into relative folders and normalizes path separators', async () => {
    const imagePath = path.join(tempDir, 'image.png')
    await fs.outputFile(imagePath, 'binary')

    const cwd = tempDir
    const filePath = path.join(tempDir, 'note.md')
    const relativePath = await moveToRelativeFolder(cwd, 'imgs', filePath, imagePath)

    const expectedDst = path.join(tempDir, 'imgs', 'image.png')
    expect(await fs.pathExists(expectedDst)).to.equal(true)
    expect(await fs.pathExists(imagePath)).to.equal(false)
    expect(relativePath === 'imgs/image.png' || relativePath === 'imgs\\image.png').to.equal(true)
  })

  it('throws on absolute relative folder and returns original when input is not image', async () => {
    const imagePath = path.join(tempDir, 'image.png')
    await fs.outputFile(imagePath, 'binary')

    const cwd = tempDir
    const filePath = path.join(tempDir, 'note.md')

    let err
    try {
      await moveToRelativeFolder(cwd, path.join('/', 'abs'), filePath, imagePath)
    } catch (e) {
      err = e
    }
    expect(err).to.be.an('error')

    const outputDir = path.join(tempDir, 'out')
    const notImagePath = path.join(tempDir, 'doc.txt')
    await fs.outputFile(notImagePath, 'plain')
    const result = await moveImageToFolder(filePath, 'doc.txt', outputDir)
    expect(result).to.equal('doc.txt')
  })

  it('detects executable files by permission bits', async () => {
    const filePath = path.join(tempDir, 'script.sh')
    await fs.outputFile(filePath, '#!/bin/sh\necho ok')

    await fs.chmod(filePath, 0o700)
    expect(isFileExecutableSync(filePath)).to.equal(true)

    await fs.chmod(filePath, 0o600)
    expect(isFileExecutableSync(filePath)).to.equal(false)
  })
})
