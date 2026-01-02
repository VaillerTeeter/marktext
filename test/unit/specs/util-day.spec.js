import dayjs from '../../../src/renderer/util/day'

describe('util day', () => {
  it('formats relative time after extending plugin', () => {
    const past = dayjs().subtract(2, 'hour')
    expect(past.fromNow()).to.be.a('string')
  })

  it('supports locale independent parsing', () => {
    const formatted = dayjs('2020-01-02').format('YYYY-MM-DD')
    expect(formatted).to.equal('2020-01-02')
  })
})
