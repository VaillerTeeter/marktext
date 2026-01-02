import keybindingsDarwin from '../../../src/main/keyboard/keybindingsDarwin'
import keybindingsLinux from '../../../src/main/keyboard/keybindingsLinux'
import keybindingsWindows from '../../../src/main/keyboard/keybindingsWindows'

describe('keyboard keybindings maps', () => {
  it('exposes darwin defaults', () => {
    expect(keybindingsDarwin.get('file.save')).to.equal('Command+S')
    expect(keybindingsDarwin.size).to.be.greaterThan(0)
  })

  it('exposes linux defaults', () => {
    expect(keybindingsLinux.get('file.save')).to.equal('Ctrl+S')
    expect(keybindingsLinux.size).to.be.greaterThan(0)
  })

  it('exposes windows defaults', () => {
    expect(keybindingsWindows.get('file.save')).to.equal('Ctrl+S')
    expect(keybindingsWindows.size).to.be.greaterThan(0)
  })
})
