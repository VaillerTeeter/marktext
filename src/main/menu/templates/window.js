import { Menu } from 'electron'
import { minimizeWindow, toggleAlwaysOnTop, toggleFullScreen } from '../actions/window'
import { zoomIn, zoomOut } from '../../windows/utils'
import { isOsx } from '../../config'
import en from '../../../renderer/locales/en'
import zhCN from '../../../renderer/locales/zh-CN'

const locales = { en, 'zh-CN': zhCN }

const translate = (key, locale, fallback) => {
  const bundle = locales[locale] || locales.en
  const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), bundle)
  return typeof value === 'string' ? value : fallback
}

export default function (keybindings, userPreference) {
  const { language = 'en' } = (userPreference && userPreference.getAll()) || {}
  const t = (key, fallback) => translate(`menu.window.${key}`, language, fallback)
  const menu = {
    label: t('label', '&Window'),
    role: 'window',
    submenu: [{
      label: t('minimize', 'Minimize'),
      accelerator: keybindings.getAccelerator('window.minimize'),
      click (menuItem, browserWindow) {
        minimizeWindow(browserWindow)
      }
    }, {
      id: 'alwaysOnTopMenuItem',
      label: t('alwaysOnTop', 'Always on Top'),
      type: 'checkbox',
      accelerator: keybindings.getAccelerator('window.toggle-always-on-top'),
      click (menuItem, browserWindow) {
        toggleAlwaysOnTop(browserWindow)
      }
    }, {
      type: 'separator'
    }, {
      label: t('zoomIn', 'Zoom In'),
      accelerator: keybindings.getAccelerator('window.zoom-in'),
      click (menuItem, browserWindow) {
        zoomIn(browserWindow)
      }
    }, {
      label: t('zoomOut', 'Zoom Out'),
      accelerator: keybindings.getAccelerator('window.zoom-out'),
      click (menuItem, browserWindow) {
        zoomOut(browserWindow)
      }
    }, {
      type: 'separator'
    }, {
      label: t('fullScreen', 'Show in Full Screen'),
      accelerator: keybindings.getAccelerator('window.toggle-full-screen'),
      click (item, browserWindow) {
        if (browserWindow) {
          toggleFullScreen(browserWindow)
        }
      }
    }]
  }

  if (isOsx) {
    menu.submenu.push({
      label: t('bringAllToFront', 'Bring All to Front'),
      click () {
        Menu.sendActionToFirstResponder('arrangeInFront:')
      }
    })
  }
  return menu
}
