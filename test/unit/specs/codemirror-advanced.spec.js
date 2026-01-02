import { expect } from 'chai'
import multiplexMode from '../../../src/renderer/codeMirror/mltiplexMode'
import overlayMode from '../../../src/renderer/codeMirror/overlayMode'
import loadMore from '../../../src/renderer/codeMirror/loadmode'
import codeMirror, {
  search,
  setCursorAtLastLine,
  isCursorAtFirstLine,
  isCursorAtLastLine,
  isCursorAtBegin,
  onlyHaveOneLine,
  isCursorAtEnd,
  getBeginPosition,
  getEndPosition,
  setCursorAtFirstLine,
  setMode,
  setTextDirection
} from '../../../src/renderer/codeMirror'

const createSpy = returnValue => {
  const spy = (...args) => {
    spy.called = true
    spy.callCount += 1
    spy.calls.push(args)
    return typeof returnValue === 'function' ? returnValue(...args) : returnValue
  }
  spy.called = false
  spy.callCount = 0
  spy.calls = []
  Object.defineProperty(spy, 'calledOnce', { get: () => spy.callCount === 1 })
  spy.calledWith = (...expected) => spy.calls.some(args => args.length === expected.length && args.every((val, idx) => val === expected[idx]))
  return spy
}

const createStream = (text, start = 0) => ({
  string: text,
  start,
  pos: start,
  match (pattern) {
    if (typeof pattern === 'string' && this.string.slice(this.pos, this.pos + pattern.length) === pattern) {
      this.pos += pattern.length
      return true
    }
    if (pattern instanceof RegExp) {
      const match = pattern.exec(this.string.slice(this.pos))
      if (match && match.index === 0) {
        this.pos += match[0].length
        return true
      }
    }
    return false
  },
  sol () {
    return this.pos === 0
  }
})

describe('CodeMirror multiplexMode helper', () => {
  let CodeMirror

  beforeEach(() => {
    CodeMirror = {
      Pass: Symbol('pass'),
      startState: (mode, indent) => ({ modeName: mode && mode.name, indent }),
      copyState: (mode, state) => ({ ...state, copiedFrom: mode && mode.name })
    }
    multiplexMode(CodeMirror)
  })

  it('enters inner mode, yields inner tokens and closes with delimiter styles', () => {
    const outer = {
      name: 'outer',
      token: stream => { stream.pos = stream.string.length; return 'outer' },
      indent: () => 1,
      blankLine: state => { state.outerBlank = true }
    }
    const inner = {
      name: 'inner',
      token: stream => { stream.pos = stream.string.length; return 'inner' },
      indent: () => 2,
      blankLine: state => { state.innerBlank = true }
    }
    const mixed = CodeMirror.multiplexingMode(outer, { open: '[[', close: ']]', mode: inner, delimStyle: 'ds', innerStyle: 'is' })
    const state = mixed.startState()

    const openToken = mixed.token(createStream('[[code]]'), state)
    expect(openToken).to.equal('ds ds-open')
    expect(state.innerActive.mode).to.equal(inner)

    const innerToken = mixed.token(createStream('code]]'), state)
    expect(innerToken).to.equal('inner is')
    expect(state.innerActive).to.not.equal(null)

    const closeToken = mixed.token(createStream(']]'), state)
    expect(closeToken).to.equal('ds ds-close')
    expect(state.innerActive).to.equal(null)
  })

  it('cuts off outer token at earliest delimiter and handles regex openings', () => {
    const outer = {
      name: 'outer',
      token: stream => {
        outer.seenString = stream.string
        stream.pos = stream.string.length
        return 'outer'
      }
    }
    const inner = { name: 'inner', token: stream => { stream.pos = stream.string.length; return 'inner' } }
    const mixed = CodeMirror.multiplexingMode(outer, { open: /\{\{/, close: /\}\}/, mode: inner })
    const state = mixed.startState()
    const tok = mixed.token(createStream('abc {{rest'), state)
    expect(tok).to.equal('outer')
    expect(outer.seenString).to.equal('abc ')
  })

  it('resets when no close, handles parseDelimiters and recurses from sol', () => {
    const outer = { name: 'outer', token: stream => { stream.pos = stream.string.length; return 'outer' } }
    const inner = { name: 'inner', token: stream => { stream.pos = stream.string.length; return 'innerPD' } }
    const mixed = CodeMirror.multiplexingMode(outer, {
      open: '<<',
      close: /(?=X)/,
      parseDelimiters: true,
      mode: inner,
      delimStyle: 'delim'
    })
    const state = mixed.startState()
    state.innerActive = { close: null, mode: inner }
    state.inner = { innerState: true }
    let tok = mixed.token(createStream('at sol'), state)
    expect(tok).to.equal('outer')
    expect(state.innerActive).to.equal(null)

    state.innerActive = { close: /(?=X)/, parseDelimiters: true, mode: inner }
    state.inner = {}
    tok = mixed.token(createStream('Xcontent'), state)
    expect(tok).to.equal('innerPD')
    expect(state.innerActive).to.equal(null)
  })

  it('handles blank lines, indent resolution, copyState and innerMode', () => {
    const outer = {
      name: 'outer',
      token: stream => { stream.pos = stream.string.length; return 'outer' },
      blankLine: state => { state.outerBlank = true },
      indent: () => 5,
      electricChars: '$'
    }
    const innerMode = { name: 'inner', token: s => { s.pos = s.string.length; return 'inner' }, indent: () => 7, blankLine: s => { s.innerBlank = true } }
    const mixed = CodeMirror.multiplexingMode(outer, { open: '\n', close: '\n', mode: innerMode })
    const state = mixed.startState()

    mixed.blankLine(state)
    expect(state.innerActive.mode).to.equal(innerMode)
    expect(state.inner.indent).to.equal(5)
    expect(state.innerActive.mode).to.equal(innerMode)

    mixed.blankLine(state)
    expect(state.innerActive).to.equal(null)

    const indentVal = mixed.indent({ innerActive: { mode: innerMode }, inner: { deep: true } }, 'text')
    expect(indentVal).to.equal(7)
    const passIndent = mixed.indent({ innerActive: { mode: {} }, inner: {} }, 'ta')
    expect(passIndent).to.equal(CodeMirror.Pass)

    const copied = mixed.copyState({ outer: { foo: 1 }, innerActive: { mode: innerMode }, inner: { bar: 2 } })
    expect(copied.outer.foo).to.equal(1)
    expect(copied.inner.copiedFrom).to.equal(innerMode.name)

    const start = mixed.startState()
    expect(mixed.innerMode(start).mode).to.equal(outer)
  })
})

