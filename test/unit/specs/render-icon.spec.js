import renderIcon from '../../../src/muya/lib/parser/render/renderBlock/renderIcon'

describe('renderIcon', () => {
  let originalWarn
  let originalError
  let warnings

  beforeEach(() => {
    warnings = []
    originalWarn = console.warn
    originalError = console.error
    console.warn = (...args) => { warnings.push(args) }
    console.error = () => {}
  })

  afterEach(() => {
    console.warn = originalWarn
    console.error = originalError
  })

  it('renders paragraph icon by default', () => {
    const vnode = renderIcon({ type: 'p' })

    expect(vnode.sel).to.equal('a.ag-front-icon')
    const iconStyle = vnode.children[0].children[0].data.style
    expect(iconStyle.background).to.be.a('string')
    expect(iconStyle['background-size']).to.equal('100%')
    expect(warnings.length).to.equal(0)
  })

  it('warns and falls back when function type is unknown', () => {
    const vnode = renderIcon({ type: 'figure', functionType: 'unknown' })

    expect(warnings.length).to.equal(1)
    const iconStyle = vnode.children[0].children[0].data.style
    expect(iconStyle.background).to.be.a('string')
    expect(vnode.sel).to.equal('a.ag-front-icon')
  })

  it('uses todo list icon for task list', () => {
    const vnode = renderIcon({ type: 'ul', listType: 'task' })

    const iconStyle = vnode.children[0].children[0].data.style
    expect(iconStyle.background).to.be.a('string')
    expect(warnings.length).to.equal(0)
  })
})
