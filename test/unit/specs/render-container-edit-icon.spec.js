import { renderEditIcon } from '../../../src/muya/lib/parser/render/renderBlock/renderContainerEditIcon'

describe('renderContainerEditIcon', () => {
  it('renders edit icon anchor with expected selector', () => {
    const vnode = renderEditIcon()

    expect(vnode.sel).to.equal('a.ag-container-icon')
    expect(vnode.data.attrs).to.deep.equal({ contenteditable: 'false' })

    const iconVnode = vnode.children[0]
    const inner = iconVnode.children[0]
    expect(inner.data.style.background).to.be.a('string')
    expect(inner.data.style['background-size']).to.equal('100%')
  })
})
