import { getCurrentWindow, Menu as RemoteMenu, MenuItem as RemoteMenuItem } from '@electron/remote'
import {
  SEPARATOR,
  NEW_FILE,
  NEW_DIRECTORY,
  COPY,
  CUT,
  PASTE,
  RENAME,
  DELETE,
  SHOW_IN_FOLDER
} from './menuItems'

export const createShowContextMenu = (
  remoteDeps = { getCurrentWindow, Menu: RemoteMenu, MenuItem: RemoteMenuItem },
  menuItems = { SEPARATOR, NEW_FILE, NEW_DIRECTORY, COPY, CUT, PASTE, RENAME, DELETE, SHOW_IN_FOLDER }
) => {
  const { getCurrentWindow: getWin, Menu, MenuItem } = remoteDeps

  return (event, hasPathCache) => {
    const menu = new Menu()
    const win = getWin()
    const CONTEXT_ITEMS = [
      menuItems.NEW_FILE,
      menuItems.NEW_DIRECTORY,
      menuItems.SEPARATOR,
      menuItems.COPY,
      menuItems.CUT,
      menuItems.PASTE,
      menuItems.SEPARATOR,
      menuItems.RENAME,
      menuItems.DELETE,
      menuItems.SEPARATOR,
      menuItems.SHOW_IN_FOLDER
    ]

    menuItems.PASTE.enabled = hasPathCache

    CONTEXT_ITEMS.forEach(item => {
      menu.append(new MenuItem(item))
    })
    menu.popup([{ window: win, x: event.clientX, y: event.clientY }])
  }
}

export const showContextMenu = (event, hasPathCache) =>
  createShowContextMenu()(event, hasPathCache)
