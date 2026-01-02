import { ENCODING_NAME_MAP, getEncodingName } from '../../../src/common/encoding'

describe('common encoding', () => {
  it('maps known encodings to friendly names', () => {
    const name = getEncodingName({ encoding: 'utf16le', isBom: false })
    expect(name).to.equal(ENCODING_NAME_MAP.utf16le)
  })

  it('appends BOM suffix when requested', () => {
    const name = getEncodingName({ encoding: 'utf8', isBom: true })
    expect(name).to.include('with BOM')
    expect(name).to.include('UTF-8')
  })

  it('falls back to raw encoding name when unknown', () => {
    const name = getEncodingName({ encoding: 'mystery-enc', isBom: false })
    expect(name).to.equal('mystery-enc')
  })
})
