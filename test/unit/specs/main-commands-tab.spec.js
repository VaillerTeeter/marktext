import { COMMANDS } from '../../../src/main/commands'
import { loadTabCommands } from '../../../src/main/commands/tab'

describe('main tab commands', () => {
  it('registers tab navigation commands and sends ipc', () => {
    const added = new Map()
    const manager = {
      add: (id, fn) => added.set(id, fn)
    }

    loadTabCommands(manager)

    const win = { webContents: { send: (...args) => win.sent.push(args) }, sent: [] }
    added.get(COMMANDS.TABS_CYCLE_BACKWARD)(win)
    added.get(COMMANDS.TABS_CYCLE_FORWARD)(win)
    added.get(COMMANDS.TABS_SWITCH_TO_THIRD)(win)

    // invoke every registered tab switch to execute callbacks
    added.forEach(handler => handler(win))

    expect(win.sent).to.deep.include(['mt::tabs-cycle-left'])
    expect(win.sent).to.deep.include(['mt::tabs-cycle-right'])
    expect(win.sent).to.deep.include(['mt::switch-tab-by-index', 2])

    // Ensure all shortcut indices are registered
    const expectedIds = [
      COMMANDS.TABS_SWITCH_TO_FIRST,
      COMMANDS.TABS_SWITCH_TO_SECOND,
      COMMANDS.TABS_SWITCH_TO_THIRD,
      COMMANDS.TABS_SWITCH_TO_FOURTH,
      COMMANDS.TABS_SWITCH_TO_FIFTH,
      COMMANDS.TABS_SWITCH_TO_SIXTH,
      COMMANDS.TABS_SWITCH_TO_SEVENTH,
      COMMANDS.TABS_SWITCH_TO_EIGHTH,
      COMMANDS.TABS_SWITCH_TO_NINTH,
      COMMANDS.TABS_SWITCH_TO_TENTH
    ]
    expectedIds.forEach(id => expect(added.has(id)).to.equal(true))

    // cover branch when window is missing
    added.get(COMMANDS.TABS_SWITCH_TO_FIRST)(null)
    added.get(COMMANDS.TABS_CYCLE_BACKWARD)(null)
    added.get(COMMANDS.TABS_CYCLE_FORWARD)(null)
  })
})
