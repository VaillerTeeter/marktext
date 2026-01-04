import pandoc from '../../../src/main/utils/pandoc'

describe('main utils pandoc command invocation', () => {
  const originalEnv = process.env.MARKTEXT_PANDOC

  afterEach(() => {
    process.env.MARKTEXT_PANDOC = originalEnv
  })

  it('prefers MARKTEXT_PANDOC and builds argv correctly', async function() {
    // Skip on Windows where /bin/echo doesn't exist
    if (process.platform === 'win32') {
      this.skip()
      return
    }
    
    process.env.MARKTEXT_PANDOC = '/bin/echo'
    const convert = pandoc('markdown', 'html', '--hello')
    const output = await convert()
    expect(output.includes('-s')).to.equal(true)
    expect(output.includes('markdown')).to.equal(true)
    expect(output.includes('-t')).to.equal(true)
    expect(output.includes('--hello')).to.equal(true)
  })
})
