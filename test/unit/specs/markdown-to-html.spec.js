import markdownToHtml from '../../../src/renderer/util/markdownToHtml'
import ExportHtml from 'muya/lib/utils/exportHtml'

describe('renderer util markdownToHtml', () => {
  it('wraps exported HTML in article container', async () => {
    const original = ExportHtml.prototype.renderHtml
    ExportHtml.prototype.renderHtml = async () => '<p>hello</p>'

    try {
      const html = await markdownToHtml('# hi')
      expect(html).to.equal('<article class="markdown-body"><p>hello</p></article>')
    } finally {
      ExportHtml.prototype.renderHtml = original
    }
  })
})
