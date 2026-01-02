import { WHITELIST_ATTRIBUTES, getAttributes, parseSrcAndTitle, lowerPriority, validateEmphasize } from '../../../src/muya/lib/parser/utils'

describe('muya parser utils', () => {
  it('parses whitelisted attributes with sanitization', () => {
    const html = '<img src="img.png" width="20" height="-5" onclick="alert(1)" data-align="center" />'
    const attrs = getAttributes(html)
    expect(attrs).to.deep.equal({
      title: '',
      src: 'img.png',
      alt: '',
      width: 20,
      height: '',
      'data-align': 'center'
    })
  })

  it('parses src and optional title tokens', () => {
    expect(parseSrcAndTitle('foo.png "title"')).to.deep.equal({ src: 'foo.png', title: 'title' })
    expect(parseSrcAndTitle('foo.png')).to.deep.equal({ src: 'foo.png', title: '' })
  })

  it('validates emphasis markers with surrounding context', () => {
    const src = '*em*'
    const rules = {}
    expect(validateEmphasize(src, src.length, '*', '', rules)).to.equal(true)
    expect(validateEmphasize('* bad*', 6, '*', '', rules)).to.equal(false)
  })

  it('lowerPriority rejects overlaps', () => {
    const rules = {
      strong: /\*\*/
    }
    expect(lowerPriority('**bold**', 1, rules)).to.equal(false)
    expect(lowerPriority('**bold**', 6, rules)).to.equal(true)
  })

  it('exposes whitelist attributes constant', () => {
    expect(WHITELIST_ATTRIBUTES).to.include('href')
  })
})
