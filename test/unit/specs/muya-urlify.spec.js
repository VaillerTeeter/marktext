import { downcode, slugify } from '../../../src/muya/lib/parser/marked/urlify'

describe('muya urlify utilities', () => {
  it('downcodes accented characters', () => {
    const result = downcode('Äpfel & Öl')
    expect(result).to.equal('Apfel and Ol')
  })

  it('slugifies strings with punctuation and whitespace', () => {
    const slug = slugify('Hello, World! 2025')
    expect(slug).to.equal('hello-world-2025')
  })

  it('handles non-latin characters', () => {
    const slug = slugify('Привет Мир')
    expect(slug).to.equal('privet-mir')
  })
})
