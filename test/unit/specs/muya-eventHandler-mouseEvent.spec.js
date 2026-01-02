import { expect } from 'chai'
import MouseEvent from '../../../src/muya/lib/eventHandler/mouseEvent'

const createSpy = () => {
  const fn = (...args) => {
    fn.called = true
    fn.callCount += 1
    fn.args.push(args)
  }
  fn.called = false
  fn.callCount = 0
  fn.args = []
  return fn
}

describe('muya eventHandler mouseEvent', () => {
  it('mouseover triggers link tools when hovering inline link with hidden preSibling', () => {
    const handlers = { mouseover: [], mouseout: [], mousedown: [] }
    const dispatch = createSpy()
    const eventCenter = {
      attachDOMEvent: (container, name, handler) => { handlers[name].push(handler) },
      dispatch
    }

    const container = document.createElement('div')
    // setup structure: <p.ag-paragraph id="p1"> <span.ag-hide> ... </span> <a.ag-inline-rule data-raw data-start data-end> <span target> </span> </a> </p>
    const p = document.createElement('p')
    p.classList.add('ag-paragraph')
    p.id = 'p1'
    const preSibling = document.createElement('span')
    preSibling.classList.add('ag-hide')
    const link = document.createElement('a')
    link.classList.add('ag-inline-rule')
    // ensure getLinkInfo tokenizer receives a string
    link.setAttribute('data-raw', '[text](http://example)')
    link.setAttribute('data-start', '0')
    link.setAttribute('data-end', '1')
    const target = document.createElement('span')
    link.appendChild(target)
    p.appendChild(preSibling)
    p.appendChild(link)
    container.appendChild(p)

    const muya = { container, eventCenter, options: { hideLinkPopup: false, footnote: false }, contentState: {} }

    const me = new MouseEvent(muya)

    // call mouseover handler
    handlers.mouseover[0]({ target })

    expect(dispatch.called).to.equal(true)
    expect(dispatch.args[0][0]).to.equal('muya-link-tools')
    expect(dispatch.args[0][1]).to.have.property('reference')
  })

  it('mouseover triggers footnote tool when hovering sup with hidden preSibling and mouseout clears', () => {
    const handlers = { mouseover: [], mouseout: [], mousedown: [] }
    const dispatch = createSpy()
    const eventCenter = {
      attachDOMEvent: (container, name, handler) => { handlers[name].push(handler) },
      dispatch
    }

    const container = document.createElement('div')
    const sup = document.createElement('sup')
    sup.classList.add('ag-inline-footnote-identifier')
    // preSibling must be previousElementSibling of the target inside the sup
    const preSibling = document.createElement('span')
    preSibling.classList.add('ag-hide')
    const target = document.createElement('span')
    target.textContent = '1'
    sup.appendChild(preSibling)
    sup.appendChild(target)
    container.appendChild(sup)

    const muya = { container, eventCenter, options: { hideLinkPopup: true, footnote: true }, contentState: { blocks: [] } }

    const me = new MouseEvent(muya)

    handlers.mouseover[0]({ target })
    expect(dispatch.called).to.equal(true)
    expect(dispatch.args[0][0]).to.equal('muya-footnote-tool')
    expect(dispatch.args[0][1]).to.have.property('identifier', '1')

    // reset spy
    dispatch.called = false
    dispatch.callCount = 0
    dispatch.args = []

    // mouseout should clear
    handlers.mouseout[0]({ target })
    expect(dispatch.called).to.equal(true)
    expect(dispatch.args[0][0]).to.equal('muya-footnote-tool')
    expect(dispatch.args[0][1]).to.have.property('reference', null)
  })

  it('mousedown delegates to contentState handlers for drag and table cell', () => {
    const handlers = { mouseover: [], mouseout: [], mousedown: [] }
    const eventCenter = {
      attachDOMEvent: (container, name, handler) => { handlers[name].push(handler) },
      dispatch: () => {}
    }

    const container = document.createElement('div')
    const handleMouseDown = createSpy()
    const handleCellMouseDown = createSpy()

    const muya = { container, eventCenter, options: {}, contentState: { handleMouseDown, handleCellMouseDown } }

    const me = new MouseEvent(muya)

    // drag handler case
    const dragTarget = document.createElement('div')
    dragTarget.classList.add('ag-drag-handler')
    handlers.mousedown[0]({ target: dragTarget })
    expect(handleMouseDown.called).to.equal(true)

    // table cell case: element inside a <tr>
    const tr = document.createElement('tr')
    const cellChild = document.createElement('span')
    tr.appendChild(cellChild)
    handlers.mousedown[0]({ target: cellChild })
    expect(handleCellMouseDown.called).to.equal(true)
  })
})
