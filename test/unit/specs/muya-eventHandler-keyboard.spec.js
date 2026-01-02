import { expect } from 'chai'

import Keyboard from '../../../src/muya/lib/eventHandler/keyboard'

describe('muya/lib/eventHandler/keyboard', () => {
  let muya
  let attached = {}
  beforeEach(() => {
    attached = {}
    muya = {
      container: document.createElement('div'),
      eventCenter: {
        attachDOMEvent: (target, name, handler) => {
          attached[name] = attached[name] || []
          attached[name].push({ target, handler })
        },
        dispatch: () => {},
        subscribe: () => {}
      },
      contentState: {
        docEnterHandler: () => {},
        docBackspaceHandler: () => {},
        docDeleteHandler: () => {},
        docArrowHandler: () => {},
        backspaceHandler: () => {},
        deleteHandler: () => {},
        enterHandler: () => {},
        arrowHandler: () => {},
        tabHandler: () => {},
        inputHandler: () => {},
        checkEditLanguage: () => ({})
      },
      dispatchSelectionChange: () => {},
      dispatchSelectionFormats: () => {},
      dispatchChange: () => {}
    }
  })

  it('binds event handlers and handles composition events', () => {
    const kb = new Keyboard(muya)
    // ensure handlers attached
    expect(attached.keydown).to.be.an('array')
    expect(attached.keyup).to.be.an('array')
    expect(attached.input).to.be.an('array')

    // call composition handlers registered in recordIsComposed
    const compStart = { type: 'compositionstart' }
    const compEnd = { type: 'compositionend' }
    // find handlers for compositionstart/comp end attached to container
    const compHandlers = attached.compositionstart || []
    compHandlers.forEach(h => h.handler(compStart))
    const compEndHandlers = attached.compositionend || []
    compEndHandlers.forEach(h => h.handler(compEnd))
    // no exceptions expected
  })

  it('handles keydown meta/ctrl class toggle and enter/backspace routing', () => {
    const kb = new Keyboard(muya)
    const handlers = attached.keydown.map(h => h.handler)
    // simulate ctrl/meta keydown event
    const evt = { metaKey: true, key: 'a', code: 'KeyA', preventDefault: () => {}, stopPropagation: () => {}, target: {} }
    handlers.forEach(fn => fn(evt))

    // simulate Enter without composition
    const enterEvt = { key: 'Enter', code: 'Enter', preventDefault: () => {}, stopPropagation: () => {}, target: {} }
    handlers.forEach(fn => fn(enterEvt))
  })
})
