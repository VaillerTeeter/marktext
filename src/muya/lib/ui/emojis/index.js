import { filter } from 'fuzzaldrin'
import activities from './categories/activities.json'
import animalsAndNature from './categories/animals-and-nature.json'
import flags from './categories/flags.json'
import foodAndDrink from './categories/food-and-drink.json'
import objects from './categories/objects.json'
import peopleAndBody from './categories/people-and-body.json'
import smileysAndEmotion from './categories/smileys-and-emotion.json'
import symbols from './categories/symbols.json'
import travelAndPlaces from './categories/travel-and-places.json'
import QQEmojis from './categories/qq-emojis.json'
import { CLASS_OR_ID } from '../../config'

const emojis = [
  ...QQEmojis
  // ...smileysAndEmotion,
  // ...peopleAndBody,
  // ...animalsAndNature,
  // ...foodAndDrink,
  // ...travelAndPlaces,
  // ...activities,
  // ...objects,
  // ...symbols,
  // ...flags
]

const emojisForSearch = {}

for (const emoji of emojis) {
  const newEmoji = Object.assign({}, emoji, { search: [...emoji.aliases, ...emoji.tags].join(' ') })
  if (emojisForSearch[newEmoji.category]) {
    emojisForSearch[newEmoji.category].push(newEmoji)
  } else {
    emojisForSearch[newEmoji.category] = [newEmoji]
  }
}

/**
 * check if one emoji code is in emojis, return undefined or found emoji
 */
export const validEmoji = text => {
  return emojis.find(emoji => {
    return emoji.aliases.includes(text)
  })
}

/**
 * check edit emoji
 */

export const checkEditEmoji = node => {
  if (node && node.classList.contains(CLASS_OR_ID.AG_EMOJI_MARKED_TEXT)) {
    return node
  }
  return false
}

class Emoji {
  constructor () {
    this.cache = new Map()
  }

  search (text) {
    const { cache } = this
    // When no query is provided, return all emojis grouped by category for full browsing.
    if (text === '' || text === undefined || text === null) {
      cache.set('', emojisForSearch)
      return emojisForSearch
    }
    if (cache.has(text)) return cache.get(text)
    const result = {}

    Object.keys(emojisForSearch).forEach(category => {
      const list = filter(emojisForSearch[category], text, { key: 'search' })
      if (list.length) {
        result[category] = list
      }
    })
    cache.set(text, result)
    return result
  }

  destroy () {
    return this.cache.clear()
  }
}

export default Emoji
