import Slugger from '../../../src/muya/lib/parser/marked/slugger'

describe('muya slugger', () => {
  it('generates unique slugs and increments duplicates', () => {
    const s = new Slugger()
    const a = s.slug('Hello World')
    const b = s.slug('Hello World')
    expect(a).to.equal('hello-world')
    expect(b).to.equal('hello-world-1')
  })

  it('respects downcode flag', () => {
    const s = new Slugger()
    s.downcodeUnicode = false
    expect(s.slug('Äpfel')).to.equal('äpfel')
  })
})
