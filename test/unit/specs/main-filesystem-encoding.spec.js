import ced from 'ced'
import { guessEncoding, __setEncodingDetector } from '../../../src/main/filesystem/encoding'

describe('main filesystem encoding', () => {
  it('detects utf8 bom', () => {
    const buffer = Buffer.from([0xEF, 0xBB, 0xBF, 0x41])
    const result = guessEncoding(buffer, false)
    expect(result).to.deep.equal({ encoding: 'utf8', isBom: true })
  })

  it('defaults to utf8 when no bom and auto guess disabled', () => {
    const buffer = Buffer.from('plain text')
    const result = guessEncoding(buffer, false)
    expect(result).to.deep.equal({ encoding: 'utf8', isBom: false })
  })

  it('guesses mapped encoding with auto detection and short buffer', () => {
    __setEncodingDetector(() => 'ASCII-7-bit')

    const result = guessEncoding(Buffer.from([0x01]), true)
    expect(result).to.deep.equal({ encoding: 'utf8', isBom: false })
  })

  it('normalizes unmapped detected encodings', () => {
    __setEncodingDetector(() => 'UTF-32')

    const result = guessEncoding(Buffer.from('data'), true)
    expect(result).to.deep.equal({ encoding: 'utf32', isBom: false })
  })

  afterEach(() => {
    __setEncodingDetector(ced)
  })
})
