import renderCopyButton from '../../../src/muya/lib/parser/render/renderBlock/renderCopyButton'

describe('renderCopyButton', () => {
  it('creates a copy button vnode with icon style', () => {
    const vnode = renderCopyButton()

    expect(vnode.sel).to.equal('a.ag-code-copy')
    expect(vnode.data.attrs).to.deep.equal({ title: 'Copy content', contenteditable: 'false' })

    const iconVnode = vnode.children[0]
    const inner = iconVnode.children[0]
    expect(inner.data.style.background).to.be.a('string')
    expect(inner.data.style['background-size']).to.equal('100%')
  })
})
