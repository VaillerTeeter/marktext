import { isEqualAccelerator } from '../../../src/common/keybinding'

describe('common keybinding', () => {
  it('normalizes platform specific modifiers', () => {
    const expectedCmd = process.platform === 'darwin' ? 'cmd+S' : 'ctrl+S'
    expect(isEqualAccelerator('CommandOrControl+S', expectedCmd)).to.equal(true)
    expect(isEqualAccelerator('meta+shift+P', 'cmd+shift+p')).to.equal(true)
    expect(isEqualAccelerator('Alt+Enter', 'option+enter')).to.equal(true)
  })

  it('compares combinations by parts ignoring order', () => {
    expect(isEqualAccelerator('Ctrl+Shift+P', 'shift+ctrl+p')).to.equal(true)
    expect(isEqualAccelerator('Ctrl+Shift+P', 'ctrl+p')).to.equal(false)
  })

  it('handles single keys and rejects mismatched forms', () => {
    expect(isEqualAccelerator('esc', 'Esc')).to.equal(true)
    expect(isEqualAccelerator('escape', 'esc')).to.equal(false)
    expect(isEqualAccelerator('f1', 'f2')).to.equal(false)
    expect(isEqualAccelerator('cmd+a', 'cmd+a+b')).to.equal(false)
  })

  it('returns false when only one accelerator has modifiers', () => {
    expect(isEqualAccelerator('ctrl+a', 'a')).to.equal(false)
  })

  it('normalizes accelerators on darwin builds', () => {
    const descriptor = Object.getOwnPropertyDescriptor(process, 'platform')
    Object.defineProperty(process, 'platform', { value: 'darwin' })
    delete require.cache[require.resolve('../../../src/common/keybinding')]
    const { isEqualAccelerator: macEqual } = require('../../../src/common/keybinding')

    expect(macEqual('CommandOrControl+S', 'cmd+s')).to.equal(true)

    Object.defineProperty(process, 'platform', descriptor)
    delete require.cache[require.resolve('../../../src/common/keybinding')]
  })
})
