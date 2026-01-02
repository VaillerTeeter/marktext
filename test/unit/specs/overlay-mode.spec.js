import overlayMode from '../../../src/renderer/codeMirror/overlayMode'

describe('CodeMirror overlayMode', () => {
  const CodeMirror = {
    startState: mode => (mode && mode.state ? { ...mode.state } : {}),
    copyState: (mode, state) => ({ ...(state || {}), copied: mode && mode.copyFlag }),
    overlayMode: null
  }

  const newStream = () => ({ start: 0, pos: 0 })

  it('returns base token when overlay yields null', () => {
    const base = { token: stream => { stream.pos = stream.start + 1; return 'base' }, state: {} }
    const overlay = { token: () => null, state: {} }
    overlayMode(CodeMirror)
    const mixed = CodeMirror.overlayMode(base, overlay)
    const state = mixed.startState()
    const token = mixed.token(newStream(), state)
    expect(token).to.equal('base')
  })

  it('returns overlay token when provided', () => {
    const base = { token: stream => { stream.pos = stream.start + 1; return 'base' }, state: {} }
    const overlay = { token: stream => { stream.pos = stream.start + 1; return 'overlay' }, state: {} }
    overlayMode(CodeMirror)
    const mixed = CodeMirror.overlayMode(base, overlay)
    const state = mixed.startState()
    const token = mixed.token(newStream(), state)
    expect(token).to.equal('overlay')
  })

  it('combines tokens when overlay requests combination', () => {
    const base = { token: stream => { stream.pos = stream.start + 1; return 'base' }, state: {} }
    const overlay = {
      token: stream => { stream.pos = stream.start + 1; return 'overlay' },
      state: { combineTokens: true }
    }
    overlayMode(CodeMirror)
    const mixed = CodeMirror.overlayMode(base, overlay)
    const state = mixed.startState()
    const token = mixed.token(newStream(), state)
    expect(token).to.equal('base overlay')
  })
})
