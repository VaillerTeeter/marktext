# 项目架构（Project Architecture）

本文档描述 `marktext-maintained` 的目录结构、核心模块划分（Main/Renderer/Muya），以及主进程与渲染进程的通信方式与典型链路

## 1. 目录概览

> 说明：`.git/`、`node_modules/` 等目录体量巨大或由工具自动生成，本文只列出目录名，不展开其内部子项

- `.electron-vue/`：开发/构建的辅助脚本与 webpack 配置（electron-vue 体系）
  - `build.js`：生产构建脚本入口（打包 main/renderer）
  - `dev-client.js`：开发环境的渲染端 HMR/客户端引导
  - `dev-runner.js`：开发模式启动器（拉起 webpack + electron）
  - `marktextEnvironment.js`：开发/构建环境变量与路径约定
  - `postinstall.js`：依赖安装后的补充处理（如原生依赖/资源检查）
  - `preinstall.js`：依赖安装前的环境检查
  - `thirdPartyChecker.js`：第三方许可/依赖合规相关检查
  - `webpack.main.config.js`：主进程代码打包配置
  - `webpack.renderer.config.js`：渲染进程代码打包配置

- `.git/`：Git 元数据目录（版本控制内部使用）

- `.github/`：GitHub 协作与自动化配置
  - `ISSUE_TEMPLATE/`：Issue 模板（bug/feature/question）
  - `workflows/`：GitHub Actions 工作流（CI 构建/发布）
  - `CHANGELOG.md`：仓库层面的变更记录（供发布/追踪）
  - `CODE_OF_CONDUCT.md`：行为准则
  - `FUNDING.yml`：GitHub Sponsors/Funding 配置
  - `ISSUE_TEMPLATE.md`：旧版 Issue 模板入口（兼容）
  - `PULL_REQUEST_TEMPLATE.md`：PR 模板

- `.vscode/`：VS Code 工作区配置（调试/设置）
  - `launch.json`：调试配置（main attach / renderer attach 等）
  - `settings.json`：工作区级别编辑器设置

- `.editorconfig`：编辑器统一格式约定（缩进/换行等）
- `.eslintignore`：ESLint 忽略规则
- `.eslintrc.js`：ESLint 规则配置
- `.gitignore`：Git 忽略规则
- `.node-version`：建议的 Node.js 版本（供 nvm/asdf 等工具读取）

- `build/`：本地打包/构建产物目录（electron-builder 输出、解包后的应用等；通常不应提交）
- `dist/`：webpack 编译后的运行时代码（main/renderer 输出；用于运行/打包）
<!-- TODO: -->
- `docs/`：项目文档与图片资源（面向用户/开发者）
  - `assets/`：文档静态资源
  - `dev/`：开发者文档（构建/调试/架构/发布流程等）
  - `sponsor/`：赞助相关资源（如赞赏码图片）
  - `themeImages/`：主题预览图
  - `user/`：用户文档

- `node_modules/`：依赖目录（由包管理器生成）

- `resources/`：打包时用到的应用资源（图标、安装器脚本、桌面文件等）
  - `build/`：平台构建相关脚本/资源（例如 Windows release 辅助脚本）
  - `icons/`：应用图标（多尺寸）
  - `linux/`：Linux 桌面文件/appdata 等
  - `windows/`：Windows 安装器脚本
  - `THIRD-PARTY-LICENSES.txt`：第三方许可清单（随发行包分发）

- `src/`：源代码
  - `common/`：通用模块（仅依赖 Node.js API），可被 `main/` 与 `renderer/` 引用
  - `main/`：Electron 主进程（窗口/菜单/文件 IO/IPC/系统集成）
  - `muya/`：Muya 编辑器内核（实时预览/WYSIWYG；避免使用 Electron/Node API）
  - `renderer/`：渲染进程（Vue UI + Vuex；承载 Muya/源码模式编辑器）
  - `index.ejs`：渲染进程入口 HTML 模板（webpack 注入）

- `static/`：运行时静态资源（主题、默认配置、logo 等）
  - `.gitkeep`：占位文件（确保目录被 Git 跟踪）
  - `themes/`：内置主题资源
  - `logo-96px.png`：logo 资源
  - `logo-small.png`：logo 资源
  - `preference.json`：默认偏好设置模板

- `test/`：测试目录
  - `.eslintrc`：测试目录专用 lint 配置
  - `e2e/`：端到端测试
  - `specs/`：规格/回归类测试（按项目约定）
  - `unit/`：单元测试

- `test-results/`：测试运行的输出/缓存（例如 e2e 的最近一次运行信息）
  - `.last-run.json`：最近一次测试运行状态

- `tools/`：开发辅助脚本
  - `translator/`：翻译/多语言相关工具
  - `after-install.sh`：安装后的脚本（打包/CI 场景）
  - `deobfuscateStackTrace.js`：堆栈反混淆/辅助定位脚本
  - `generateThirdPartyLicense.js`：生成第三方许可文件
  - `validateLicenses.js`：校验依赖许可合规性

