// NOTE: This are mutable fields that may change at runtime.

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

const t = (key, fallback) => translate(`contextMenu.editor.${key}`, getLocale(), fallback)

export const CUT = {
  get label () { return t('cut', 'Cut') },
  id: 'cutMenuItem',
  role: 'cut'
}

export const COPY = {
  get label () { return t('copy', 'Copy') },
  id: 'copyMenuItem',
  role: 'copy'
}

export const PASTE = {
  get label () { return t('paste', 'Paste') },
  id: 'pasteMenuItem',
  role: 'paste'
}

export const COPY_AS_MARKDOWN = {
  get label () { return t('copyAsMarkdown', 'Copy As Markdown') },
  id: 'copyAsMarkdownMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-copy-as-markdown')
  }
}

export const COPY_AS_HTML = {
  get label () { return t('copyAsHtml', 'Copy As Html') },
  id: 'copyAsHtmlMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-copy-as-html')
  }
}

export const PASTE_AS_PLAIN_TEXT = {
  get label () { return t('pasteAsPlainText', 'Paste as Plain Text') },
  id: 'pasteAsPlainTextMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-paste-as-plain-text')
  }
}

export const INSERT_BEFORE = {
  get label () { return t('insertParagraphBefore', 'Insert Paragraph Before') },
  id: 'insertParagraphBeforeMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-insert-paragraph', 'before')
  }
}

export const INSERT_AFTER = {
  get label () { return t('insertParagraphAfter', 'Insert Paragraph After') },
  id: 'insertParagraphAfterMenuItem',
  click (menuItem, targetWindow) {
    targetWindow.webContents.send('mt::cm-insert-paragraph', 'after')
  }
}

export const SEPARATOR = {
  type: 'separator'
}
