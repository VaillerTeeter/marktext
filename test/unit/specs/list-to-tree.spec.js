import listToTree from '../../../src/renderer/util/listToTree'

describe('listToTree', () => {
  it('builds nested children when heading levels increase and decrease', () => {
    const headings = [
      { lvl: 1, content: 'Root', slug: 'root' },
      { lvl: 2, content: 'Child A', slug: 'child-a' },
      { lvl: 3, content: 'Grandchild', slug: 'grandchild' },
      { lvl: 2, content: 'Child B', slug: 'child-b' },
      { lvl: 1, content: 'Sibling', slug: 'sibling' }
    ]

    const tree = listToTree(headings)

    expect(tree).to.have.lengthOf(2)
    expect(tree[0].label).to.equal('Root')
    expect(tree[0].children).to.have.lengthOf(2)
    expect(tree[0].children[0].label).to.equal('Child A')
    expect(tree[0].children[0].children[0].slug).to.equal('grandchild')
    expect(tree[0].children[1].slug).to.equal('child-b')
    expect(tree[1].label).to.equal('Sibling')
  })

  it('returns root-level siblings when levels stay flat', () => {
    const headings = [
      { lvl: 1, content: 'First', slug: 'first' },
      { lvl: 1, content: 'Second', slug: 'second' },
      { lvl: 1, content: 'Third', slug: 'third' }
    ]

    const tree = listToTree(headings)

    expect(tree.map(node => node.slug)).to.deep.equal(['first', 'second', 'third'])
    // Both nodes share the same synthetic root parent created in listToTree.
    expect(tree[0].parent).to.equal(tree[1].parent)
  })

  it('handles an empty list', () => {
    expect(listToTree([])).to.deep.equal([])
  })
})
