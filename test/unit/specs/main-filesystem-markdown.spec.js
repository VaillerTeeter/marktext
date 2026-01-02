/* global __webpack_require__ */
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import iconv from 'iconv-lite'
import { normalizeMarkdownPath, writeMarkdownFile, loadMarkdownFile } from '../../../src/main/filesystem/markdown'

const createTemp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mt-md-'))
const filesystemModuleId = require.resolve('../../../src/main/filesystem')
const markdownModuleId = require.resolve('../../../src/main/filesystem/markdown')

describe('main filesystem markdown', () => {
  it('normalizes markdown files and directories', () => {
    const tmp = createTemp()
    const file = path.join(tmp, 'note.md')
    fs.writeFileSync(file, 'hello')
    const dirResult = normalizeMarkdownPath(tmp)
    expect(dirResult.isDir).to.equal(true)
    expect(dirResult.path).to.equal(path.resolve(tmp))

    const fileResult = normalizeMarkdownPath(file)
    expect(fileResult.isDir).to.equal(false)
    expect(fileResult.path).to.equal(path.resolve(file))

    const none = normalizeMarkdownPath(path.join(tmp, 'image.png'))
    expect(none).to.equal(null)

    fs.removeSync(tmp)
  })

  it('writes markdown with adjusted line endings', async () => {
    const tmp = createTemp()
    const file = path.join(tmp, 'file.md')
    await writeMarkdownFile(file, 'a\nb', {
      adjustLineEndingOnSave: true,
      lineEnding: 'crlf',
      encoding: { encoding: 'utf8', isBom: false }
    })
    const content = fs.readFileSync(file, 'utf8')
    expect(content).to.equal('a\r\nb')
    fs.removeSync(tmp)
  })

  it('writes markdown without altering line endings when disabled', async () => {
    const tmp = createTemp()
    const file = path.join(tmp, 'plain.md')
    await writeMarkdownFile(file, 'a\rb', {
      adjustLineEndingOnSave: false,
      lineEnding: 'lf',
      encoding: { encoding: 'utf8', isBom: false }
    })
    const content = fs.readFileSync(file, 'utf8')
    expect(content).to.equal('a\rb')
    fs.removeSync(tmp)
  })

  it('falls back to .md extension when none is provided', async () => {
    const tmp = createTemp()
    const file = path.join(tmp, 'note')
    await writeMarkdownFile(file, 'content', {
      adjustLineEndingOnSave: false,
      lineEnding: 'lf',
      encoding: { encoding: 'utf8', isBom: false }
    })

    const finalPath = `${file}.md`
    expect(fs.existsSync(finalPath)).to.equal(true)
    expect(fs.readFileSync(finalPath, 'utf8')).to.equal('content')
    fs.removeSync(tmp)
  })

  it('loads markdown and detects line endings and encoding', async () => {
    const tmp = createTemp()
    const file = path.join(tmp, 'file.md')
    fs.writeFileSync(file, 'line1\r\nline2')
    const result = await loadMarkdownFile(file, 'lf', false, 2)
    expect(result.filename).to.equal('file.md')
    expect(result.encoding.encoding).to.equal('utf8')
    expect(result.lineEnding).to.equal('crlf')
    expect(result.adjustLineEndingOnSave).to.equal(true)
    expect(result.markdown).to.equal('line1\nline2')
    fs.removeSync(tmp)
  })

  it('guesses encoding with default options', async () => {
    const tmp = createTemp()
    const file = path.join(tmp, 'defaults.md')
    fs.writeFileSync(file, 'alpha\nbeta')

    const result = await loadMarkdownFile(file, 'lf')
    expect(result.adjustLineEndingOnSave).to.equal(false)
    expect(result.trimTrailingNewline).to.equal(0)

    fs.removeSync(tmp)
  })

  it('returns null and logs when target cannot be resolved', () => {
    const tmp = createTemp()
    const broken = path.join(tmp, 'missing.md')
    const pathsModuleId = require.resolve('../../../src/common/filesystem/paths')
    const commonModuleId = require.resolve('../../../src/common/filesystem')
    const originalPaths = require.cache[pathsModuleId]
    const originalCommon = require.cache[commonModuleId]
    require.cache[pathsModuleId] = { exports: { isMarkdownFile: () => true } }
    require.cache[commonModuleId] = { exports: { isDirectory2: () => false, isSymbolicLink: () => false, isFile: () => false, isDirectory: () => false } }
    delete __webpack_require__.c[markdownModuleId]
    const originalError = console.error
    let logged = false
    console.error = () => { logged = true }

    const { normalizeMarkdownPath: freshNormalize } = require('../../../src/main/filesystem/markdown')
    const result = freshNormalize(broken)

    expect(result).to.equal(null)
    expect(logged).to.equal(true)
    if (originalPaths) {
      require.cache[pathsModuleId] = originalPaths
    } else {
      delete require.cache[pathsModuleId]
    }
    if (originalCommon) {
      require.cache[commonModuleId] = originalCommon
    } else {
      delete require.cache[commonModuleId]
    }
    delete __webpack_require__.c[markdownModuleId]
    fs.removeSync(tmp)
    console.error = originalError
  })

  it('falls back on invalid line ending and writes file', async () => {
    const tmp = createTemp()
    const file = path.join(tmp, 'invalid.md')
    const logModule = require('electron-log/main')
    const originalLogErr = logModule.error
    let logged = false
    logModule.error = () => { logged = true }

    await writeMarkdownFile(file, 'x\ny', {
      adjustLineEndingOnSave: true,
      lineEnding: 'weird',
      encoding: { encoding: 'utf8', isBom: false }
    })

    expect(fs.readFileSync(file, 'utf8')).to.equal('x\ny')
    expect(logged).to.equal(true)
    logModule.error = originalLogErr
    fs.removeSync(tmp)
  })

  it('throws when encoding is not supported', async () => {
    const tmp = createTemp()
    const file = path.join(tmp, 'unsupported.md')
    fs.writeFileSync(file, 'content')
    const originalEncodingExists = iconv.encodingExists
    iconv.encodingExists = () => false

    let error = null
    try {
      await loadMarkdownFile(file, 'lf', false, 2)
    } catch (err) {
      error = err
    }

    expect(error).to.be.an('error')
    iconv.encodingExists = originalEncodingExists
    fs.removeSync(tmp)
  })

  it('handles mixed endings and trailing newline variants', async () => {
    const tmp = createTemp()

    const mixedFile = path.join(tmp, 'mixed.md')
    fs.writeFileSync(mixedFile, 'a\r\nb\n')
    const mixed = await loadMarkdownFile(mixedFile, 'lf', false, 2)
    expect(mixed.isMixedLineEndings).to.equal(true)
    expect(mixed.adjustLineEndingOnSave).to.equal(false)

    const singleNl = path.join(tmp, 'single.md')
    fs.writeFileSync(singleNl, 'line\n')
    const single = await loadMarkdownFile(singleNl, 'lf', false, 2)
    expect(single.trimTrailingNewline).to.equal(1)

    const doubleNl = path.join(tmp, 'double.md')
    fs.writeFileSync(doubleNl, 'line\n\n')
    const double = await loadMarkdownFile(doubleNl, 'lf', false, 2)
    expect(double.trimTrailingNewline).to.equal(2)

    const emptyFile = path.join(tmp, 'empty.md')
    fs.writeFileSync(emptyFile, '')
    const empty = await loadMarkdownFile(emptyFile, 'lf', false, 2)
    expect(empty.trimTrailingNewline).to.equal(3)

    const explicitTrim = path.join(tmp, 'explicit.md')
    fs.writeFileSync(explicitTrim, 'line\n')
    const explicit = await loadMarkdownFile(explicitTrim, 'lf', false, 0)
    expect(explicit.trimTrailingNewline).to.equal(0)

    fs.removeSync(tmp)
  })
})
