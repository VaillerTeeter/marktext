import { applyGlobalStaticPath } from '../../../src/main/globalSetting'

describe('main globalSetting', () => {
  const originalStatic = global.__static
  const originalEnv = process.env

  afterEach(() => {
    if (originalStatic === undefined) {
      delete global.__static
    } else {
      global.__static = originalStatic
    }
    process.env = originalEnv
  })

  it('sets __static when not in development', () => {
    delete global.__static

    applyGlobalStaticPath('production')

    expect(typeof global.__static).to.equal('string')
    expect(global.__static.length > 0).to.equal(true)
  })

  it('does not set __static during development build', () => {
    delete global.__static

    applyGlobalStaticPath('development')

    expect(global.__static).to.equal(undefined)
  })

  it('leaves pre-set __static untouched', () => {
    global.__static = '/tmp/static'

    applyGlobalStaticPath('production')

    expect(global.__static).to.equal('/tmp/static')
  })
})
