# 主题

MarkText 支持切换“应用主题”（影响应用 UI 与编辑器配色），目前提供内置主题列表，但暂不支持导入/安装“自定义应用主题”

## 内置应用主题

当前版本内置的应用主题包括：

- `light`
- `dark`
- `graphite`
- `material-dark`
- `one-dark`
- `ulysses`

你可以通过以下方式切换主题：

- 设置窗口：Preferences → Theme
- 菜单：Theme

主题选择会写入 [应用数据目录](APPLICATION_DATA_DIRECTORY.md) 下的 `preferences.json`（对应 key：`theme`）

## 跟随系统外观（可选）

`preferences.json` 中的 `autoSwitchTheme` 用于控制是否在启动时根据系统深色/浅色外观自动调整主题：

- `0`：在启动时自动调整
- `2`：从不自动调整

提示：首次启动时，程序可能会根据系统外观自动把 `theme` 调整为更匹配的主题

## 关于“自定义主题”和“导出主题”

- 自定义“应用主题”（导入/安装新的 UI 主题）：当前版本未对用户开放（设置界面中相关入口尚未启用）
- 导出主题（用于导出 HTML/PDF 等内容样式）：这是另一个能力，见 [EXPORT_THEMES.md](EXPORT_THEMES.md)
