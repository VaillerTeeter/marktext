import { ipcRenderer, shell } from 'electron'
import notice from '../services/notification'
import en from '../locales/en'
import zhCN from '../locales/zh-CN'

const locales = {
  en,
  'zh-CN': zhCN
}

const translate = (key, locale, fallback) => {
  const bundle = locales[locale] || locales.en
  const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), bundle)
  return typeof value === 'string' ? value : fallback
}

const state = {}

const getters = {}

const mutations = {}

const actions = {
  LISTEN_FOR_NOTIFICATION ({ commit, rootState }) {
    const DEFAULT_OPTS = {
      title: 'Infomation',
      type: 'primary',
      time: 10000,
      message: 'You should never see this message'
    }

    ipcRenderer.on('mt::show-notification', (e, opts) => {
      const options = Object.assign(DEFAULT_OPTS, opts)

      notice.notify(options)
    })

    ipcRenderer.on('mt::pandoc-not-exists', async (e, opts) => {
      const options = Object.assign(DEFAULT_OPTS, opts)
      const language = (rootState && rootState.preferences && rootState.preferences.language) || 'en'
      const t = (key, fallback) => translate(`notification.pandoc.${key}`, language, fallback)
      options.title = t('title', options.title)
      options.message = t('message', options.message)
      options.showConfirm = true
      await notice.notify(options)
      shell.openExternal('http://pandoc.org')
    })
  }
}

export default { state, getters, mutations, actions }
