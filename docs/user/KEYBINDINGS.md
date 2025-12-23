# 快捷键（总览）

MarkText 支持通过 `keybindings.json` 覆盖（自定义）默认快捷键

- 文件位置：位于 [应用数据目录](APPLICATION_DATA_DIRECTORY.md) 下的 `keybindings.json`
- 格式：JSON 对象，键为 **命令 ID**，值为 **Electron Accelerator** 字符串
- 生效时机：启动时读取；修改后通常需要重启应用才能完全生效
- 安全模式：在安全模式（Safe Mode）下，MarkText 会忽略本地 `keybindings.json`

下面是一个示例：

```json
{
  "file.save": "CmdOrCtrl+Shift+S",
  "file.save-as": "CmdOrCtrl+S"
}
```

你也可以用空字符串取消某个命令的绑定：

```json
{
  "view.command-palette": ""
}
```

## 可用修饰键（Modifiers）

- `Cmd`（仅 macOS）
- `Option`（仅 macOS）
- `Ctrl`
- `Shift`
- `Alt`（在 macOS 上等同于 `Option`）

不建议绑定 `AltGr`，请使用 `Ctrl+Alt` 代替

## 可用按键（Keys）

- `0-9`、`A-Z`、`F1-F24` 以及 `/`、`#` 等标点符号
- `Plus`、`Space`、`Tab`、`Backspace`、`Delete`、`Insert`、`Return/Enter`、`Esc`、`Home`、`End`、`PrintScreen`
- `Up`、`Down`、`Left`、`Right`
- `PageUp`、`PageDown`
- 空字符串 `""`：用于取消（解绑）某个快捷键

## 规则与注意事项

- 只会接受“已存在的命令 ID”：如果 `keybindings.json` 里写了未知的命令 ID，会被忽略
- Accelerator 必须合法：无效的值会被忽略，并在日志/控制台中输出警告
- 不允许重复：如果你在 `keybindings.json` 中让两个不同命令使用同一个快捷键，配置会被视为无效（整份自定义配置可能不会被应用）
- 一个快捷键只应绑定一个命令：当你把某个快捷键分配给新的命令时，MarkText 可能会自动解绑原先占用该快捷键的默认命令，以避免冲突

## 各平台默认快捷键列表

- [macOS 快捷键](KEYBINDINGS_OSX.md)
- [Linux 快捷键](KEYBINDINGS_LINUX.md)
- [Windows 快捷键](KEYBINDINGS_WINDOWS.md)
