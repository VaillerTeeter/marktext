import path from 'path'
import { shell } from 'electron'
import { isFile } from 'common/filesystem'
import * as actions from '../actions/help'
import { checkUpdates } from '../actions/marktext'

/// Check whether the package is updatable at runtime.
const isUpdatable = () => {
  // TODO: If not updatable, allow to check whether there is a new version available.

  const resFile = isFile(path.join(process.resourcesPath, 'app-update.yml'))
  if (!resFile) {
    // No update resource file available.
    return false
  } else if (process.env.APPIMAGE) {
    // We are running as AppImage.
    return true
  } else if (process.platform === 'win32' && isFile(path.join(process.resourcesPath, 'md.ico'))) {
    // Windows is a little but tricky. The update resource file is always available and
    // there is no way to check the target type at runtime (electron-builder#4119).
    // As workaround we check whether "md.ico" exists that is only included in the setup.
    return true
  }

  // Otherwise assume that we cannot perform an auto update (standalone binary, archives,
  // packed for package manager).
  return false
}

export default function (userPreference) {
  const { language = 'en' } = (userPreference && userPreference.getAll()) || {}
  const locales = { en: require('../../../renderer/locales/en').default, 'zh-CN': require('../../../renderer/locales/zh-CN').default }
  const translate = (key, locale, fallback) => {
    const bundle = locales[locale] || locales.en
    const value = key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), bundle)
    return typeof value === 'string' ? value : fallback
  }
  const t = (key, fallback) => translate(`menu.help.${key}`, language, fallback)
  const getLink = (key) => {
    const bundle = locales[language] || locales.en
    const link = bundle && bundle.menu && bundle.menu.help && bundle.menu.help.links && bundle.menu.help.links[key]
    return link && link.url ? link.url : null
  }

  const helpMenu = {
    label: t('label', '&Help'),
    role: 'help',
    submenu: [{
      label: t('quickStart', 'Quick Start...'),
      click () {
        const url = getLink('quickStart')
        if (url) shell.openExternal(url)
      }
    }, {
      label: t('markdownReference', 'Markdown Reference...'),
      click () {
        const url = getLink('markdownReference')
        if (url) shell.openExternal(url)
      }
    }, {
      label: t('changelog', 'Changelog...'),
      click () {
        const url = getLink('changelog')
        if (url) shell.openExternal(url)
      }
    }, {
      type: 'separator'
    }, {
      label: t('reportIssue', 'Report Issue or Request Feature...'),
      click () {
        const url = getLink('reportIssue')
        if (url) shell.openExternal(url)
      }
    }, {
      type: 'separator'
    }, {
      label: t('website', 'Website...'),
      click () {
        const url = getLink('website')
        if (url) shell.openExternal(url)
      }
    }, {
      label: t('watchOnGithub', 'Watch on GitHub...'),
      click () {
        const url = getLink('watchOnGithub')
        if (url) shell.openExternal(url)
      }
    }, {
      label: t('followOnGithub', 'Follow us on Github...'),
      click () {
        const url = getLink('followOnGithub')
        if (url) shell.openExternal(url)
      }
    }, {
      type: 'separator'
    }, {
      label: t('license', 'License...'),
      click () {
        const url = getLink('license')
        if (url) shell.openExternal(url)
      }
    }]
  }

  if (isUpdatable()) {
    helpMenu.submenu.push({
      type: 'separator'
    }, {
      label: t('checkUpdates', 'Check for updates...'),
      click (menuItem, browserWindow) {
        checkUpdates(browserWindow)
      }
    })
  }

  if (process.platform !== 'darwin') {
    helpMenu.submenu.push({
      type: 'separator'
    }, {
      label: t('about', 'About MarkText...'),
      click (menuItem, browserWindow) {
        actions.showAboutDialog(browserWindow)
      }
    })
  }
  return helpMenu
}
