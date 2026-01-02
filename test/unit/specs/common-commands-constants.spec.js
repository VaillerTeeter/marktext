import COMMANDS from '../../../src/common/commands/constants'

describe('common commands constants', () => {
  it('is frozen to prevent accidental mutation', () => {
    expect(Object.isFrozen(COMMANDS)).to.equal(true)
  })

  it('exposes a representative command id', () => {
    expect(COMMANDS.EDIT_COPY).to.equal('edit.copy')
    expect(COMMANDS.FILE_OPEN_FOLDER).to.equal('file.open-folder')
    expect(COMMANDS.VIEW_TOGGLE_TABBAR).to.equal('view.toggle-tabbar')
  })

  it('does not allow reassignment', () => {
    const original = COMMANDS.EDIT_UNDO
    try {
      COMMANDS.EDIT_UNDO = 'changed'
    } catch (_) {
      // ignore in strict mode
    }
    expect(COMMANDS.EDIT_UNDO).to.equal(original)
  })
})
