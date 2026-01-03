import en from '../../../renderer/locales/en'
import zhCN from '../../../renderer/locales/zh-CN'
import { userSetting } from '../actions/marktext'

const locales = {
  en,
  'zh-CN': zhCN
}

const translate = (key, locale, fallback) => {
  const bundle = locales[locale] || locales.en
  const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), bundle)
  return typeof value === 'string' ? value : fallback
}

export default function (keybindings, preferences) {
  const { language = 'en' } = (preferences && preferences.getAll()) || {}
  const t = (key, fallback) => translate(`menu.prefEdit.${key}`, language, fallback)
  
  return {
    label: t('label', 'Edit'),
    submenu: [{
      label: t('cut', 'Cut'),
      accelerator: keybindings.getAccelerator('edit.cut'),
      role: 'cut'
    }, {
      label: t('copy', 'Copy'),
      accelerator: keybindings.getAccelerator('edit.copy'),
      role: 'copy'
    }, {
      label: t('paste', 'Paste'),
      accelerator: keybindings.getAccelerator('edit.paste'),
      role: 'paste'
    }, {
      type: 'separator'
    }, {
      label: t('selectAll', 'Select All'),
      accelerator: keybindings.getAccelerator('edit.select-all'),
      role: 'selectAll'
    }]
  }
}
