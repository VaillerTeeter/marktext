import {
  getUniqueId,
  escape,
  unescape,
  edit,
  cleanUrl,
  splitCells,
  rtrim,
  findClosingBracket
} from '../../../src/muya/lib/parser/marked/utils'

describe('muya marked utils', () => {
  it('escapes and unescapes html entities', () => {
    const raw = '<div>"&"</div>'
    const escaped = escape(raw, true)
    expect(escaped).to.equal('&lt;div&gt;&quot;&amp;&quot;&lt;/div&gt;')
    expect(unescape('&#58; &#x3a; &colon;')).to.equal(': : :')
  })

  it('builds regex with edit helper', () => {
    const rule = edit(/foo/).replace('foo', 'bar').getRegex()
    expect(rule.test('xxbarxx')).to.equal(true)
  })

  it('cleans urls and blocks unsafe protocols', () => {
    expect(cleanUrl(true, null, 'javascript:alert(1)')).to.equal(null)
    expect(cleanUrl(true, 'https://example.com/a/', '../img.png')).to.equal('https://example.com/a/../img.png')
  })

  it('splits table cells while unescaping pipes', () => {
    const cells = splitCells('a|b\\|c|d', 4)
    expect(cells).to.deep.equal(['a', 'b|c', 'd', ''])
  })

  it('rtrim handles invert flag and empty strings', () => {
    expect(rtrim('abccc', 'c')).to.equal('ab')
    expect(rtrim('aaab', 'a', true)).to.equal('aaa')
    expect(rtrim('', 'x')).to.equal('')
  })

  it('finds closing bracket respecting escapes', () => {
    expect(findClosingBracket('a [link](test)', ['[', ']'])).to.equal(-1)
    expect(findClosingBracket('text [unclosed', ['[', ']'])).to.equal(-1)
  })

  it('generates incremental unique ids', () => {
    const id1 = getUniqueId()
    const id2 = getUniqueId()
    expect(id2).to.equal(id1 + 1)
  })
})
