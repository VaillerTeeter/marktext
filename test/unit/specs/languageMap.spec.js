import { expect } from 'chai'
import { getLanguageName } from '../../../src/renderer/spellchecker/languageMap'

describe('spellchecker languageMap', () => {
  it('returns null for invalid codes', () => {
    expect(getLanguageName(null)).to.equal(null)
    expect(getLanguageName('')).to.equal(null)
    expect(getLanguageName('x')).to.equal(null)
  })

  it('returns hunspell label for 5-char code present in map', () => {
    const res = getLanguageName('en-US')
    expect(res).to.be.a('string')
    expect(res).to.include('en-US')
  })

  it('returns Unknown for unknown but valid 2-char code', () => {
    const res = getLanguageName('zz')
    expect(res).to.match(/Unknown \(zz\)/)
  })
})
