import { expect } from 'chai'
import ExportHtml, { getSanitizeHtml } from 'muya/lib/utils/exportHtml'
import ExportMarkdown from 'muya/lib/utils/exportMarkdown'
import importRegister from 'muya/lib/utils/importMarkdown'
import { getLinkInfo } from 'muya/lib/utils/getLinkInfo'
import { cumputeCheckboxStatus } from 'muya/lib/utils/cumputeCheckBoxStatus'
import { getParentCheckBox } from 'muya/lib/utils/getParentCheckBox'
import { getImageInfo as getImageTokenInfo, correctImageSrc } from 'muya/lib/utils/getImageInfo'
import { sanitizeHyperlink } from 'muya/lib/utils/url'
import { operateClassName, insertBefore, insertAfter } from 'muya/lib/utils/domManipulate'
import { hasMarkdownExtension } from 'muya/lib/utils/markdownFile'
import { usePluginAddRules } from 'muya/lib/utils/turndownService'
import {
  identity,
  snakeToCamel,
  camelToSnake,
  conflict,
  union,
  deepCopy,
  deepCopyArray,
  escapeHTML,
  unescapeHTML,
  escapeInBlockHtml,
  escapeHtmlTags,
  wordCount,
  collectFootnotes,
  sanitize as sanitizeWithConfig,
  getImageInfo as resolveImageInfo
} from 'muya/lib/utils'
import { CLASS_OR_ID, CURSOR_ANCHOR_DNA, CURSOR_FOCUS_DNA } from 'muya/lib/config'

describe('utils/turndownService', () => {
  it('adds gfm rules and keeps turndown behavior', () => {
    const rules = {}
    const usedPlugins = []
    const kept = []
    const service = {
      use: plugin => { usedPlugins.push(plugin) },
      addRule: (name, rule) => { rules[name] = rule },
      keep: items => kept.push(items)
    }

    usePluginAddRules(service, ['ruby'])

    expect(usedPlugins).to.have.lengthOf(1)
    expect(kept[0]).to.deep.equal(['ruby'])
    expect(service.escape).to.equal(identity)
    expect(rules.strikethrough.replacement('x')).to.equal('~~x~~')

    const p = document.createElement('p')
    const checkbox = document.createElement('input')
    const container = document.createElement('div')
    container.appendChild(checkbox)
    container.appendChild(p)
    expect(rules.paragraph.replacement('done', p)).to.equal('done\n\n')
    expect(rules.paragraph.replacement('plain', document.createElement('p'))).to.equal('\n\nplain\n\n')

    const ol = document.createElement('ol')
    ol.setAttribute('start', '3')
    const firstLi = document.createElement('li')
    const secondLi = document.createElement('li')
    ol.appendChild(firstLi)
    ol.appendChild(secondLi)
    const listText = rules.listItem.replacement('item', firstLi, { bulletListMarker: '-' })
    expect(listText).to.equal('3. item\n')

    const pre = document.createElement('pre')
    pre.classList.add('multiple-math')
    expect(rules.multiplemath.filter(pre)).to.be.true
    expect(rules.multiplemath.replacement('a', pre)).to.equal('$$\na\n$$')
  })
})

describe('utils/link and image info helpers', () => {
  it('returns link token metadata with ranges', () => {
    const paragraph = document.createElement('p')
    paragraph.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    paragraph.id = 'para-1'
    const link = document.createElement('a')
    link.setAttribute('data-raw', '[label](https://a.example)')
    link.setAttribute('data-start', '1')
    link.setAttribute('data-end', '10')
    link.setAttribute('href', 'https://a.example')
    paragraph.appendChild(link)

    const info = getLinkInfo(link)
    expect(info.key).to.equal('para-1')
    expect(info.href).to.equal('https://a.example')
    expect(info.token).to.have.property('range')
    expect(info.token.range).to.deep.equal({ start: '1', end: '10' })
  })

  it('extracts image token info with cursor range and id', () => {
    const paragraph = document.createElement('p')
    paragraph.classList.add(CLASS_OR_ID.AG_PARAGRAPH)
    paragraph.id = 'para-2'
    const prefix = document.createTextNode('hi')
    const image = document.createElement('img')
    image.id = 'image-1'
    image.setAttribute('data-raw', '![alt](foo.png)')
    paragraph.appendChild(prefix)
    paragraph.appendChild(image)

    const info = getImageTokenInfo(image)
    expect(info.key).to.equal('para-2')
    expect(info.imageId).to.equal('image-1')
    expect(info.token.range).to.deep.equal({ start: 2, end: 2 + '![alt](foo.png)'.length })
  })

  it('normalizes file paths into file URLs', () => {
    expect(correctImageSrc('/tmp/asset.png')).to.equal('file:///tmp/asset.png')
  })
})