- `CONTRIBUTING.md`：贡献指南
- `LICENSE`：开源许可证
- `README.md`：项目主页说明（用户入口/开发入口）
- `babel.config.js`：Babel 配置
- `electron-builder.yml`：electron-builder 打包配置
- `package.json`：依赖与脚本入口（`yarn dev` / `yarn test` / `yarn release:*` 等）
- `vetur.config.js`：Vetur（Vue 工具链）配置
- `yarn.lock`：依赖锁文件（Yarn）

## 2. MarkText 组成简介

MarkText 是基于 Electron 的 Markdown 实时预览（WYSIWYG）编辑器，UI 使用 Vue/Vuex，整体可以拆成三块：

1) **Muya（编辑器内核）**：负责 WYSIWYG 编辑、Markdown 解析与渲染相关能力
2) **Main Process（主进程）**：负责 OS 级能力（文件系统、窗口、菜单、对话框、watcher 等），不要在主进程做长时间同步阻塞
3) **Renderer Process（渲染进程）**：负责 UI、状态管理与编辑器宿主，包含标签页、侧边栏、TOC、搜索等

> 说明：源码模式编辑器由 CodeMirror 提供，不属于 Muya，源码模式与 Muya 都运行在渲染进程中，数据以渲染侧的 tab/document state 为中心进行同步

## 3. 应用入口（Entry points）

本仓库的关键入口文件如下：

- 主进程入口：`src/main/index.js`
  - 初始化环境与日志、解析 CLI 参数、创建 `App` 实例并调用 `init()`
  - 开发模式下会先经过：`src/main/index.dev.js`（安装 Vue DevTools 后再 require `./index`）
- 渲染进程入口：`src/renderer/main.js`
  - 初始化 renderer 环境与全局对象、加载 Vue/ElementUI、挂载路由与 store

## 4. Muya 工作方式（高层概览）

Muya 位于 `src/muya/`，在渲染进程中作为“实时预览编辑器”使用，接入点在：

- `src/renderer/components/editorWithTabs/editor.vue`（`import Muya from 'muya/lib'`）

从维护视角可以把 Muya 理解为：

- 以 block 为中心的数据结构与编辑行为
- 解析（Markdown → tokens/blocks）与导出（blocks → Markdown/HTML）
- UI 插件/工具条（如图片工具、表格插入、emoji、quick insert 等）

> 注意：Muya 目录下不应使用 Electron/Node API；需要 OS 能力（如读写文件）应走主/渲染进程的对应服务与 IPC

## 5. 主进程与渲染进程通信（IPC）

主/渲染进程通过 Electron IPC 进行异步通信，约定：

- **主进程 ↔ 渲染进程** 的 channel 以 `mt::` 前缀命名
- **主进程内部** 使用 `ipcMain.emit(...)` 的事件通常不带 `mt::` 前缀

详细说明与示例见：[code/IPC.md](code/IPC.md)

## 6. 渲染进程（Editor Window）结构

渲染进程是“真正的编辑器窗口”，关键模块一般包括：

- 组件层：`src/renderer/components/`
  - 标题栏：`src/renderer/components/titleBar/index.vue`
  - 侧边栏：`src/renderer/components/sideBar/index.vue`（Files/Search/TOC 三面板）
  - 编辑区：`src/renderer/components/editorWithTabs/*`
- 状态管理：`src/renderer/store/`
  - tab/document state 与 IPC 监听：`src/renderer/store/editor.js`
  - 布局状态（侧边栏/标签栏开关、宽度）：`src/renderer/store/layout.js`

## 7. 示例：打开一个 Markdown 文件并渲染

本仓库当前的“打开文件”链路可以按以下步骤理解（文件与事件名与现有实现一致）：

1) 用户点击菜单 `File -> Open File`
   - 主进程侧菜单逻辑会解析路径，并触发主进程内部事件：`ipcMain.emit('app-open-file-by-id', win.id, resolvedPath)`（见 `src/main/menu/actions/file.js`）

2) `App` 在主进程监听 `app-open-file-by-id`，决定是否在新窗口打开，并找到目标编辑器窗口调用：`editor.openTab(filePath, {}, true)`
   - 监听位置：`src/main/app/index.js`

3) `EditorWindow` 读取文件内容
   - `EditorWindow.openTab/openTabs` 内部调用 `loadMarkdownFile(...)`（见 `src/main/windows/editor.js` 与 `src/main/filesystem/markdown.js`）
   - 成功后通过 IPC 把 raw document 发送到渲染进程：
     - `browserWindow.webContents.send('mt::open-new-tab', rawDocument, options, selected)`
   - 同时把文件加入 watcher（`watcher-watch-file`）用于监听外部变更

4) 渲染进程的 store 监听 `mt::open-new-tab`，创建 tab/document state 并渲染
   - 监听位置：`src/renderer/store/editor.js`（action：`LISTEN_FOR_NEW_TAB`）
   - 随后 UI 与编辑器（Muya / CodeMirror 源码模式）会根据当前 tab 状态展示内容

> 备注：当前体系更偏“用户交互驱动”，并非所有文本改动都有统一的高层 API；做自动化文本改写前，需要先评估 store 与编辑器同步点，避免引入状态漂移
