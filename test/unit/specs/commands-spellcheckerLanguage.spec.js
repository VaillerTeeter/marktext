import SpellcheckerLanguageCommand from '../../../src/renderer/commands/spellcheckerLanguage'
import bus from '../../../src/renderer/bus'
import { SpellChecker } from '../../../src/renderer/spellchecker'

describe('command spellchecker language', () => {
  let originalGetAvailable
  let emitted

  beforeEach(() => {
    emitted = []
    originalGetAvailable = SpellChecker.getAvailableDictionaries
    SpellChecker.getAvailableDictionaries = () => Promise.resolve(['en', 'fr'])
    bus.$emit = (...args) => emitted.push(args)
  })

  afterEach(() => {
    SpellChecker.getAvailableDictionaries = originalGetAvailable
  })

  it('builds language list and marks current', async () => {
    const cmd = new SpellcheckerLanguageCommand({ lang: 'fr', isEnabled: true })
    await cmd.run()
    expect(cmd.subcommands.map(c => c.value)).to.deep.equal(['en', 'fr'])
    expect(cmd.subcommandSelectedIndex).to.equal(1)
  })

  it('emits switch event when enabled', async () => {
    const cmd = new SpellcheckerLanguageCommand({ lang: 'en', isEnabled: true })
    await cmd.run()
    await cmd.executeSubcommand(cmd.subcommands[1].id)
    expect(emitted[0]).to.deep.equal(['switch-spellchecker-language', 'fr'])
  })
})