describe('utils/dom and checkbox helpers', () => {
  it('computes checkbox status across children', () => {
    const parentLi = document.createElement('li')
    const checkbox = document.createElement('input')
    parentLi.appendChild(checkbox)
    const childList = document.createElement('ul')
    const childOne = document.createElement('li')
    const childTwo = document.createElement('li')
    const firstChildBox = document.createElement('input')
    firstChildBox.checked = true
    const secondChildBox = document.createElement('input')
    secondChildBox.checked = false
    childOne.appendChild(firstChildBox)
    childTwo.appendChild(secondChildBox)
    childList.appendChild(childOne)
    childList.appendChild(childTwo)
    parentLi.appendChild(childList)

    expect(cumputeCheckboxStatus(checkbox)).to.be.false
    secondChildBox.checked = true
    expect(cumputeCheckboxStatus(checkbox)).to.be.true
  })

  it('resolves parent checkbox unless hitting editor root', () => {
    const root = document.createElement('div')
    root.id = CLASS_OR_ID.AG_EDITOR_ID
    const parent = document.createElement('div')
    const firstChild = document.createElement('input')
    parent.appendChild(firstChild)
    const mid = document.createElement('div')
    const container = document.createElement('div')
    root.appendChild(parent)
    parent.appendChild(mid)
    mid.appendChild(container)
    const checkbox = document.createElement('input')
    container.appendChild(checkbox)

    expect(getParentCheckBox(checkbox)).to.equal(firstChild)
    const editorCheckbox = document.createElement('input')
    const nested = document.createElement('div')
    const nestedParent = document.createElement('div')
    nestedParent.appendChild(editorCheckbox)
    nested.appendChild(nestedParent)
    root.appendChild(nested)
    expect(getParentCheckBox(editorCheckbox)).to.equal(null)
  })

  it('manipulates classes and DOM positions', () => {
    const el = document.createElement('div')
    operateClassName(el, 'add', 'active')
    expect(el.classList.contains('active')).to.be.true
    operateClassName(el, 'remove', 'active')
    expect(el.classList.contains('active')).to.be.false

    const container = document.createElement('div')
    const a = document.createElement('span')
    a.textContent = 'a'
    const b = document.createElement('span')
    b.textContent = 'b'
    const c = document.createElement('span')
    c.textContent = 'c'
    container.appendChild(b)
    insertBefore(a, b)
    insertAfter(c, b)
    expect(container.textContent).to.equal('abc')
  })
})

describe('utils/url and file helpers', () => {
  it('sanitizes hyperlinks and rejects dangerous ones', () => {
    expect(sanitizeHyperlink('https://safe.example')).to.equal('https://safe.example')
    expect(sanitizeHyperlink('javascript:alert(1)')).to.equal('')
  })

  it('detects markdown extensions', () => {
    expect(hasMarkdownExtension('note.md')).to.be.true
    expect(hasMarkdownExtension('note.pdf')).to.be.false
  })
})

