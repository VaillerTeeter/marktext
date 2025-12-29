import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elementLocale from 'element-ui/lib/locale'
import dayjs from './util/day'

import en from './locales/en'
import zhCN from './locales/zh-CN'
import elEn from 'element-ui/lib/locale/lang/en'
import elZhCN from 'element-ui/lib/locale/lang/zh-CN'
import 'dayjs/esm/locale/zh-cn'

Vue.use(VueI18n)

const messages = {
  en,
  'zh-CN': zhCN
}

const elementLangPacks = {
  en: elEn,
  'zh-CN': elZhCN
}

const dayLocales = {
  en: 'en',
  'zh-CN': 'zh-cn'
}

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

export function setLocale (locale) {
  const nextLocale = messages[locale] ? locale : 'en'
  i18n.locale = nextLocale
  elementLocale.use(elementLangPacks[nextLocale] || elEn)
  dayjs.locale(dayLocales[nextLocale] || 'en')
}

export default i18n
