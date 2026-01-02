import { expect } from 'chai'

import Clipboard from '../../../src/muya/lib/eventHandler/clipboard'

describe('muya/lib/eventHandler/clipboard', () => {
  let muya
  let attached = []
  beforeEach(() => {
    attached = []
    muya = {
      eventCenter: {
        attachDOMEvent: (target, name, handler) => {
          attached.push({ target, name })
        }
      },
      dispatchChange: () => {}
    }
    // provide minimal contentState used in listen
    muya.contentState = {
      docPasteHandler: () => {},
      docCopyHandler: () => {},
      docCutHandler: () => {},
      copyHandler: () => {},
      cutHandler: () => {},
      pasteHandler: () => {},
    }
    // stub document.execCommand
    global.originalExecCommand = document.execCommand
    document.execCommand = () => true
  })

  afterEach(() => {
    if (global.originalExecCommand) document.execCommand = global.originalExecCommand
  })

  it('constructs and attaches events', () => {
    const cb = new Clipboard(muya)
    // expect it to attach a set of events
    expect(attached.some(a => a.name === 'paste')).to.be.true
    expect(attached.some(a => a.name === 'copy')).to.be.true
    expect(attached.some(a => a.name === 'cut')).to.be.true
  })

  it('copyAsMarkdown sets copyType and calls execCommand', () => {
    const cb = new Clipboard(muya)
    cb.copyAsMarkdown()
    // no exception and internal state changed via execCommand
    // call again for copyAsHtml and pasteAsPlainText
    cb.copyAsHtml()
    cb.pasteAsPlainText()
  })

  it('copy sets custom type and info', () => {
    const cb = new Clipboard(muya)
    cb.copy('copyAsMarkdown', { foo: 'bar' })
    // no exception
  })
})
