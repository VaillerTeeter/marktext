import { filter } from 'fuzzaldrin'
import { patch, h } from '../../parser/render/snabbdom'
import { deepCopy } from '../../utils'
import BaseScrollFloat from '../baseScrollFloat'
import { quickInsertObj } from './config'
import i18n from '@/i18n'
import './index.css'

class QuickInsert extends BaseScrollFloat {
  static pluginName = 'quickInsert'

  constructor (muya) {
    const name = 'ag-quick-insert'
    super(muya, name)
    this.reference = null
    this.oldVnode = null
    this._renderObj = null
    this.renderArray = null
    this.activeItem = null
    this.block = null
    this.renderObj = quickInsertObj
    this.render()
    this.listen()
  }

  get renderObj () {
    return this._renderObj
  }

  set renderObj (obj) {
    this._renderObj = obj
    const renderArray = []
    Object.keys(obj).forEach(key => {
      renderArray.push(...obj[key])
    })
    this.renderArray = renderArray
    if (this.renderArray.length > 0) {
      this.activeItem = this.renderArray[0]
      const activeEle = this.getItemElement(this.activeItem)
      this.activeEleScrollIntoView(activeEle)
    }
  }

  render () {
    const { scrollElement, activeItem, _renderObj } = this
    let children = Object.keys(_renderObj).filter(key => {
      return _renderObj[key].length !== 0
    })
      .map(key => {
        // Translate section header if translation available
        const sectionKey = `quickInsert.section.${key.replace(/\s+/g, '_').replace(/-/g, '_')}`
        const sectionTitle = (i18n && i18n.t(sectionKey) && i18n.t(sectionKey) !== sectionKey)
          ? i18n.t(sectionKey)
          : key.toUpperCase()
        const titleVnode = h('div.title', sectionTitle)
        const items = []
        for (const item of _renderObj[key]) {
          const { title, subTitle, label, icon, shortCut } = item
          const normalizeKey = s => s.replace(/\s+/g, '_').replace(/-/g, '_').replace(/\./g, '_').toLowerCase()
          const itemKey = `quickInsert.${normalizeKey(label)}`
          const titleText = (i18n && i18n.t(itemKey + '.title') && i18n.t(itemKey + '.title') !== (itemKey + '.title'))
            ? i18n.t(itemKey + '.title')
            : title
          const subTitleText = (i18n && i18n.t(itemKey + '.subtitle') && i18n.t(itemKey + '.subtitle') !== (itemKey + '.subtitle'))
            ? i18n.t(itemKey + '.subtitle')
            : subTitle
          const iconVnode = h('div.icon-container', h('i.icon', h(`i.icon-${label.replace(/\s/g, '-')}`, {
            style: {
              background: `url(${icon}) no-repeat`,
              'background-size': '100%'
            }
          }, '')))

          const description = h('div.description', [
            h('div.big-title', titleText),
            h('div.sub-title', subTitleText)
          ])
          const shortCutVnode = h('div.short-cut', [
            h('span', shortCut)
          ])
          const selector = activeItem.label === label ? 'div.item.active' : 'div.item'
          items.push(h(selector, {
            dataset: { label },
            on: {
              click: () => {
                this.selectItem(item)
              }
            }
          }, [iconVnode, description, shortCutVnode]))
        }

        return h('section', [titleVnode, ...items])
      })

    if (children.length === 0) {
      children = h('div.no-result', 'No result')
    }
    const vnode = h('div', children)

    if (this.oldVnode) {
      patch(this.oldVnode, vnode)
    } else {
      patch(scrollElement, vnode)
    }
    this.oldVnode = vnode
  }

  listen () {
    super.listen()
    const { eventCenter } = this.muya
    eventCenter.subscribe('muya-quick-insert', (reference, block, status) => {
      if (status) {
        this.block = block
        this.show(reference)
        this.search(block.text.substring(1)) // remove `@` char
      } else {
        this.hide()
      }
    })
  }

  search (text) {
    const { contentState } = this.muya
    const canInserFrontMatter = contentState.canInserFrontMatter(this.block)
    const obj = deepCopy(quickInsertObj)
    if (!canInserFrontMatter) {
      obj['basic block'].splice(2, 1)
    }
    let result = obj
    if (text !== '') {
      result = {}
      Object.keys(obj).forEach(key => {
        result[key] = filter(obj[key], text, { key: 'title' })
      })
    }
    this.renderObj = result
    this.render()
  }

  selectItem (item) {
    const { contentState } = this.muya
    this.block.text = ''
    const { key } = this.block
    const offset = 0
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    switch (item.label) {
      case 'paragraph':
        contentState.partialRender()
        break
      default:
        contentState.updateParagraph(item.label, true)
        break
    }
    // delay hide to avoid dispatch enter hander
    setTimeout(this.hide.bind(this))
  }

  getItemElement (item) {
    const { label } = item
    return this.scrollElement.querySelector(`[data-label="${label}"]`)
  }
}

export default QuickInsert
