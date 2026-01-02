import os from 'os'
import path from 'path'
import { rgPath } from 'vscode-ripgrep'
import RendererPaths from '../../../src/renderer/node/paths'

describe('renderer paths', () => {
  const originalRipgrepEnv = process.env.MARKTEXT_RIPGREP_PATH

  afterEach(() => {
    process.env.MARKTEXT_RIPGREP_PATH = originalRipgrepEnv
  })

  it('throws when user data path is missing', () => {
    expect(() => new RendererPaths('')).to.throw('No user data path is given.')
  })

  it('uses override ripgrep binary when env is set', () => {
    const tmpPath = path.join(os.tmpdir(), 'mt-user-data')
    process.env.MARKTEXT_RIPGREP_PATH = '/custom/rg'
    const paths = new RendererPaths(tmpPath)
    expect(paths.ripgrepBinaryPath).to.equal('/custom/rg')
  })

  it('falls back to unpacked ripgrep binary', () => {
    const tmpPath = path.join(os.tmpdir(), 'mt-user-data')
    delete process.env.MARKTEXT_RIPGREP_PATH
    const paths = new RendererPaths(tmpPath)
    const expected = rgPath.replace(/\bapp\.asar\b/, 'app.asar.unpacked')
    expect(paths.ripgrepBinaryPath).to.equal(expected)
  })
})
