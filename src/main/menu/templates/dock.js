import { app, Menu } from 'electron'
import * as actions from '../actions/file'
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

const { language = 'en' } = userSetting.getAll()
const t = (key, fallback) => translate(`menu.dock.${key}`, language, fallback)

const dockMenu = Menu.buildFromTemplate([{
  label: t('open', 'Open...'),
  click (menuItem, browserWindow) {
    if (browserWindow) {
      actions.openFile(browserWindow)
    } else {
      actions.newEditorWindow()
    }
  }
}, {
  label: t('clearRecent', 'Clear Recent'),
  click () {
    app.clearRecentDocuments()
  }
}])

export default dockMenu
