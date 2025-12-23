# 调试（Debugging）说明

本文档说明如何在本仓库中调试 MarkText（Electron 主进程 + 渲染进程）

## 1. 调试模式判定（与代码一致）

MarkText 会在以下任一条件成立时开启“调试模式”（从而在菜单中显示/启用部分调试功能，例如 `View -> Toggle Developer Tools`）：

- 以开发模式运行（`NODE_ENV != production`，例如 `yarn run dev`）
- 启动参数包含 `--debug`
- 环境变量 `MARKTEXT_DEBUG` 为真

实现逻辑见：`src/main/app/env.js`

## 2. 使用 Visual Studio Code（推荐）

仓库内已提供 VS Code 调试配置（`.vscode/launch.json`），最简单的方式是直接运行复合任务：`Debug MarkText`

你可以：

- 在需要的位置打断点
- 使用 `debugger` 语句
- 同时调试：Electron 主进程（Main）与渲染进程（Renderer）

## 3.  端口说明（与启动脚本一致）

当你通过 `yarn run dev`（或 VS Code 的 `Debug MarkText`）启动时，开发启动脚本会为 Electron 增加以下参数（见 `.electron-vue/dev-runner.js`）：

- 主进程 Node Inspector：`--inspect=5858`
- 渲染进程远程调试：`--remote-debugging-port=8315`

如果你修改了这些端口，也需要同步更新 `.vscode/launch.json` 中的 attach 端口

## 4. 使用 Chrome / Edge Developer Tools

你可以通过两种方式打开开发者工具：

1) 应用内菜单（需要在调试模式下）：`View -> Toggle Developer Tools`

2) 通过浏览器远程连接：
- 渲染进程：在 Chrome/Edge 打开 `chrome://inspect`（或 `edge://inspect`），并配置/连接 `localhost:8315`
- 主进程：使用 `--inspect=5858` 后，可以用 VS Code Attach，或在 `chrome://inspect` 的 “Open dedicated DevTools for Node” 入口连接到 `localhost:5858`（不同浏览器版本入口位置可能略有差异）

## 5. 调试已构建的应用（打包产物）

你可以用 Electron 原生命令行参数对打包后的二进制开启调试端口：

```shell
marktext --debug --inspect=5858 --remote-debugging-port=8315
```

说明：

- `--debug` 用于启用应用内“调试模式”（让菜单中出现/启用开发者工具入口）
- `--inspect` / `--remote-debugging-port` 用于 VS Code 或浏览器远程调试

## 6. 分析启动变慢（Startup profiling）

无论是开发版本还是打包版本，都可以用 [node-profiler](https://github.com/fxha/node-profiler) 分析启动阶段耗时
按其说明完成安装后，建议在三个终端并行启动（最后启动 MarkText）：

```shell
node-profiler main
node-profiler renderer
marktext --debug --inspect=5858 --remote-debugging-port=8315
```

MarkText 成功启动后，在两个 `node-profiler` 终端按 `Ctrl+C` 停止采集，会生成 `main.cpuprofile` 与 `renderer.cpuprofile`
你可以在 *Chrome Developer Tools* 或 *Visual Studio Code* 中打开并分析这两个 profile 文件
