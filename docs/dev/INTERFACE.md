# 界面结构（Interface）说明

本篇介绍 MarkText 的主界面构成，以及各区域在本仓库中的对应实现位置，便于维护与二次开发

## 1. 主界面

![主界面示意](assets/marktext-interface.png)

- 绿色：标题栏（Titlebar）
- 橙色：侧边栏（Sidebar）
- 红色：编辑区（Editor），包含顶部标签页与底部“当前标签通知条”

### 1.1 标题栏（Titlebar）

标题栏位于窗口顶部，用于展示当前文件路径/文件名、窗口菜单入口（在自定义标题栏模式下），以及窗口控制按钮

- macOS：主要依赖系统的窗口装饰（CSD / 原生标题栏风格）
- Linux/Windows：支持两种标题栏风格：
	- `custom`：自定义无边框样式（frameless），由渲染进程绘制标题栏、菜单按钮与窗口控制按钮
	- `native`：使用系统原生标题栏

相关配置项：

- `titleBarStyle`（枚举：`custom`/`native`），定义于 `src/main/preferences/schema.json`，渲染侧默认值在 `src/renderer/store/preferences.js`

对应代码位置：

- 标题栏组件：`src/renderer/components/titleBar/index.vue`
- 主进程窗口创建时对标题栏风格的处理：`src/main/windows/editor.js`

### 1.2 侧边栏（Sidebar）

侧边栏是可选区域，支持调整宽度，并通过左侧图标在不同面板间切换，当前实现中右侧面板有三类：

1) 文件树（Files）：展示当前打开的根目录树与相关文件信息
2) 文件夹内搜索（Search / Find in folder）：基于 ripgrep（`vscode-ripgrep`）在目录中查找
3) 目录（TOC / Table of contents）：显示当前文档的目录树并支持点击跳转

实现细节：

- 侧边栏当前面板由 `layout.rightColumn` 控制（值通常为 `files` / `search` / `toc`）
- 侧边栏显示/隐藏由 `layout.showSideBar` 控制
- 宽度最小值为 `220px`，并通过 `localStorage` 的 `side-bar-width` 做持久化

搜索能力（Find in folder）：

- 搜索 UI：`src/renderer/components/sideBar/search.vue`
- ripgrep 调用：`src/renderer/node/ripgrepSearcher.js`
- ripgrep 二进制路径：`src/renderer/node/paths.js`
	- 可用环境变量 `MARKTEXT_RIPGREP_PATH` 覆盖默认 ripgrep 路径（例如使用系统安装的更快版本）

目录（TOC）：

- TOC 组件：`src/renderer/components/sideBar/toc.vue`
- 偏好项 `wordWrapInToc` 控制 TOC 是否自动换行（定义于 `src/main/preferences/schema.json`，状态在 `src/renderer/store/preferences.js`）

对应代码位置：

- 侧边栏容器：`src/renderer/components/sideBar/index.vue`
- 侧边栏布局状态：`src/renderer/store/layout.js`

### 1.3 编辑区（Editor）

编辑区是核心区域，主要由三部分构成：

1) 标签栏（Tabs）：显示已打开文件的标签
2) 编辑器主体：
	 - 实时预览编辑器：Muya（WYSIWYG）
	 - 源码模式编辑器：CodeMirror（当启用 source code mode）
3) 标签通知条（Per-tab notifications）：用于提示当前标签相关事件（如文件被外部修改、删除等）

实现要点：

- 容器组件：`src/renderer/components/editorWithTabs/index.vue`
- 通知条组件：`src/renderer/components/editorWithTabs/notifications.vue`
- Muya 编辑器载入位置：`src/renderer/components/editorWithTabs/editor.vue`（`import Muya from 'muya/lib'`）
- 源码模式（CodeMirror）实现：
	- 视图组件：`src/renderer/components/editorWithTabs/sourceCode.vue`
	- CodeMirror 包装：`src/renderer/codeMirror/index.js`
- Muya 源码本体位于：`src/muya/`
