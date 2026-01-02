import path from 'path'
import EnvPaths from '../../../src/common/envPaths'

describe('common envPaths', () => {
  it('throws when userDataPath is missing', () => {
    expect(() => new EnvPaths('')).to.throw()
  })

  it('exposes resolved paths based on userDataPath', () => {
    const base = path.join('/', 'tmp', 'marktext-user-data')
    const envPaths = new EnvPaths(base)
    expect(envPaths.userDataPath).to.equal(base)
    expect(envPaths.electronUserDataPath).to.equal(base)
    expect(envPaths.preferencesPath).to.equal(base)
    expect(envPaths.preferencesFilePath).to.equal(path.join(base, 'preference.json'))
    const currentYearMonth = `${new Date().getFullYear()}${new Date().getMonth() + 1}`
    expect(envPaths.logPath.endsWith(path.join('logs', currentYearMonth))).to.equal(true)
    expect(envPaths.dataCenterPath).to.equal(base)
  })
})
