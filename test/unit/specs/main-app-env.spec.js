import fs from 'fs'
import os from 'os'
import path from 'path'
import setupEnvironment, { AppEnvironment } from '../../../src/main/app/env'

describe('main app env', () => {
  const electron = window.require('electron')
  const app = electron.app || (electron.app = {})
  const originalGetPath = app.getPath
  const originalSetPath = app.setPath
  const originalPlatform = process.platform
  const originalPath = process.env.PATH
  let tmpDir = ''

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-app-env-'))
    app.getPath = () => tmpDir
    app.setPath = () => {}
  })

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
    Object.defineProperty(process, 'platform', { value: originalPlatform })
    process.env.PATH = originalPath
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('creates an environment instance with provided flags', () => {
    const env = setupEnvironment({
      '--debug': true,
      '--verbose': 2,
      '--safe': true,
      '--user-data-dir': tmpDir,
      '--disable-spellcheck': true
    })

    expect(env.paths.userDataPath).to.equal(tmpDir)
    expect(env.debug).to.equal(true)
    expect(env.verbose).to.equal(true)
    expect(env.safeMode).to.equal(true)
    expect(env.disableSpellcheck).to.equal(true)
    expect(env.isDevMode).to.equal(true)
    expect(global.MARKTEXT_DEBUG).to.equal(true)
    expect(global.MARKTEXT_DEBUG_VERBOSE).to.equal(2)
    expect(global.MARKTEXT_SAFE_MODE).to.equal(true)
  })

  it('increments environment identifiers', () => {
    const a = new AppEnvironment({ userDataPath: tmpDir, debug: false, isDevMode: false, verbose: 0, safeMode: false })
    const b = new AppEnvironment({ userDataPath: tmpDir, debug: false, isDevMode: false, verbose: 0, safeMode: false })
    expect(b.id).to.be.greaterThan(a.id)
  })

  it('patches PATH on darwin without duplicate delimiter', function() {
    // Only test on macOS
    if (process.platform !== 'darwin') {
      this.skip()
      return
    }
    
    Object.defineProperty(process, 'platform', { value: 'darwin' })
    process.env.PATH = '/tmp/bin'

    setupEnvironment({ '--user-data-dir': tmpDir, '--debug': false, '--verbose': 0, '--safe': false })

    expect(process.env.PATH.endsWith('/tmp/bin:/Library/TeX/texbin')).to.equal(true)
  })

  it('appends TeX bin when PATH already ends with delimiter', function() {
    // Only test on macOS
    if (process.platform !== 'darwin') {
      this.skip()
      return
    }
    
    Object.defineProperty(process, 'platform', { value: 'darwin' })
    process.env.PATH = '/tmp/bin:'

    setupEnvironment({ '--user-data-dir': tmpDir, '--debug': false, '--verbose': 0, '--safe': false })

    expect(process.env.PATH.endsWith('/tmp/bin:/Library/TeX/texbin')).to.equal(true)
  })
})
