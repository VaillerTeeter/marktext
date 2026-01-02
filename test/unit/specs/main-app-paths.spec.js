import fs from 'fs'
import os from 'os'
import path from 'path'
import AppPaths, { ensureAppDirectoriesSync } from '../../../src/main/app/paths'

describe('main app paths', () => {
  const electron = window.require('electron')
  const app = electron.app || (electron.app = {})
  const originalGetPath = app.getPath
  const originalSetPath = app.setPath

  afterEach(() => {
    if (originalGetPath === undefined) {
      delete app.getPath
    } else {
      app.getPath = originalGetPath
    }
    if (originalSetPath === undefined) {
      delete app.setPath
    } else {
      app.setPath = originalSetPath
    }
  })

  it('falls back to Electron userData when path is not provided', () => {
    const fallback = path.join(os.tmpdir(), 'mt-paths-default')
    let capturedPath = null

    app.getPath = () => fallback
    app.setPath = (key, value) => {
      if (key === 'userData') {
        capturedPath = value
      }
    }

    const paths = new AppPaths()

    expect(paths.userDataPath).to.equal(fallback)
    expect(paths.electronUserDataPath).to.equal(fallback)
    expect(capturedPath).to.equal(fallback)
  })

  it('ensures application directories exist', () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-paths-ensure-'))
    const now = new Date()
    const logPath = path.join(base, 'logs', `${now.getFullYear()}${now.getMonth() + 1}`)

    ensureAppDirectoriesSync({ userDataPath: base, logPath })

    expect(fs.existsSync(base)).to.equal(true)
    expect(fs.existsSync(logPath)).to.equal(true)

    fs.rmSync(base, { recursive: true, force: true })
  })
})
