import { expect } from 'chai'

import {
  tabSizeOptions,
  endOfLineOptions,
  trimTrailingNewlineOptions,
  textDirectionOptions,
  getDefaultEncodingOptions
} from '../../../src/renderer/prefComponents/editor/config'

describe('renderer/prefComponents/editor/config', () => {
  it('exports option arrays with expected shapes', () => {
    expect(tabSizeOptions).to.be.an('array').that.is.not.empty
    expect(endOfLineOptions).to.be.an('array').that.is.not.empty
    expect(trimTrailingNewlineOptions).to.be.an('array').that.is.not.empty
    expect(textDirectionOptions).to.be.an('array').that.is.not.empty

    expect(tabSizeOptions[0]).to.have.all.keys('label', 'value')
    expect(endOfLineOptions[0]).to.have.all.keys('label', 'value')
  })

  it('getDefaultEncodingOptions returns consistent cached results', () => {
    const first = getDefaultEncodingOptions()
    const second = getDefaultEncodingOptions()
    expect(first).to.equal(second) // cached reference
    expect(first).to.be.an('array')
    if (first.length) {
      expect(first[0]).to.have.keys('label', 'value')
    }
  })
})
