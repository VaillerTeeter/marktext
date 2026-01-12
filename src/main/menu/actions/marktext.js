import axios from 'axios'
import { ipcMain, BrowserWindow, Menu, app, shell } from 'electron'
import Preference from '../../preferences'
import AppPaths from '../../app/paths'
import { COMMANDS } from '../../commands'
import { isOsx } from '../../config'

const UPDATE_REPO = process.env.MT_UPDATE_REPO || 'VaillerTeeter/marktext-maintained'
const RELEASE_API = `https://api.github.com/repos/${UPDATE_REPO}/releases/latest`
const RELEASE_PAGE = `https://github.com/${UPDATE_REPO}/releases`

let runningUpdate = false
let win = null
let cachedPreferences = null

const normalizeVersion = version => (version || '').replace(/^v/i, '').trim()

const extractVersion = raw => {
  if (!raw) return ''
  const match = raw.match(/(\d+\.\d+\.\d+(?:[-+][\w.-]+)?)/)
  return match ? match[1] : normalizeVersion(raw)
}

const isNewerVersion = (candidate, current) => {
  const toParts = value => normalizeVersion(value).split('.').map(num => parseInt(num, 10) || 0)
  const a = toParts(candidate)
  const b = toParts(current)
  const len = Math.max(a.length, b.length)

  for (let i = 0; i < len; i++) {
    const ai = a[i] || 0
    const bi = b[i] || 0
    if (ai > bi) return true
    if (ai < bi) return false
  }
  return false
}

const fetchLatestRelease = async () => {
  const { data } = await axios.get(RELEASE_API, {
    headers: {
      'User-Agent': `marktext/${app.getVersion()}`,
      Accept: 'application/vnd.github+json'
    },
    timeout: 1000
  })

  const tag = data.tag_name || ''
  const name = data.name || ''
  const latestVersion = extractVersion(name) || extractVersion(tag)
  const url = data.html_url || `${RELEASE_PAGE}/tag/${tag || name || ''}`

  return { latestVersion, url }
}

const getPreferences = () => {
  if (cachedPreferences && typeof cachedPreferences.getAll === 'function') {
    return cachedPreferences
  }

  if (global.MARKTEXT_PREFERENCES && typeof global.MARKTEXT_PREFERENCES.getAll === 'function') {
    cachedPreferences = global.MARKTEXT_PREFERENCES
    return cachedPreferences
  }

  try {
    // Fallback for very early calls before the accessor is initialized.
    cachedPreferences = new Preference(global.MARKTEXT_APP_PATHS || new AppPaths())
    return cachedPreferences
  } catch (err) {
    // Keep the app running even if preferences cannot be loaded.
    return { getAll: () => ({}) }
  }
}

ipcMain.on('mt::NEED_UPDATE', (e, { needUpdate, url }) => {
  runningUpdate = false

  if (needUpdate) {
    const target = url || RELEASE_PAGE
    shell.openExternal(target).catch(() => {})
  }
})

ipcMain.on('mt::check-for-update', e => {
  const win = BrowserWindow.fromWebContents(e.sender)
  checkUpdates(win)
})

// --------------------------------------------------------

const openSettingsWindow = category => {
  ipcMain.emit('app-create-settings-window', category)
}

export const userSetting = Object.assign(openSettingsWindow, {
  getAll: () => {
    const prefs = getPreferences()
    return typeof prefs.getAll === 'function' ? prefs.getAll() : {}
  }
})

export const checkUpdates = async browserWindow => {
  if (runningUpdate) return

  runningUpdate = true
  win = browserWindow
  const currentVersion = normalizeVersion(app.getVersion())

  try {
    const { latestVersion, url } = await fetchLatestRelease()

    if (latestVersion && isNewerVersion(latestVersion, currentVersion)) {
      win && win.webContents.send('mt::UPDATE_AVAILABLE', {
        key: 'notification.update.availableMessage',
        params: { latestVersion, currentVersion },
        url
      })
    } else {
      win && win.webContents.send('mt::UPDATE_NOT_AVAILABLE', {
        key: 'notification.update.notAvailableMessage',
        params: { currentVersion, latestVersion: latestVersion || currentVersion }
      })
    }
  } catch (error) {
    const msg = error && error.response && error.response.status
      ? `${error.response.status} ${error.response.statusText}`
      : (error && error.message) || error || 'Unknown error'

    win && win.webContents.send('mt::UPDATE_ERROR', {
      key: 'notification.update.errorMessage',
      params: { msg }
    })
  } finally {
    runningUpdate = false
  }
}

export const osxHide = () => {
  if (isOsx) {
    Menu.sendActionToFirstResponder('hide:')
  }
}

export const osxHideAll = () => {
  if (isOsx) {
    Menu.sendActionToFirstResponder('hideOtherApplications:')
  }
}

export const osxShowAll = () => {
  if (isOsx) {
    Menu.sendActionToFirstResponder('unhideAllApplications:')
  }
}

// --- Commands -------------------------------------------------------------

export const loadMarktextCommands = commandManager => {
  commandManager.add(COMMANDS.MT_HIDE, osxHide)
  commandManager.add(COMMANDS.MT_HIDE_OTHERS, osxHideAll)
}
