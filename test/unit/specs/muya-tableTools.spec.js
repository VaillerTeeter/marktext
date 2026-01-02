import { expect } from 'chai'
import TableBarTools from '../../../src/muya/lib/ui/tableTools'
import { toolList } from '../../../src/muya/lib/ui/tableTools/config'
import EventCenter from '../../../src/muya/lib/eventHandler/event'

const createSpy = () => {
  const fn = (...args) => {
    fn.called = true
    fn.callCount += 1
    fn.args = args
  }
  fn.called = false
  fn.callCount = 0
  return fn
}

const createMuya = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const eventCenter = new EventCenter()
  const editTable = createSpy()
  const contentState = { editTable }
  return { muya: { container, eventCenter, contentState }, spies: { editTable } }
}

describe('muya tableTools', () => {
  const floats = []
  afterEach(() => {
    while (floats.length) {
      const float = floats.pop()
      if (float.destroy) float.destroy()
    }
    document.body.innerHTML = ''
  })

  it('shows, renders tools, and executes editTable', () => {
    const { muya, spies } = createMuya()
    const tools = new TableBarTools(muya, { showArrow: false })
    floats.push(tools)

    const reference = document.createElement('div')
    document.body.appendChild(reference)

    tools.hide = createSpy()

    muya.eventCenter.dispatch('muya-table-bar', {
      reference,
      tableInfo: { barType: 'left' }
    })

    // First render (oldVnode null)
    let root = tools.oldVnode.elm
    const items = root.querySelectorAll('li.item')
    expect(items.length).to.equal(3)
    expect(items[0].dataset.label).to.equal('insert')

    // Second render to exercise patching old vnode path
    tools.render()
    root = tools.oldVnode.elm

    // Call handler directly to ensure editTable receives the item payload
    const targetItem = toolList.left[1]
    tools.selectItem(new window.MouseEvent('click', { bubbles: true }), targetItem)
    expect(spies.editTable.callCount).to.equal(1)
    expect(spies.editTable.args[0].location).to.equal('next')
    expect(tools.hide.callCount).to.equal(1)
  })

  it('hides when event reference is missing', () => {
    const { muya } = createMuya()
    const tools = new TableBarTools(muya, { showArrow: false })
    floats.push(tools)
    tools.hide = createSpy()

    muya.eventCenter.dispatch('muya-table-bar', { reference: null })
    expect(tools.hide.callCount).to.equal(1)
  })
})
