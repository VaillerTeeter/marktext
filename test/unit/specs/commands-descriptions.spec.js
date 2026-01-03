import getDescription from '../../../src/renderer/commands/descriptions'
import i18n from '../../../src/renderer/i18n'

describe('commands descriptions', () => {
  it('returns friendly text for known commands', () => {
    expect(getDescription('file.open-folder')).to.equal('File: Open Folder')
    expect(getDescription('paragraph.heading-1')).to.include('Heading 1')
  })

  it('returns undefined for unknown id', () => {
    // Mock i18n.t to avoid warnings for unknown keys
    const originalT = i18n.t
    i18n.t = (key) => {
      if (key === 'commands.unknown_command_id') {
        return key // Return the key itself to simulate missing translation
      }
      return originalT.call(i18n, key)
    }
    expect(getDescription('unknown-command-id')).to.equal(undefined)
    i18n.t = originalT
  })
})
