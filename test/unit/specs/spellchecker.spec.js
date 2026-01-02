import { expect } from 'chai'
import { ipcRenderer } from 'electron'
import { SpellChecker } from '../../../src/renderer/spellchecker/index'

describe('renderer spellchecker', () => {
  let originalInvoke

  before(() => {
    // stub ipcRenderer.invoke
    originalInvoke = ipcRenderer.invoke
    ipcRenderer.invoke = async (channel, ...args) => {
      if (channel === 'mt::spellchecker-set-enabled') return true
      if (channel === 'mt::spellchecker-switch-language') return true
      if (channel === 'mt::spellchecker-get-available-dictionaries') return ['en-US']
      return null
    }
  })

  after(() => {
    ipcRenderer.invoke = originalInvoke
  })

  it('constructor and isEnabled/lang accessors', () => {
    const sc = new SpellChecker(false, 'en-US')
    expect(sc.isEnabled).to.equal(false)
    sc.enabled = true
    expect(sc.isEnabled).to.equal(true)
    expect(sc.lang).to.equal('en-US')
    sc.lang = 'fr-FR'
    expect(sc.lang).to.equal('fr-FR')
  })

  it('switchLanguage throws when no lang and not mac', async () => {
    const sc = new SpellChecker(true, null)
    let err
    try {
      await sc.switchLanguage('')
    } catch (e) {
      err = e
    }
    expect(err).to.be.an('error')
  })

  it('activateSpellchecker and deactivateSpellchecker call ipc', async () => {
    const sc = new SpellChecker(false, 'en-US')
    const res = await sc.activateSpellchecker('en-US')
    expect(res).to.equal(true)
    sc.deactivateSpellchecker()
    expect(sc.isEnabled).to.equal(false)
  })

  it('getAvailableDictionaries returns array from ipc', async () => {
    const dicts = await SpellChecker.getAvailableDictionaries()
    expect(dicts).to.be.an('array')
    expect(dicts[0]).to.equal('en-US')
  })
})
