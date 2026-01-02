import fs from 'fs'
import os from 'os'
import path from 'path'
import EnvPaths from '../../../src/common/envPaths'

describe('common envPaths extra', () => {
  it('throws when userDataPath is missing', () => {
    expect(() => new EnvPaths()).to.throw()
  })

  it('derives expected paths', () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-envpaths-'))
    const now = new Date()
    const paths = new EnvPaths(base)
    expect(paths.userDataPath).to.equal(base)
    expect(paths.electronUserDataPath).to.equal(base)
    expect(paths.preferencesPath).to.equal(base)
    expect(paths.preferencesFilePath).to.equal(path.join(base, 'preference.json'))
    expect(paths.logPath.endsWith(path.join('logs', `${now.getFullYear()}${now.getMonth() + 1}`))).to.equal(true)
    fs.rmSync(base, { recursive: true, force: true })
  })
})
