import routes from '../../../src/renderer/router'

describe('renderer router', () => {
  it('redirects to editor when type is editor', () => {
    const defs = routes('editor')
    expect(defs[0].redirect).to.equal('/editor')
  })

  it('redirects to spelling preference when type ends with spelling', () => {
    const defs = routes('preference/spelling')
    expect(defs[0].redirect).to.equal('/preference/spelling')
  })

  it('redirects to preference root for other types', () => {
    const defs = routes('general')
    expect(defs[0].redirect).to.equal('/preference')
  })
})
