import notification from '../../../src/renderer/services/notification'

describe('renderer services notification', () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

  beforeEach(async () => {
    notification.clear()
    await wait(200)
    document.querySelectorAll('.mt-notification').forEach(node => node.remove())
    notification.noticeCache = {}
  })

  it('creates and clears notifications', async () => {
    const result = notification.notify({ title: 'Hello', message: 'World', type: 'info' })
    const container = document.querySelector('.mt-notification')
    expect(container).to.exist
    // simulate click to resolve
    container.querySelector('.content').click()
    await result
    await wait(150)
    expect(document.querySelectorAll('.mt-notification').length).to.equal(0)

    // show confirm and reject
    const rej = notification.notify({ title: 'Confirm', message: 'Click', type: 'primary', showConfirm: true })
    const confirmBtn = document.querySelector('.mt-notification .confirm')
    expect(confirmBtn).to.exist
    confirmBtn.click()
    await rej
    await wait(150)
    expect(document.querySelectorAll('.mt-notification').length).to.equal(0)

    // clear cache safety
    notification.clear()
    await wait(400)
    expect(document.querySelectorAll('.mt-notification').length).to.equal(0)
    expect(Object.keys(notification.noticeCache).length).to.equal(0)
  })

  afterEach(async () => {
    notification.clear()
    await wait(200)
    document.querySelectorAll('.mt-notification').forEach(node => node.remove())
    notification.noticeCache = {}
  })
})
