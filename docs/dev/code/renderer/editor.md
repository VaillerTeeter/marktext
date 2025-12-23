# Renderer / Editor（渲染进程编辑器与文档状态）

本文记录 renderer 侧（`src/renderer/store/editor.js`）围绕“打开文件 → 创建 tab → 维护当前文档状态”的核心数据结构与流转链路

它回答两个常见问题：

1. 主进程把文件内容发给 renderer 时，数据长什么样？
2. renderer 侧 tab/document state 的最小必备字段是什么，哪些字段会影响保存/换行/编码行为？

相关实现入口：

- 主进程读取 Markdown 文件：`src/main/filesystem/markdown.js`（`loadMarkdownFile`）
- 主进程打开 tab 并发送到 renderer：`src/main/windows/editor.js`（`webContents.send('mt::open-new-tab', ...)`）
- renderer 监听新 tab：`src/renderer/store/editor.js`（`LISTEN_FOR_NEW_TAB` / `NEW_TAB_WITH_CONTENT`）
- renderer 文档 state 构造：`src/renderer/store/help.js`（`createDocumentState` / `defaultFileState`）

## 1. 数据流（打开文件）

典型链路：

1. main 侧读取文件得到 `IMarkdownDocumentRaw`（会进行编码识别、行尾规范化等）
2. main 侧通过 IPC 发送 `mt::open-new-tab` 给目标窗口的 renderer
3. renderer store 监听 `mt::open-new-tab`，调用 `NEW_TAB_WITH_CONTENT`
4. `NEW_TAB_WITH_CONTENT` 会把 `IMarkdownDocumentRaw + options` 合并后交给 `createDocumentState`，生成内部 `IDocumentState`，并加入 tabs

## 2. 内部数据结构

### 2.1 Encoding

文件编码在本仓库里不是一个简单字符串，而是一个对象：

```typescript
interface IEncoding {
  encoding: string
  isBom: boolean
}
```

该结构来自 `src/main/filesystem/encoding.js` 的猜测结果，并在保存时由 `writeMarkdownFile` 使用（`iconv-lite`）

### 2.2 Raw markdown document（主进程读文件后的原始文档）

这是 `loadMarkdownFile(...)` 的返回结构，会随 `mt::open-new-tab` 一起传给 renderer

```typescript
interface IMarkdownDocumentRaw {
  // Markdown 内容（注意：为了内部统一处理，读取后会尽可能规范化成 LF 缓冲区）
  markdown: string
  // 文件名
  filename: string
  // 绝对路径；空字符串表示“未落盘”的 untitled 文档
  pathname: string

  // 编码信息（用于保存/重新打开等）
  encoding: IEncoding
  // 文件期望的行尾：'lf' | 'crlf'
  lineEnding: 'lf' | 'crlf'
  // 保存时是否需要把内部 LF 缓冲区转换为 lineEnding（通常是 CRLF）
  adjustLineEndingOnSave: boolean
  // 末尾换行处理策略（见 defaultFileState）
  trimTrailingNewline: number

  // 读取阶段的额外信息：原文件是否混合换行（LF/CRLF 同时存在）
  isMixedLineEndings: boolean
}
```

实现对照：`src/main/filesystem/markdown.js`

要点：

- 内部编辑缓冲区倾向于使用 **LF** 统一处理；如果目标文件是 CRLF，则通过 `adjustLineEndingOnSave` 在保存时转换
- `isMixedLineEndings` 仅用于提示/通知：用户打开混合换行文件后会被规范化，并弹出 tab notification

### 2.3 Markdown document options（文档选项）

渲染侧在创建/保存时会频繁传递“选项子集”，其来源主要有两类：

- 从当前 tab state 提取（`getOptionsFromState`）
- 从用户偏好/当前窗口状态生成（例如新建 Untitled tab）

```typescript
interface IMarkdownDocumentOptions {
  encoding: IEncoding
  lineEnding: 'lf' | 'crlf'
  adjustLineEndingOnSave: boolean
  trimTrailingNewline: number
}
```

实现对照：`src/renderer/store/help.js`（`getOptionsFromState` / `defaultFileState`）

### 2.4 Document State（renderer 内部文档状态 / tab 状态）

renderer 的 tab 并不直接使用 `IMarkdownDocumentRaw`，而是使用内部状态对象（基于 `defaultFileState` 克隆并补齐）

```typescript
interface IDocumentState {
  // tab id（内部唯一）
  id: string

  // 是否已保存（是否存在未落盘修改）
  isSaved: boolean

  // 文件路径与内容
  pathname: string
  filename: string
  markdown: string

  // 保存相关选项
  encoding: IEncoding
  lineEnding: 'lf' | 'crlf'
  trimTrailingNewline: number
  adjustLineEndingOnSave: boolean

  // 编辑器状态
  history: {
    stack: any[]
    index: number
  }
  cursor: any | null

  // 衍生信息
  wordCount: {
    paragraph: number
    word: number
    character: number
    all: number
  }
  searchMatches: {
    index: number
    matches: any[]
    value: string
  }

  // tab 级通知（例如混合换行提示）
  notifications: any[]
}
```

实现对照：`src/renderer/store/help.js`（`defaultFileState` / `createDocumentState`）

## 3. View / Tabs（与当前实现相关的最小说明）

在 renderer store 中：

- `state.currentFile`：当前激活 tab
- `state.tabs`：所有打开 tab
- `state.listToc` / `state.toc`：TOC 的原始列表与树结构（由 `SET_TOC` 维护）

tab 的切换与 UI 更新通过事件总线触发：

- `SET_CURRENT_FILE` 会 `bus.$emit('file-changed', { id, markdown, cursor, renderCursor: true, history })`

实现对照：`src/renderer/store/editor.js`
