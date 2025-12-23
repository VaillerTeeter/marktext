# 常见问题（FAQ）

## 1. 支持哪些平台？

MarkText 是桌面应用。以当前仓库的打包配置（electron-builder）为准，发行包主要面向：

- Linux x64（当前配置产出 `.deb` 包）
- Windows x64（当前配置产出 `NSIS` 包）
- macOS arm64（当前配置产出 `.dmg` 包）

如果你使用的是社区/发行版提供的包（或自行构建），可用平台与最低系统版本可能会因 Electron 版本与打包方式不同而有所差异

## 2. MarkText 是开源且免费的吗？

是的。本项目使用 [MIT 协议](../../LICENSE)，可免费使用。源码仓库主页见：

- https://github.com/VaillerTeeter/marktext-maintained/

## 3. 我可以把 MarkText 当作笔记管理/笔记软件使用吗？

MarkText 主要是「纯 Markdown 编辑器」，不内置知识管理、标签体系等能力
不过，你依然可以借助内置的文件系统侧边栏（目录/文件浏览）与任务列表等功能，把 Markdown 文件组织成个人笔记

## 4. 文档在哪里？

文档位于仓库的 `docs/` 目录：

- [用户文档](README.md)
- [开发者文档](../dev/README.md)

## 5.  可以运行便携版（Portable）吗？

可以，请查看：

- [便携模式（Portable）](PORTABLE.md)

## 6. 如何反馈 Bug 或问题？

请到 GitHub Issue 里提交问题：

- https://github.com/VaillerTeeter/marktext-maintained/issues

为了更容易定位问题，建议在描述中包含：MarkText 版本号、操作系统版本、复现步骤，以及相关日志/截图
