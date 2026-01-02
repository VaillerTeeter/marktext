import { expect } from 'chai'
import loadRenderer from '../../../src/muya/lib/renderers'

const seqId = require.resolve('../../../src/muya/lib/parser/render/sequence')
const originalSeq = require.cache[seqId]
require.cache[seqId] = { exports: { __esModule: true, default: () => 'sequence-stub' } }

describe('muya renderers loader', () => {
  it('loads each renderer and caches repeat calls', async () => {
    const names = ['sequence', 'plantuml', 'flowchart', 'mermaid', 'vega-lite']
    for (const name of names) {
      const first = await loadRenderer(name)
      const second = await loadRenderer(name)
      expect(first).to.equal(second)
      expect(first).to.not.equal(undefined)
    }
  }).timeout(5000)

  it('throws on unknown renderer name', async () => {
    let error
    try {
      await loadRenderer('unknown-renderer')
    } catch (e) {
      error = e
    }
    expect(error).to.be.instanceOf(Error)
    expect(error.message).to.match(/unknown diagram/i)
  })

  after(() => {
    if (originalSeq) {
      require.cache[seqId] = originalSeq
    } else {
      delete require.cache[seqId]
    }
  })
})
