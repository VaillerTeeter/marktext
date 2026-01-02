import { getUniqueId, getRecommendTitleFromMarkdownString, hasSameKeys, getLogLevel } from '../../../src/main/utils'
const electronId = require.resolve('electron')

describe('main utils index', () => {
  it('generates unique ids with prefix', () => {
    const id1 = getUniqueId()
    const id2 = getUniqueId()
    expect(id1.startsWith('mt-')).to.equal(true)
    expect(id2.startsWith('mt-')).to.equal(true)
    expect(id1).to.not.equal(id2)
  })

  it('extracts recommended title from markdown headers', () => {
    const markdown = '# First\n## Second\nPlain text'
    expect(getRecommendTitleFromMarkdownString(markdown)).to.equal('First')
    expect(getRecommendTitleFromMarkdownString('no headers here')).to.equal('')
  })

  it('compares object keys', () => {
    expect(hasSameKeys({ a: 1, b: 2 }, { b: 3, a: 4 })).to.equal(true)
    expect(hasSameKeys({ a: 1 }, { a: 1, b: 2 })).to.equal(false)
  })

  it('derives log level from debug flag', () => {
    const originalVerbose = global.MARKTEXT_DEBUG_VERBOSE
    delete global.MARKTEXT_DEBUG_VERBOSE
    const base = getLogLevel()
    expect(['info', 'debug']).to.include(base)

    global.MARKTEXT_DEBUG_VERBOSE = 1
    expect(getLogLevel()).to.equal('verbose')

    global.MARKTEXT_DEBUG_VERBOSE = 2
    expect(getLogLevel()).to.equal('debug')

    global.MARKTEXT_DEBUG_VERBOSE = 3
    expect(getLogLevel()).to.equal('silly')

    global.MARKTEXT_DEBUG_VERBOSE = originalVerbose
  })

  it('uses debug level in development when verbose is unset', () => {
    const originalVerbose = global.MARKTEXT_DEBUG_VERBOSE
    const envKey = 'NODE_ENV'
    const originalEnv = process.env[envKey]
    delete global.MARKTEXT_DEBUG_VERBOSE
    process.env[envKey] = 'development'

    expect(getLogLevel()).to.equal('debug')

    global.MARKTEXT_DEBUG_VERBOSE = originalVerbose
    process.env[envKey] = originalEnv
  })

  it('throws when requesting userData path through getPath', () => {
    const originalApp = require.cache[electronId]
    require.cache[electronId] = { exports: { app: { getPath: () => '' } } }
    delete require.cache[require.resolve('../../../src/main/utils')]
    const { getPath } = require('../../../src/main/utils')
    expect(() => getPath('userData')).to.throw()
    if (originalApp) {
      require.cache[electronId] = originalApp
    } else {
      delete require.cache[electronId]
    }
  })

  it('returns app paths for non-user data', () => {
    const originalApp = require.cache[electronId]
    const fakeApp = { getPath: name => `/${name}` }
    require.cache[electronId] = { exports: { app: fakeApp } }
    delete require.cache[require.resolve('../../../src/main/utils')]
    const { getPath } = require('../../../src/main/utils')
    expect(getPath('home')).to.equal('/home')
    if (originalApp) {
      require.cache[electronId] = originalApp
    } else {
      delete require.cache[electronId]
    }
  })

  it('uses explicit verbose override', () => {
    const originalVerbose = global.MARKTEXT_DEBUG_VERBOSE
    global.MARKTEXT_DEBUG_VERBOSE = 2
    expect(getLogLevel()).to.equal('debug')
    global.MARKTEXT_DEBUG_VERBOSE = originalVerbose
  })
})
