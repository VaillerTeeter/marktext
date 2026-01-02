import fs from 'fs'
import path from 'path'
import os from 'os'
import { searchFilesAndDir, watchers } from '../../../src/main/utils/imagePathAutoComplement'

describe('main utils imagePathAutoComplement', () => {
  const cleanup = dir => {
    watchers.forEach(w => {
      if (w && w.close) w.close()
    })
    watchers.clear()
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }

  it('filters directories and image files and caches watcher', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-image-'))
    fs.writeFileSync(path.join(tmpDir, 'foo.png'), 'data')
    fs.writeFileSync(path.join(tmpDir, 'ignore.txt'), 'x')
    fs.mkdirSync(path.join(tmpDir, 'subdir'))

    const results = await searchFilesAndDir(tmpDir, '')
    const names = results.map(r => r.file).sort()
    expect(names).to.include('foo.png')
    expect(names).to.include('subdir')

    expect(watchers.has(tmpDir)).to.equal(true)
    cleanup(tmpDir)
  })

  it('returns cached results without rewatching', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-image-'))
    fs.writeFileSync(path.join(tmpDir, 'foo.png'), 'data')

    await searchFilesAndDir(tmpDir, '')
    const cached = await searchFilesAndDir(tmpDir, 'foo')
    expect(cached[0].file).to.equal('foo.png')
    cleanup(tmpDir)
  })

  it('logs errors when rebuild fails', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-image-'))
    const fsModule = require('fs')
    const originalWatch = fsModule.watch
    const originalReaddir = fsModule.readdir
    const log = require('electron-log/main')
    const originalLog = log.error
    let watchCallback
    let logged = false
    fsModule.watch = (dir, cb) => { watchCallback = cb; return { close: () => {} } }
    let count = 0
    fsModule.readdir = (dir, cb) => {
      count += 1
      if (count === 1) {
        cb(null, [])
      } else {
        cb(new Error('fail'), null)
      }
    }
    log.error = () => { logged = true }

    await searchFilesAndDir(tmpDir, '')
    watchCallback('rename')
    expect(logged).to.equal(true)

    fsModule.watch = originalWatch
    fsModule.readdir = originalReaddir
    log.error = originalLog
    cleanup(tmpDir)
  })

  it('rebuilds watcher cache on rename events', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-image-'))
    const fsModule = require('fs')
    const originalWatch = fsModule.watch
    const originalReaddir = fsModule.readdir
    let watchCallback
    let rebuilt = 0

    fsModule.watch = (dir, cb) => { watchCallback = cb; return { close: () => {} } }
    fsModule.readdir = (dir, cb) => { rebuilt += 1; cb(null, ['image.jpg']) }

    await searchFilesAndDir(tmpDir, '')
    watchCallback('rename')
    watchCallback('change')

    expect(rebuilt).to.be.greaterThan(1)

    fsModule.watch = originalWatch
    fsModule.readdir = originalReaddir
    cleanup(tmpDir)
  })

  it('rejects when directory listing fails', async () => {
    let error = null
    try {
      await searchFilesAndDir('/not-a-dir', '')
    } catch (err) {
      error = err
    }
    expect(error).to.be.an('error')
  })

  it('reuses existing watcher and handles undefined key lookups', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-image-'))
    fs.writeFileSync(path.join(tmpDir, 'foo.jpg'), 'data')

    // Pretend the directory is already being watched to exercise the guard branch.
    watchers.set(tmpDir, { close: () => {} })

    const result = await searchFilesAndDir(tmpDir)
    expect(result).to.equal(undefined)
    expect(watchers.has(tmpDir)).to.equal(true)

    const cached = await searchFilesAndDir(tmpDir, 'foo')
    expect(cached[0].file).to.equal('foo.jpg')
    cleanup(tmpDir)
  })

  it('filters blacklisted entries when building cache', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-image-'))
    fs.writeFileSync(path.join(tmpDir, '$RECYCLE.BIN'), 'data')
    fs.writeFileSync(path.join(tmpDir, 'pic.png'), 'data')

    const results = await searchFilesAndDir(tmpDir, '')
    const names = results.map(r => r.file)
    expect(names).to.include('pic.png')
    expect(names).to.not.include('.DS_Store')
    cleanup(tmpDir)
  })
})
