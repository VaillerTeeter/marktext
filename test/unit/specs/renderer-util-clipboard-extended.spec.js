import { expect } from 'chai'
import { guessClipboardFilePath } from '../../../src/renderer/util/clipboard'
import { isLinux } from '../../../src/renderer/util/index'

describe('renderer util clipboard extended', () => {
  it('returns empty string on linux (existing)', () => {
    expect(isLinux).to.equal(true)
    expect(guessClipboardFilePath()).to.equal('')
  })

  it.skip('returns first file path on macOS when NSFilenamesPboardType present (TODO)', () => {
    // TODO: implement by temporarily overriding process.platform and mocking @electron/remote clipboard
  })

  it.skip('returns Windows FileNameW decoded string on Windows (TODO)', () => {
    // TODO: implement by temporarily overriding process.platform and mocking @electron/remote clipboard.read
  })
})
