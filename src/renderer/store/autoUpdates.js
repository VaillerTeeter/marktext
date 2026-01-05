import { ipcRenderer } from 'electron'
import notice from '../services/notification'
import i18n from '@/i18n'

const state = {}

const getters = {}

const mutations = {}

// mt::UPDATE_DOWNLOADED
const actions = {
  LISTEN_FOR_UPDATE ({ commit }) {
    const resolveMessage = (payload, fallbackKey, fallbackParams) => {
      if (payload && typeof payload === 'object' && payload.key) {
        try {
          return i18n.t(payload.key, payload.params || {})
        } catch (_) {
          return i18n.t(fallbackKey, fallbackParams || {})
        }
      }
      return payload || i18n.t(fallbackKey, fallbackParams || {})
    }

    ipcRenderer.on('mt::UPDATE_ERROR', (e, payload) => {
      const title = i18n.t('notification.update.errorTitle')
      const msg = resolveMessage(payload, 'notification.update.errorMessage', { msg: '' })
      notice.notify({ title, type: 'error', time: 10000, message: msg })
    })

    ipcRenderer.on('mt::UPDATE_NOT_AVAILABLE', (e, payload) => {
      const title = i18n.t('notification.update.notAvailableTitle')
      const msg = resolveMessage(payload, 'notification.update.notAvailableMessage')
      notice.notify({ title, type: 'primary', message: msg })
    })

    ipcRenderer.on('mt::UPDATE_DOWNLOADED', (e, payload) => {
      const title = i18n.t('notification.update.downloadedTitle')
      const msg = resolveMessage(payload, 'notification.update.downloadedMessage')
      notice.notify({ title, type: 'info', message: msg })
    })

    ipcRenderer.on('mt::UPDATE_AVAILABLE', (e, payload = {}) => {
      const title = i18n.t('notification.update.availableTitle')
      const msg = resolveMessage(payload, 'notification.update.availableMessage')
      const updateUrl = payload.url

      notice.notify({ title, type: 'primary', message: msg, showConfirm: true })
        .then(() => {
          ipcRenderer.send('mt::NEED_UPDATE', { needUpdate: true, url: updateUrl })
        })
        .catch(() => {
          ipcRenderer.send('mt::NEED_UPDATE', { needUpdate: false })
        })
    })
  }
}

export default { state, getters, mutations, actions }
