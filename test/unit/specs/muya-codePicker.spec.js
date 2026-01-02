import CodePicker from '../../../src/muya/lib/ui/codePicker'
import EventCenter from '../../../src/muya/lib/eventHandler/event'

const createMuya = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return {
    container,
    eventCenter: new EventCenter()
  }
}

describe('muya codePicker', () => {
  const pickers = []

  afterEach(() => {
    while (pickers.length) {
      const picker = pickers.pop()
      picker.destroy()
    }
    document.body.innerHTML = ''
  })

  it('shows picker on event, renders languages, and marks first as active', () => {
    const muya = createMuya()
    const picker = new CodePicker(muya, { showArrow: false })
    pickers.push(picker)

    const reference = document.createElement('div')
    document.body.appendChild(reference)

    let chosen = null
    muya.eventCenter.dispatch('muya-code-picker', {
      reference,
      lang: 'javascript',
      cb: item => { chosen = item }
    })

    expect(picker.status).to.equal(true)
    expect(picker.renderArray.length).to.be.greaterThan(0)
    expect(picker.activeItem).to.equal(picker.renderArray[0])

    const root = picker.oldVnode.elm
    const active = root.querySelector('li.item.active')
    expect(active).to.not.equal(null)
    expect(chosen).to.equal(null)
  })

  it('hides when no matches or missing reference', () => {
    const muya = createMuya()
    const picker = new CodePicker(muya, { showArrow: false })
    pickers.push(picker)

    // missing reference and no matches should hide immediately
    muya.eventCenter.dispatch('muya-code-picker', {
      reference: null,
      lang: 'not-a-lang',
      cb: () => {}
    })
    expect(picker.status).to.equal(false)
  })

  it('renders items with fallbacks, handles clicks, and exposes item elements', () => {
    const muya = createMuya()
    const picker = new CodePicker(muya, { showArrow: false })
    pickers.push(picker)

    const markdown = { name: 'markdown' }
    const unknown = { name: 'mystery-lang' }
    picker.renderArray = [markdown, unknown]
    picker.activeItem = unknown
    picker.render()

    const root = picker.oldVnode.elm
    const items = root.querySelectorAll('li.item')
    expect(items.length).to.equal(2)
    expect(items[1].classList.contains('active')).to.equal(true)

    let clicked = null
    picker.selectItem = item => { clicked = item }
    items[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(clicked).to.equal(markdown)

    // fallback icon class for unknown languages
    const fallbackIcon = items[1].querySelector('.atom-icon.light-cyan')
    expect(fallbackIcon).to.not.equal(null)

    const found = picker.getItemElement(markdown)
    expect(found.dataset.label).to.equal('markdown')
  })

  it('renders no-result placeholder when empty', () => {
    const muya = createMuya()
    const picker = new CodePicker(muya, { showArrow: false })
    pickers.push(picker)

    picker.renderArray = []
    picker.render()
    const root = picker.oldVnode.elm
    expect(root.textContent).to.contain('No result')
  })
})
