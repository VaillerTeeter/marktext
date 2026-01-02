import RendererPaths from '../../../src/renderer/node/paths'

describe('renderer node paths', () => {
  const originalRipgrep = process.env.MARKTEXT_RIPGREP_PATH

  afterEach(() => {
    process.env.MARKTEXT_RIPGREP_PATH = originalRipgrep
  })

  it('throws when user data path is missing', () => {
    expect(() => new RendererPaths()).to.throw()
  })

  it('prefers MARKTEXT_RIPGREP_PATH when provided', () => {
    process.env.MARKTEXT_RIPGREP_PATH = '/custom/rg'
    const paths = new RendererPaths('/tmp/mt-renderer-paths')
    expect(paths.ripgrepBinaryPath).to.equal('/custom/rg')
  })

  it('falls back to unpacked ripgrep binary', () => {
    process.env.MARKTEXT_RIPGREP_PATH = ''
    const paths = new RendererPaths('/tmp/mt-renderer-paths')
    expect(typeof paths.ripgrepBinaryPath).to.equal('string')
    expect(paths.ripgrepBinaryPath.length).to.be.greaterThan(0)
  })
})
