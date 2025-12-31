import * as actions from '../actions/theme'
import en from '../../../renderer/locales/en'
import zhCN from '../../../renderer/locales/zh-CN'

const locales = { en, 'zh-CN': zhCN }

const translate = (key, locale, fallback) => {
  const bundle = locales[locale] || locales.en
  const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), bundle)
  return typeof value === 'string' ? value : fallback
}

export default function (userPreference) {
  const { theme, language = 'en' } = userPreference.getAll()
  const t = (key, fallback) => translate(`menu.theme.${key}`, language, fallback)
  return {
    label: t('label', '&Theme'),
    id: 'themeMenu',
    submenu: [{
      label: t('cadmiumLight', 'Cadmium Light'),
      type: 'radio',
      id: 'light',
      checked: theme === 'light',
      click (menuItem, browserWindow) {
        actions.selectTheme('light')
      }
    }, {
      label: t('dark', 'Dark'),
      type: 'radio',
      id: 'dark',
      checked: theme === 'dark',
      click (menuItem, browserWindow) {
        actions.selectTheme('dark')
      }
    }, {
      label: t('graphiteLight', 'Graphite Light'),
      type: 'radio',
      id: 'graphite',
      checked: theme === 'graphite',
      click (menuItem, browserWindow) {
        actions.selectTheme('graphite')
      }
    }, {
      label: t('materialDark', 'Material Dark'),
      type: 'radio',
      id: 'material-dark',
      checked: theme === 'material-dark',
      click (menuItem, browserWindow) {
        actions.selectTheme('material-dark')
      }
    }, {
      label: t('oneDark', 'One Dark'),
      type: 'radio',
      id: 'one-dark',
      checked: theme === 'one-dark',
      click (menuItem, browserWindow) {
        actions.selectTheme('one-dark')
      }
    }, {
      label: t('ulyssesLight', 'Ulysses Light'),
      type: 'radio',
      id: 'ulysses',
      checked: theme === 'ulysses',
      click (menuItem, browserWindow) {
        actions.selectTheme('ulysses')
      }
    }]
  }
}
