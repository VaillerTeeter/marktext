# 导出主题

导出主题用于控制 **导出 HTML / PDF** 等内容时的排版与样式（例如字体、字号、标题、表格、脚注等）

默认内置三套导出主题：

- Academic
- GitHub（默认）
- Liber（写作风格）

## 安装/加载自定义导出主题

你可以通过把 `.css` 文件放到用户数据目录下的 `themes/export/` 来安装自定义导出主题：

- 目录位置：`<userDataPath>/themes/export/`
- 说明：`<userDataPath>` 见 [应用数据目录](APPLICATION_DATA_DIRECTORY.md)

注意（按当前实现）：

- MarkText 会在你 **第一次打开“导出设置”对话框** 时扫描一次该目录并加载主题列表
- 如果你在应用运行期间才把 `.css` 文件复制进去，通常需要 **重启 MarkText**（或至少重启/重新加载窗口）才能让新主题出现在下拉列表中

## 创建自定义导出主题

“GitHub（默认）”主题作为基础风格始终可用；自定义导出主题通常是在该基础上 **追加 CSS 并覆盖默认规则**（例如改字体、调整标题下划线/间距等）

你可以参考：

- 内置示例：
  - `src/renderer/assets/themes/export/academic.theme.css`
  - `src/renderer/assets/themes/export/liber.theme.css`

（可选）GitHub Markdown 的基础样式可参考开源项目 `github-markdown-css`：

- https://github.com/sindresorhus/github-markdown-css/blob/gh-pages/github-markdown.css

### 主题名称（显示名）

自定义导出主题的“显示名称”来自 CSS 文件**第一行**的注释；允许的字符范围是 `A-z0-9 -`

如果第一行没有符合规则的注释，则会使用文件名作为显示名称

示例：

```css
/** Liber **/

.markdown-body {
  /* ... */
}
```
