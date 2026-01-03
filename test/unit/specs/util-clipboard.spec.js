import { guessClipboardFilePath } from '../../../src/renderer/util/clipboard'
import { isLinux } from '../../../src/renderer/util/index'

describe('renderer util clipboard', () => {
  it('returns empty string on linux', () => {
    expect(isLinux).to.equal(process.platform === 'linux')
    if (!isLinux) return
    expect(guessClipboardFilePath()).to.equal('')
  })
})