describe('CodeMirror overlayMode helper', () => {
  const CM = {
    startState: mode => ({ ...(mode.state || {}), mode }),
    copyState: (mode, state) => ({ ...state, copied: mode && mode.copyFlag })
  }
  overlayMode(CM)

  const newStream = (start = 0) => ({ start, pos: start })

  it('combines tokens when requested and respects streamSeen resets', () => {
    const base = { token: stream => { stream.pos = stream.start + 1; return 'base' }, indent: () => 'indent', state: { copyFlag: false }, blankLine: () => 'baseBlank' }
    const overlay = { token: stream => { stream.pos = stream.start + 2; return 'overlay' }, state: { combineTokens: null }, blankLine: () => 'overlayBlank' }
    const mixed = CM.overlayMode(base, overlay, true)
    const state = mixed.startState()
    const token = mixed.token(newStream(), state)
    expect(token).to.equal('base overlay')

    const token2 = mixed.token(newStream(2), state)
    expect(token2).to.equal('base overlay')

    expect(mixed.indent(state, 'x')).to.equal('indent')
    const blank = mixed.blankLine(state)
    expect(blank).to.equal('baseBlank overlayBlank')
    expect(mixed.innerMode(state).mode).to.equal(base)
  })

  it('prefers overlay token when combine disabled', () => {
    const base = { token: stream => { stream.pos = stream.start + 1; return 'base' }, state: {} }
    const overlay = { token: stream => { stream.pos = stream.start + 1; return 'overlay' }, state: { combineTokens: false } }
    const mixed = CM.overlayMode(base, overlay)
    const state = mixed.startState()
    const token = mixed.token(newStream(), state)
    expect(token).to.equal('overlay')
  })
})

