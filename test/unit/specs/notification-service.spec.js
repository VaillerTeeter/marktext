import notification from '../../../src/renderer/services/notification'

describe('notification service', () => {
  afterEach(() => {
    notification.clear()
  })

  it('calls remove for cached notices on clear', () => {
    const spyA = () => { spyA.called = (spyA.called || 0) + 1 }
    const spyB = () => { spyB.called = (spyB.called || 0) + 1 }
    notification.noticeCache = {
      a: { remove: spyA },
      b: { remove: spyB }
    }

    notification.clear()

    expect(spyA.called).to.equal(1)
    expect(spyB.called).to.equal(1)
  })

  it('resolves notification promise when clicked', async () => {
    const promise = notification.notify({ title: 't', message: 'm', time: 20 })
    await new Promise(resolve => setTimeout(resolve, 5))

    const notice = document.querySelector('.mt-notification')
    expect(notice).to.exist
    notice.dispatchEvent(new Event('click', { bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 200))
    await promise
    expect(document.querySelector('.mt-notification')).to.equal(null)
  })

  it('confirm mode resolves when confirm area clicked', async () => {
    const p = notification.notify({ title: 't', message: 'm', time: 1000, showConfirm: true })
    await new Promise(r => setTimeout(r, 10))
    const confirm = document.querySelector('.mt-notification .confirm')
    expect(confirm).to.exist
    confirm.dispatchEvent(new Event('click', { bubbles: true }))
    await new Promise(r => setTimeout(r, 120))
    await p
    expect(document.querySelector('.mt-notification')).to.equal(null)
  })
})
