import * as chai from 'chai'

const globalObj = (typeof window !== 'undefined') ? window : globalThis

globalObj.chai = chai

globalObj.expect = chai.expect
globalObj.assert = chai.assert

if (typeof chai.should === 'function') {
  chai.should()
}
