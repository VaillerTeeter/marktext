import { app } from 'electron'
import { showAboutDialog } from '../actions/help'
import * as actions from '../actions/marktext'
import { userSetting } from '../actions/marktext'
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

// macOS only menu.

export default function (keybindings, preferences) {
  const { language = 'en' } = (preferences && preferences.getAll()) || {}
  const t = (key, fallback) => translate(`menu.marktext.${key}`, language, fallback)
  
  return {
    label: t('label', 'MarkText'),
    submenu: [{
      label: t('about', 'About MarkText'),
      click (menuItem, focusedWindow) {
        showAboutDialog(focusedWindow)
      }
    }, {
      label: t('checkUpdates', 'Check for updates...'),
      click (menuItem, focusedWindow) {
        actions.checkUpdates(focusedWindow)
      }
    }, {
      label: t('preferences', 'Preferences'),
      accelerator: keybindings.getAccelerator('file.preferences'),
      click () {
        actions.userSetting()
      }
    }, {
      type: 'separator'
    }, {
      label: t('services', 'Services'),
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: t('hide', 'Hide MarkText'),
      accelerator: keybindings.getAccelerator('mt.hide'),
      click () {
        actions.osxHide()
      }
    }, {
      label: t('hideOthers', 'Hide Others'),
      accelerator: keybindings.getAccelerator('mt.hide-others'),
      click () {
        actions.osxHideAll()
      }
    }, {
      label: t('showAll', 'Show All'),
      click () {
        actions.osxShowAll()
      }
    }, {
      type: 'separator'
    }, {
      label: t('quit', 'Quit MarkText'),
      accelerator: keybindings.getAccelerator('file.quit'),
      click: app.quit
    }]
  }
}
