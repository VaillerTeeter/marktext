# 环境变量

本文档列出 MarkText 识别的环境变量（以当前仓库实现为准）。一般来说，只要设置为任意非空值（例如 `1`）即可生效

## 1. 运行期（启动/运行时生效）

| 名称 | 说明 |
| --- | --- |
| `MARKTEXT_DEBUG` | 启用调试模式。当前实现会打开一些仅在调试模式下可用的入口（例如菜单里的开发者工具相关项） |
| `MARKTEXT_DEBUG_KEYBOARD` | 在启用调试模式（`MARKTEXT_DEBUG` 或 `--debug`）时，输出更多键盘/布局相关调试信息 |
| `MARKTEXT_ERROR_INTERACTION` | 禁止弹出崩溃/异常错误对话框（主进程与渲染进程的未捕获异常提示都会被抑制）。用于自动化环境或不希望交互弹窗的场景|
| `MARKTEXT_EXIT_ON_ERROR` | 遇到第一个未捕获错误/异常时立即退出进程（用于调试与 CI） |
| `MARKTEXT_PANDOC` | 覆盖 `pandoc` 可执行文件路径。设置后会优先使用该路径；未设置时会在系统 `PATH` 中查找 `pandoc`。建议填写绝对路径，并确保该文件存在且可执行 |
| `MARKTEXT_RIPGREP_PATH` | 覆盖内置搜索使用的 `ripgrep`（`rg`）可执行文件路径。用于替换成自定义/更优化的 `rg` 版本；需要与当前平台/架构兼容，否则搜索功能可能失败 |

## 构建期（只在打包/开发构建时读取）

这些变量由构建脚本（webpack/electron-builder）读取，通常只对开发者/CI 有意义：

| 名称 | 说明 |
| --- | --- |
| `MARKTEXT_DEV_HIDE_BROWSER_ANALYZER` | 在非生产、非测试环境下，隐藏/禁用依赖体积分析器（Bundle Analyzer）插件 |
| `MARKTEXT_BUILD_VSCODE_DEBUG` | 在非生产环境下把 sourcemap 调整为 `inline-source-map`，用于修复 VS Code 调试断点定位 |
| `MARKTEXT_IS_STABLE` | **通常不需要手动设置。** 用于标识“稳定发布”：稳定发布的版本字符串不会追加 Git hash 后缀；同时在稳定发布中会抑制“渲染进程异常”弹窗（以减少用户干扰）。该值由 CI 在打包时注入 |
