import getDescription from '../../../src/renderer/commands/descriptions'

describe('commands descriptions', () => {
  it('returns friendly text for known commands', () => {
    expect(getDescription('file.open-folder')).to.equal('File: Open Folder')
    expect(getDescription('paragraph.heading-1')).to.include('Heading 1')
  })

  it('returns undefined for unknown id', () => {
    expect(getDescription('unknown-command-id')).to.equal(undefined)
  })
})
