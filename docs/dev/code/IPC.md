# Inter-Process Communication (IPC)（进程间通信）

Electron 通过 `ipcMain` 与 `ipcRenderer` 提供主进程（main process）与渲染进程（renderer process）之间的异步通信能力

为了让“事件通道命名”和“参数签名”在整个项目中保持一致，本仓库对 IPC 做了以下约定（请务必遵守）

参考：

- Electron API：<https://www.electronjs.org/docs/latest/api/ipc-main>
- Electron API：<https://www.electronjs.org/docs/latest/api/ipc-renderer>

## 1. 本仓库的通道命名约定

1. **跨进程（main ↔ renderer）的 IPC channel 必须以 `mt::` 为前缀**
   - 例如：`mt::open-new-tab`、`mt::spellchecker-get-custom-dictionary-words`
2. **主进程内部事件（只在 main 内部流转）不要加 `mt::` 前缀**
   - 这类事件通常用 `ipcMain.emit(...)` 触发，用来当作 main 内部的事件总线
   - 例如：`app-open-file-by-id`、`screen-capture`、`broadcast-preferences-changed`

## 2. 关键点：参数签名差异

跨进程监听（`ipcMain.on` / `ipcRenderer.on`）的默认参数形态是：

- **main 侧监听 renderer 发来的事件**：`(event, ...args)`
- **renderer 侧监听 main 发来的事件**：`(event, ...args)`

而主进程内部事件（用 `ipcMain.emit` 触发）**不会带 `event` 参数**，监听参数形态为：

- **main 内部事件**：`(...args)`

因此：

- 你不能用 `ipcMain.emit('mt::xxx', ...)` 去“伪造”一个来自 renderer 的 IPC 事件；这会导致监听回调里的 `event` 变成 `undefined`，进而在访问 `event.sender` 等字段时崩溃
- 如果你确实要“模拟一个 renderer 事件”，必须提供一个有效的 `event` 对象；传 `null/undefined` 可能触发意外异常

## 3. 使用方式与示例

下面按“最常用的 3 种模式 + 1 个 main 内部事件模式”给出推荐写法，并附上本仓库真实存在的通道作为对照

### 3.1 renderer → main：`ipcRenderer.send` + `ipcMain.on`

renderer 侧发送：

```js
import { ipcRenderer } from 'electron'

ipcRenderer.send('mt::some-event-name', 'arg 1', 'arg 2')
```

main 侧监听（注意第一个参数是 `event`）：

```js
import { ipcMain } from 'electron'

ipcMain.on('mt::some-event-name', (event, arg1, arg2) => {
  // ...
  event.sender.send('mt::some-event-name-response', 'pong')
})
```

本仓库对照示例：

- `mt::open-file-by-window-id`（main 监听 renderer 请求打开文件）：`src/main/app/index.js`

### 3.2 main → renderer：`webContents.send` + `ipcRenderer.on`

main 侧发送：

```js
// browserWindow 是目标渲染进程对应的 BrowserWindow
browserWindow.webContents.send('mt::some-event-name', { any: 'payload' })
```

renderer 侧监听（注意第一个参数是 `event`）：

```js
import { ipcRenderer } from 'electron'

ipcRenderer.on('mt::some-event-name', (event, payload) => {
  // ...
})
```

本仓库对照示例：

- `mt::open-new-tab`（main 通知 renderer 新建 tab）：
  - 发送端：`src/main/windows/editor.js`（`browserWindow.webContents.send('mt::open-new-tab', ...)`）
  - 接收端：`src/renderer/store/editor.js`（`ipcRenderer.on('mt::open-new-tab', ...)`）

### 3.3 请求-响应（Promise）：`ipcRenderer.invoke` + `ipcMain.handle`

当你希望 renderer 调用 main 的能力，并且希望拿到返回值（Promise），优先使用 `invoke/handle`

renderer 侧：

```js
import { ipcRenderer } from 'electron'

const result = await ipcRenderer.invoke('mt::some-request', 'arg')
```

main 侧：

```js
import { ipcMain } from 'electron'

ipcMain.handle('mt::some-request', async (event, arg) => {
  return { ok: true }
})
```

本仓库对照示例：

- 拼写检查（spellchecker）：
  - main：`src/main/spellchecker/index.js` 使用 `ipcMain.handle('mt::spellchecker-...')`
  - renderer：`src/renderer/prefComponents/spellchecker/index.vue` 使用 `ipcRenderer.invoke('mt::spellchecker-...')`

### 3.4 main 内部事件总线：`ipcMain.emit` + `ipcMain.on`

当事件仅用于 main 内部解耦（菜单动作、窗口管理、watcher 等），可以用 `ipcMain.emit` 作为事件总线

```js
import { ipcMain } from 'electron'

ipcMain.on('some-main-event', (arg1, arg2) => {
  // 注意：这里没有 event 参数
})

ipcMain.emit('some-main-event', 'arg 1', 'arg 2')
```

本仓库对照示例：

- `app-open-file-by-id`：
  - 触发（main 内部）：菜单动作里会 `ipcMain.emit('app-open-file-by-id', win.id, resolvedPath)`
  - 监听（main 内部）：`src/main/app/index.js` 里 `ipcMain.on('app-open-file-by-id', (windowId, filePath) => ...)`

## 4. 常见坑与建议

- **不要把 `ipcRenderer.send(...)` 当成“给 renderer 自己发消息”**：`send` 是发往 main 的；main → renderer 要用 `webContents.send`
- **不要在跨进程通道里省略 `mt::` 前缀**：否则会混淆“跨进程通道”和“main 内部事件”，也会让排查困难
- **需要返回值时优先用 `invoke/handle`**：比起自己维护 `xxx-response` 频道更不易出错
- **当你在测试/命令里用 `ipcRenderer.emit(...)`**：注意这只是 `ipcRenderer` 这个 EventEmitter 在 renderer 进程内触发本地监听，不会跨进程发送（跨进程仍然要用 `ipcRenderer.send/invoke`）
