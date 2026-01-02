import MarkdownPrint from '../../../src/renderer/services/printService'

describe('renderer services printService', () => {
  it('renders and clears markdown container', () => {
    const printer = new MarkdownPrint()
    printer.renderMarkdown('<h1>Hi</h1>')
    const container = document.querySelector('.print-container')
    expect(container).to.exist
    expect(container.innerHTML).to.include('Hi')
    printer.clearup()
    expect(document.querySelector('.print-container')).to.equal(null)
  })
})
