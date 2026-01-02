import { CommandManager } from '../../../src/main/commands'

describe('main commands manager', () => {
  beforeEach(() => {
    CommandManager._commands = new Map()
  })

  it('adds, executes and removes commands', () => {
    const manager = CommandManager
    manager.add('sum', (a, b) => a + b)
    expect(manager.has('sum')).to.equal(true)
    expect(manager.execute('sum', 2, 3)).to.equal(5)
    expect(manager.remove('sum')).to.equal(true)
    expect(manager.has('sum')).to.equal(false)
  })

  it('throws on duplicate add or missing execute', () => {
    const manager = CommandManager
    manager.add('noop', () => true)
    expect(() => manager.add('noop', () => {})).to.throw()
    expect(() => manager.execute('missing')).to.throw()
  })
})
