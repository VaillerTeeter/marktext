import { ipcMain, MenuItem } from 'electron'
import log from 'electron-log/main'
import { isOsx } from '../../config'
import { addToDictionary } from '../../spellchecker'
import { SEPARATOR } from './menuItems'
import en from '../../../renderer/locales/en'
import zhCN from '../../../renderer/locales/zh-CN'

const locales = {
  en,
  'zh-CN': zhCN
}

const translate = (key, locale, fallback) => {
  const bundle = locales[locale] || locales.en
  const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), bundle)
  return typeof value === 'string' ? value : fallback
}

const getLocale = () => {
  try {
    const { userSetting } = require('../../menu/actions/marktext')
    const prefs = userSetting.getAll()
    return prefs.language || 'en'
  } catch (e) {
    return 'en'
  }
}

const t = (key, fallback) => translate(`contextMenu.spelling.${key}`, getLocale(), fallback)

/**
 * Build the spell checker menu depending on input.
 *
 * @param {boolean} isMisspelled Whether a the selected word is misspelled.
 * @param {[string]} misspelledWord The selected word.
 * @param {[string[]]} wordSuggestions Suggestions for `selectedWord`.
 * @returns {MenuItem[]}
 */
export default (isMisspelled, misspelledWord, wordSuggestions) => {
  const spellingSubmenu = []

  spellingSubmenu.push(new MenuItem({
    label: t('changeLanguage', 'Change Language...'),
    // NB: On macOS the OS spell checker is used and will detect the language automatically.
    visible: !isOsx,
    click (menuItem, targetWindow) {
      targetWindow.webContents.send('mt::spelling-show-switch-language')
    }
  }))

  // Handle misspelled word if wordSuggestions is set, otherwise word is correct.
  if (isMisspelled && misspelledWord && wordSuggestions) {
    spellingSubmenu.push({
      label: t('addToDictionary', 'Add to Dictionary'),
      click (menuItem, targetWindow) {
        if (!addToDictionary(targetWindow, misspelledWord)) {
          log.error(`Error while adding "${misspelledWord}" to dictionary.`)
          return
        }
        // Need to notify Chromium to invalidate the spelling underline.
        targetWindow.webContents.replaceMisspelling(misspelledWord)
      }
    })

    if (wordSuggestions.length > 0) {
      spellingSubmenu.push(SEPARATOR)
      for (const word of wordSuggestions) {
        spellingSubmenu.push({
          label: word,
          click (menuItem, targetWindow) {
            targetWindow.webContents.send('mt::spelling-replace-misspelling', {
              word: misspelledWord,
              replacement: word
            })
          }
        })
      }
    }
  } else {
    spellingSubmenu.push({
      label: t('editDictionary', 'Edit Dictionary...'),
      click (menuItem, targetWindow) {
        ipcMain.emit('app-create-settings-window', 'spelling')
      }
    })
  }
  return spellingSubmenu
}