describe('CodeMirror loadmode helper', () => {
  const getScripts = () => Array.from(document.getElementsByTagName('script'))
  const ensureScriptAnchor = () => {
    if (!getScripts().length) {
      const anchor = document.createElement('script')
      document.body.appendChild(anchor)
    }
  }

  beforeEach(() => {
    ensureScriptAnchor()
  })

  afterEach(() => {
    getScripts().forEach(el => el.remove())
  })

  it('sets default modeURL and handles dependency loading', () => {
    const CM = { modes: {}, on: (el, evt, fn) => el.addEventListener(evt, fn) }
    loadMore(CM)
    expect(CM.modeURL).to.be.a('string')

    CM.modes.foo = { dependencies: ['bar'] }
    const cont = createSpy()
    CM.requireMode('foo', cont)
    const [depScript] = getScripts().filter(el => el.src.includes('bar'))
    expect(depScript).to.exist
    CM.modes.bar = { dependencies: [] }
    depScript.dispatchEvent(new Event('load'))
    const [fooScript] = getScripts().filter(el => el.src.includes('foo'))
    if (fooScript) fooScript.dispatchEvent(new Event('load'))
    expect(cont.called).to.equal(true)
  })

  it('queues duplicate loads and supports object mode names', () => {
    const CM = { modes: {}, on: (el, evt, fn) => el.addEventListener(evt, fn) }
    loadMore(CM)
    const cb1 = createSpy()
    const cb2 = createSpy()
    CM.requireMode({ name: 'dup' }, cb1)
    CM.requireMode('dup', cb2)
    const script = getScripts().find(el => el.src.includes('dup'))
    expect(script).to.exist
    CM.modes.dup = { dependencies: [] }
    script.dispatchEvent(new Event('load'))
    expect(cb1.calledOnce).to.equal(true)
    expect(cb2.calledOnce).to.equal(true)
  })

  it('auto loads mode only when missing', () => {
    const CM = { modes: {}, on: (el, evt, fn) => el.addEventListener(evt, fn) }
    loadMore(CM)
    const instance = { setOption: createSpy(), getOption: () => 'has' }
    CM.modes.has = { dependencies: [] }
    CM.autoLoadMode(instance, 'has')
    expect(instance.setOption.called).to.equal(false)

    CM.autoLoadMode(instance, 'missing')
    CM.modes.missing = { dependencies: [] }
    const script = getScripts().find(el => el.src.includes('missing'))
    script.dispatchEvent(new Event('load'))
    expect(instance.setOption.calledOnce).to.equal(true)
  })
})

describe('renderer CodeMirror exports', () => {
  const originalRequireMode = codeMirror.requireMode
  const originalAutoLoadMode = codeMirror.autoLoadMode
  before(() => {
    codeMirror.requireMode = (_mode, cb) => cb()
    codeMirror.autoLoadMode = () => {}
  })

  after(() => {
    codeMirror.requireMode = originalRequireMode
    codeMirror.autoLoadMode = originalAutoLoadMode
  })

  it('resolves modes from names and searches list', async () => {
    const modeEntry = { mime: ['application/json'], mode: 'javascript' }
    codeMirror.modeInfo.push(modeEntry)

    const found = search('json')
    expect(found.length).to.be.greaterThan(0)

    const match = await setMode({ setOption: createSpy(), getOption: () => null }, 'json')
    expect(match).to.have.property('name')
    codeMirror.modeInfo.pop()
  })

  it('handles invalid mode names with rejection', async () => {
    let error
    try {
      await setMode({ setOption: () => {} }, 'not-a-lang')
    } catch (e) {
      error = e
    }
    expect(error).to.be.a('string')
  })

  it('cursor helpers operate on provided CodeMirror-like instances', () => {
    const cm = {
      lastLine: () => 1,
      getLineHandle: () => ({ text: 'abc' }),
      focus: createSpy(),
      setCursor: createSpy(),
      getCursor: () => ({ line: 0, ch: 0, outside: true, hitSide: true, sticky: false }),
      lineCount: () => 1
    }
    setCursorAtLastLine(cm)
    expect(cm.setCursor.calledWith(1, 3)).to.equal(true)
    expect(isCursorAtFirstLine(cm)).to.equal(true)
    expect(isCursorAtLastLine(cm)).to.equal(false)
    expect(isCursorAtBegin(cm)).to.equal(true)
    expect(onlyHaveOneLine(cm)).to.equal(true)

    cm.getCursor = () => ({ line: 1, ch: 3, hitSide: true })
    expect(isCursorAtEnd(cm)).to.equal(true)

    expect(getBeginPosition()).to.deep.equal({ anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 0 } })
    expect(getEndPosition(cm)).to.deep.equal({ anchor: { line: 1, ch: 3 }, head: { line: 1, ch: 3 } })

    setCursorAtFirstLine(cm)
    expect(cm.setCursor.calledWith(0, 0)).to.equal(true)
  })

  it('sets text direction option', () => {
    const cm = { setOption: createSpy() }
    setTextDirection(cm, 'rtl')
    expect(cm.setOption.calledWith('direction', 'rtl')).to.equal(true)
  })
})
