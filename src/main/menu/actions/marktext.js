import axios from 'axios'
import { ipcMain, BrowserWindow, Menu, app, shell } from 'electron'
import { COMMANDS } from '../../commands'
import { isOsx } from '../../config'

const UPDATE_REPO = process.env.MT_UPDATE_REPO || 'VaillerTeeter/marktext-maintained'
const RELEASE_API = `https://api.github.com/repos/${UPDATE_REPO}/releases/latest`
const RELEASE_PAGE = `https://github.com/${UPDATE_REPO}/releases`

let runningUpdate = false
let win = null

const normalizeVersion = version => (version || '').replace(/^v/i, '').trim()

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
    timeout: 10000
  })

  const tag = normalizeVersion(data.tag_name || data.name)
  const url = data.html_url || `${RELEASE_PAGE}/tag/${data.tag_name || data.name || ''}`

  return { latestVersion: tag, url }
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

export const userSetting = () => {
  ipcMain.emit('app-create-settings-window')
}

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
        params: { currentVersion }
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
