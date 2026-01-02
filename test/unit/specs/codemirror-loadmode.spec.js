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
import loadMore from '../../../src/renderer/codeMirror/loadmode'

describe('CodeMirror loadmode helper', () => {
  const ensureScriptAnchor = () => {
    if (!document.getElementsByTagName('script').length) {
      const anchor = document.createElement('script')
      document.body.appendChild(anchor)
    }
  }

  beforeEach(() => {
    ensureScriptAnchor()
  })

  it('auto loads missing modes and calls callbacks', () => {
    const CM = {
      // Use data URI to avoid real HTTP requests during test runs.
      modeURL: 'data:text/javascript,/*%N.js*/',
      modes: {},
      on: (el, evt, fn) => el.addEventListener(evt, fn)
    }
    loadMore(CM)

    const cont = createSpy()
    CM.requireMode('foo', cont)
    // set mode definition before firing load to satisfy ensureDeps
    CM.modes.foo = { dependencies: [] }
    const script = Array.from(document.getElementsByTagName('script')).find(el => el.src.includes('foo.js'))
    expect(script).to.exist
    script.dispatchEvent(new Event('load'))
    expect(cont.calledOnce).to.equal(true)

    const instance = {
      setOption: createSpy(),
      getOption: () => 'foo'
    }
    const beforeScripts = document.getElementsByTagName('script').length
    CM.autoLoadMode(instance, 'foo')
    const afterScripts = document.getElementsByTagName('script').length
    expect(afterScripts).to.equal(beforeScripts)
    expect(instance.setOption.called).to.equal(false)

    CM.autoLoadMode(instance, 'bar')
    CM.modes.bar = { dependencies: [] }
    const barScript = Array.from(document.getElementsByTagName('script')).find(el => el.src.includes('bar.js'))
    expect(barScript).to.exist
    barScript.dispatchEvent(new Event('load'))
    expect(instance.setOption.calledOnce).to.equal(true)
  })
})
