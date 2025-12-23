# 应用数据目录

MarkText 会把「每个用户」的配置与运行数据存放在一个用户数据目录中。默认情况下，该目录等同于 Electron 的 `app.getPath('userData')`

通常路径如下（不同打包方式/系统配置下可能略有差异）：

- Windows：`%APPDATA%\marktext`
- Linux：`$XDG_CONFIG_HOME/marktext` 或 `~/.config/marktext`
- macOS：`~/Library/Application Support/marktext`

## 这个目录里有什么？

以当前项目实现为准，常见内容包括：

- `preferences.json`：应用偏好设置（由 `electron-store` 持久化）
- `dataCenter.json`：数据中心（例如图床配置、最近使用的图片/资源记录等；敏感字段可能使用系统钥匙串存储）
- `keybindings.json`：用户自定义快捷键
- `logs/<YYYYM>/`：日志目录（例如 `main.log`、`editor-<windowId>.log`）
- `images/`、`screenshot/`：图片相关的默认存储目录（可在应用内设置中调整）
- `themes/export/`：导出主题相关文件（若使用过“导出主题/导出设置”）

如果你删除/清空该目录，MarkText 通常会在下次启动时重新生成默认配置（相当于“重置应用数据”）

## 便携模式与自定义目录

当启用 [便携模式](PORTABLE.md) 或显式指定用户数据目录时：

- 你可以用 `--user-data-dir <path>` 指定用户数据目录
- 如果未指定 `--user-data-dir`，并且在应用可执行文件附近存在 `marktext-user-data` 目录，MarkText 会自动使用它作为用户数据目录（便携模式的自动检测）
