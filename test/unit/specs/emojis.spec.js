import { expect } from 'chai'
import Emoji, { validEmoji, checkEditEmoji } from '../../../src/muya/lib/ui/emojis/index'

describe('muya ui emojis', () => {
  it('validEmoji finds known alias and returns object', () => {
    const res = validEmoji('smile')
    expect(res).to.be.an('object')
    expect(res.aliases).to.include('smile')
    expect(res).to.have.property('emoji')
  })

  it('validEmoji returns undefined for unknown', () => {
    const res = validEmoji('this-does-not-exist')
    expect(res).to.be.undefined
  })

  it('checkEditEmoji returns node when class present, otherwise false', () => {
    const node = { classList: { contains: () => true } }
    const found = checkEditEmoji(node)
    expect(found).to.equal(node)

    const notFound = checkEditEmoji(null)
    expect(notFound).to.equal(false)

    // also ensure nodes with a true contains result return the node
    const node2 = { classList: { contains: () => true } }
    expect(checkEditEmoji(node2)).to.equal(node2)
  })

  it('Emoji.search caches results and destroy clears cache', () => {
    const e = new Emoji()
    expect(e.cache.size).to.equal(0)
    const r1 = e.search('smile')
    expect(r1).to.be.an('object')
    expect(e.cache.has('smile')).to.be.true
    const r2 = e.search('smile')
    expect(r2).to.equal(r1)
    e.destroy()
    expect(e.cache.size).to.equal(0)
  })
})
