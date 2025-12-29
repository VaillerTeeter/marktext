import BaseScrollFloat from '../baseScrollFloat'
import Emoji from '../emojis'
import { patch, h } from '../../parser/render/snabbdom'
import './index.css'

class EmojiPicker extends BaseScrollFloat {
  static pluginName = 'emojiPicker'

  constructor (muya) {
    const name = 'ag-emoji-picker'
    super(muya, name)
    this._renderObj = null
    this.renderArray = null
    this.activeItem = null
    this.activeCategory = null
    this.oldVnode = null
    this.emoji = new Emoji()
    this.listen()
  }

  get renderObj () {
    return this._renderObj
  }

  set renderObj (obj) {
    this._renderObj = obj
    const categories = Object.keys(obj)
    if (!categories.length) {
      this.renderArray = []
      this.activeItem = null
      this.activeCategory = null
      return
    }
    if (!this.activeCategory || !obj[this.activeCategory]) {
      this.activeCategory = categories[0]
    }
    const renderArray = []
    categories.forEach(key => {
      renderArray.push(...obj[key])
    })
    this.renderArray = renderArray
    const currentList = obj[this.activeCategory] || []
    if (currentList.length) {
      this.activeItem = currentList[0]
      const activeEle = this.getItemElement(this.activeItem)
      this.activeEleScrollIntoView(activeEle)
    } else {
      this.activeItem = this.renderArray[0] || null
    }
  }

  listen () {
    super.listen()
    const { eventCenter } = this.muya
    eventCenter.subscribe('muya-emoji-picker', ({ reference, emojiNode, text: explicitText }) => {
      if (!reference) return this.hide()

      // Priority: explicit text from dispatcher, otherwise fallback to the emoji node content.
      const text = typeof explicitText === 'string'
        ? explicitText.trim()
        : (emojiNode ? emojiNode.textContent.trim() : '')

      const renderObj = this.emoji.search(text)
      this.renderObj = renderObj
      const cb = item => {
        this.muya.contentState.setEmoji(item)
      }

      if (this.renderArray.length) {
        this.show(reference, cb)
        this.render()
      } else {
        this.hide()
      }
    })
  }

  render () {
    const { scrollElement, _renderObj, activeItem, oldVnode } = this
    const categories = Object.keys(_renderObj)
    const ensureActiveCategory = () => {
      if (!this.activeCategory || !_renderObj[this.activeCategory]) {
        this.activeCategory = categories[0]
      }
    }
    ensureActiveCategory()

    const tabs = h('div.tabs', categories.map(cat => {
      const selector = this.activeCategory === cat ? 'div.tab.active' : 'div.tab'
      return h(selector, {
        on: {
          click: () => {
            this.activeCategory = cat
            // Reset active item to first in category for clarity.
            const list = _renderObj[cat]
            if (list && list.length) {
              this.activeItem = list[0]
            }
            this.render()
          }
        }
      }, cat)
    }))

    const list = _renderObj[this.activeCategory] || []
    const title = h('div.title', this.activeCategory)
    const emojis = list.map(e => {
      const selector = activeItem === e ? 'div.item.active' : 'div.item'
      return h(selector, {
        dataset: { label: e.aliases[0] },
        props: { title: e.description },
        on: {
          click: () => {
            this.selectItem(e)
          }
        }
      }, h('span', e.emoji))
    })

    const vnode = h('div', [tabs, h('section', [title, h('div.emoji-wrapper', emojis)])])

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(scrollElement, vnode)
    }
    this.oldVnode = vnode
  }

  getItemElement (item) {
    const label = item.aliases[0]
    return this.floatBox.querySelector(`[data-label="${label}"]`)
  }

  destroy () {
    super.destroy()
    this.emoji.destroy()
  }
}

export default EmojiPicker
