import { dark, graphite, materialDark, oneDark, ulysses } from '../../../src/renderer/util/themeColor'

describe('util themeColor', () => {
  it('returns concatenated theme css strings', () => {
    expect(dark()).to.be.a('string')
    expect(materialDark()).to.include('\n')
  })

  it('provides individual theme css blocks', () => {
    expect(graphite()).to.be.a('string')
    expect(oneDark()).to.be.a('string')
    expect(ulysses()).to.be.a('string')
  })
})
