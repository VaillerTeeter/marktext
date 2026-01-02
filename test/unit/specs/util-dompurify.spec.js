import { sanitize, PREVIEW_DOMPURIFY_CONFIG, EXPORT_DOMPURIFY_CONFIG } from '../../../src/renderer/util/dompurify'

describe('util dompurify', () => {
  it('strips forbidden attributes in preview config', () => {
    const input = '<div style="color:red" contenteditable="true">x</div>'
    const output = sanitize(input, PREVIEW_DOMPURIFY_CONFIG)
    expect(output.includes('style')).to.equal(false)
    expect(output.includes('contenteditable')).to.equal(false)
  })

  it('allows export-specific attributes', () => {
    const input = '<p data-align="center">text</p>'
    const output = sanitize(input, EXPORT_DOMPURIFY_CONFIG)
    expect(output.includes('data-align')).to.equal(true)
  })
})