describe('utils core helpers', () => {
  it('transforms names, numbers, and ranges', () => {
    expect(snakeToCamel('hello_world')).to.equal('helloWorld')
    expect(camelToSnake('HelloWorld')).to.equal('-hello-world')
    expect(conflict([1, 3], [2, 4])).to.be.true
    expect(union({ start: 1, end: 4 }, { start: 2, end: 5, active: true })).to.deep.equal({ start: 2, end: 4, active: true })
  })

  it('deep copies nested values', () => {
    const source = { foo: ['bar', { baz: 1 }] }
    const cloned = deepCopy(source)
    expect(cloned).to.deep.equal(source)
    expect(cloned).to.not.equal(source)
    const arr = [1, [2, 3]]
    const arrCopy = deepCopyArray(arr)
    expect(arrCopy).to.deep.equal(arr)
    expect(arrCopy[1]).to.not.equal(arr[1])
  })

  it('escapes html helpers', () => {
    const raw = '<script>1</script>'
    expect(escapeHTML(raw)).to.equal('&lt;script&gt;1&lt;/script&gt;')
    expect(unescapeHTML('&lt;div&gt;')).to.equal('<div>')
    expect(escapeInBlockHtml('<script>1</script>')).to.contain('&lt;script')
    expect(escapeHtmlTags(raw)).to.equal('&lt;script&gt;1&lt;/script&gt;')
  })

  it('counts words and collects footnotes', () => {
    const stats = wordCount('你好 world')
    expect(stats.word).to.equal(3)
    const blocks = [
      { type: 'figure', functionType: 'footnote', children: [{ text: 'a' }] },
      { type: 'p' }
    ]
    const map = collectFootnotes(blocks)
    expect(map.get('a')).to.equal(blocks[0])
  })

  it('sanitizes html content with config', () => {
    const result = sanitizeWithConfig('<p><em>x</em></p>', {}, false)
    expect(result).to.contain('<em>')
  })

  it('resolves image paths with base directory', () => {
    const info = resolveImageInfo('img.png', '/tmp')
    expect(info.isUnknownType).to.be.false
    expect(info.src.startsWith('file:///')).to.be.true
  })
})

describe('utils/exportMarkdown', () => {
  it('exports paragraphs and code fences', () => {
    const paragraph = { type: 'p', children: [{ type: 'span', text: 'hello' }] }
    const code = {
      type: 'pre',
      functionType: 'fencecode',
      lang: 'js',
      children: [
        { type: 'span', functionType: 'languageInput', text: 'js' },
        { type: 'code', children: [{ type: 'span', functionType: 'codeContent', text: 'console.log(1)' }] }
      ]
    }
    const exporter = new ExportMarkdown([paragraph, code])
    const markdown = exporter.generate()
    expect(markdown).to.contain('hello')
    expect(markdown).to.contain('```js')
    expect(markdown).to.contain('console.log(1)')
  })

  it('exports container blocks', () => {
    const block = {
      type: 'figure',
      functionType: 'mermaid',
      children: [{
        functionType: 'mermaid',
        children: [{ children: [{ text: 'graph TD' }] }]
      }]
    }
    const exporter = new ExportMarkdown([])
    expect(exporter.normalizeContainer(block, '')).to.equal('```mermaid\ngraph TD\n```\n')
  })
})

describe('utils/importMarkdown', () => {
  class FakeContentState {
    constructor () {
      this.turndownConfig = {}
    }
  }

  importRegister(FakeContentState)

  it('converts HTML to markdown with gfm rules', () => {
    const instance = new FakeContentState()
    const md = instance.htmlToMarkdown('<p><del>strike</del><span>&nbsp;</span></p>')
    expect(md).to.contain('~~strike~~')
  })

  it('injects cursor markers into markdown text', () => {
    const instance = new FakeContentState()
    const cursor = { anchor: { line: 0, ch: 1 }, focus: { line: 0, ch: 4 } }
    const { markdown, isValid } = instance.addCursorToMarkdown('hello world', cursor)
    expect(isValid).to.be.true
    expect(markdown).to.contain(CURSOR_ANCHOR_DNA)
    expect(markdown).to.contain(CURSOR_FOCUS_DNA)
  })
})

describe('utils/exportHtml', () => {
  it('sanitizes rendered markdown output', async () => {
    const clean = getSanitizeHtml('# Title', {})
    expect(clean).to.not.contain('<script')
  })

  it('handles math renderer errors gracefully', () => {
    const exporter = new ExportHtml('', { options: {} })
    const rendered = exporter.mathRenderer('\\text{', true)
    expect(rendered).to.contain('invalid')
  })

  it('prepares header and footer containers', () => {
    const exporter = new ExportHtml('', { options: {} })
    const options = {
      header: { type: 1, left: 'L', center: 'C', right: 'R' },
      footer: { type: 2, left: '', center: 'F', right: '' },
      headerFooterStyled: false,
      extraCss: ''
    }
    const html = exporter._prepareHtml('<p>body</p>', options)
    expect(html).to.contain('page-header')
    expect(html).to.contain('page-footer')
    expect(html).to.contain('body')
    expect(options.extraCss).to.not.equal('')
  })
})
