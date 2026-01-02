import { CommandManager, loadDefaultCommands, COMMANDS } from '../../../src/main/commands'

describe('main command manager', () => {
  beforeEach(() => {
    // reset shared instance before each test
    CommandManager._commands = new Map()
  })

  it('adds and executes registered commands', () => {
    const manager = CommandManager
    let executed = null
    manager.add('demo', (a, b) => {
      executed = a + b
      return executed
    })

    const result = manager.execute('demo', 2, 3)
    expect(result).to.equal(5)
    expect(executed).to.equal(5)
  })

  it('throws when adding duplicates or executing missing commands', () => {
    const manager = CommandManager
    manager.add('exists', () => {})
    expect(() => manager.add('exists', () => {})).to.throw()
    expect(() => manager.execute('missing')).to.throw()
  })

  it('loads default command set', () => {
    const registered = []
    const manager = {
      add: (id, callback) => {
        registered.push({ id, callback })
      }
    }

    loadDefaultCommands(manager)

    const ids = registered.map(r => r.id)
    expect(ids).to.include(COMMANDS.FILE_QUICK_OPEN)
    expect(ids).to.include(COMMANDS.TABS_CYCLE_FORWARD)
    expect(new Set(ids).size).to.equal(ids.length)
  })

  it('verifies default commands and logs missing ones', () => {
    const originalError = console.error
    const errors = []
    console.error = msg => errors.push(msg)

    CommandManager._commands.set(COMMANDS.FILE_NEW_TAB, () => {})
    CommandManager.__verifyDefaultCommands()

    expect(errors.length).to.be.greaterThan(0)
    console.error = originalError
  })

  it('verification passes when all commands are registered', () => {
    const originalError = console.error
    let errorCalled = false
    console.error = () => { errorCalled = true }

    CommandManager._commands = new Map(Object.values(COMMANDS).map(id => [id, () => {}]))
    CommandManager.__verifyDefaultCommands()

    expect(errorCalled).to.equal(false)
    console.error = originalError
  })
})
