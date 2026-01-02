import { delay } from '../../../src/renderer/util/index'

describe('util delay', () => {
  it('resolves after the given timeout', async () => {
    await delay(0)
  })

  it('supports cancellation', async () => {
    const promise = delay(20)
    promise.cancel()
    let rejected = false
    try {
      await promise
    } catch (_) {
      rejected = true
    }
    expect(rejected).to.equal(true)
  })
})
