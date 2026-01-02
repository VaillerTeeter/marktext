import { expect } from 'chai'
import FormatPicker from '../../../src/muya/lib/ui/formatPicker'
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

const createMuya = (formats = []) => {
  const eventCenter = new EventCenter()
  const container = document.createElement('div')
  document.body.appendChild(container)
  const render = createSpy()
  const format = createSpy()
  const selectionFormats = createSpy()
  selectionFormats.args = formats
  selectionFormats.returns = formats
  selectionFormats.returnValue = { formats }
  const contentState = {
    render,
    format,
    selectionFormats: () => selectionFormats.returnValue
  }
  return { muya: { eventCenter, container, contentState }, spies: { render, format, selectionFormats } }
}

describe('muya formatPicker', () => {
  it('renders active icons when formats are present', () => {
    const { muya } = createMuya([{ type: 'strong' }])
    const picker = new FormatPicker(muya)
    picker.formats = [{ type: 'strong' }]
    picker.render()

    const root = picker.oldVnode.elm
    const active = root.querySelector('li.item.strong')
    expect(active).to.not.equal(null)
    expect(active.classList.contains('active')).to.equal(true)
  })

  it('formats selection and re-renders for non-link items', () => {
    const { muya, spies } = createMuya([{ type: 'em' }])
    const picker = new FormatPicker(muya)
    picker.formats = [{ type: 'em' }]
    picker.render()

    const root = picker.oldVnode.elm
    const emItem = root.querySelector('li.item.em')
    expect(emItem).to.not.equal(null)
    emItem.dispatchEvent(new Event('click', { bubbles: true }))
    expect(spies.render.callCount).to.equal(1)
    expect(spies.format.callCount).to.equal(1)
    expect(picker.formats.some(f => f.type === 'em')).to.equal(true)
  })

  it('hides after selecting link/image item', () => {
    const { muya } = createMuya([])
    const picker = new FormatPicker(muya)
    picker.formats = []
    picker.render()

    picker.hide = createSpy()

    const root = picker.oldVnode.elm
    const linkItem = root.querySelector('li.item.link')
    expect(linkItem).to.not.equal(null)
    linkItem.dispatchEvent(new Event('click', { bubbles: true }))
    expect(picker.hide.callCount).to.equal(1)
  })
})
