import { getCssForOptions, getHtmlToc } from '../../../src/renderer/util/pdf'

describe('util pdf', () => {
  it('builds css with margins, font, theme and header/footer size', () => {
    const css = getCssForOptions({
      type: 'pdf',
      pageMarginTop: 10,
      pageMarginRight: 10,
      pageMarginBottom: 15,
      pageMarginLeft: 5,
      fontFamily: 'Inter',
      fontSize: 14,
      lineHeight: 1.6,
      autoNumberingHeadings: true,
      showFrontMatter: false,
      theme: 'academic',
      headerFooterFontSize: 9
    })
    expect(css).to.include('@media print')
    expect(css).to.include('font-family:"Inter"')
    expect(css).to.include('font-size:14px')
    expect(css).to.include('page-header')
  })

  it('renders html toc with heading links', () => {
    const toc = [{ content: 'Intro', lvl: 1 }, { content: 'Deep', lvl: 2 }]
    const html = getHtmlToc(toc)
    expect(html).to.include('Table of Contents')
    expect(html).to.include('href="#')
    expect(html).to.include('Deep')
  })
})
