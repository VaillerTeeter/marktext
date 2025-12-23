# 偏好设置

MarkText 的偏好设置既可以在“设置窗口”里修改，也可以通过编辑 [应用数据目录](APPLICATION_DATA_DIRECTORY.md) 下的 `preferences.json` 手动修改

重要说明（基于当前实现行为）：

- `preferences.json` 由程序读写并进行 JSON Schema 校验；编辑时请确保 JSON 语法正确，否则可能导致启动失败或设置无法加载
- 程序启动时会以“出厂默认设置集合”为基准：
	- 自动补齐新增的设置项
	- 自动移除不再存在/不被支持的旧设置项
	因此不建议在文件中添加自定义的“额外 key”，它们通常会在后续启动时被清理
- 部分设置修改后可能需要重启才会完全生效（例如标题栏样式）
- 首次启动时，程序可能会根据系统深色/浅色外观自动把 `theme` 调整为更匹配的主题（以提升开箱体验）

下表的“默认值”以当前仓库的出厂默认配置为准（见 `static/preference.json`），并结合 `src/main/preferences/schema.json` 中的取值约束进行说明

## 通用（General）

| Key | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| autoSave | Boolean | false | 是否自动保存正在编辑的文件 |
| autoSaveDelay | Number | 5000 | 自动保存延迟（毫秒）。UI 范围为 1000 ~ 10000 |
| titleBarStyle | String | custom | 标题栏样式（仅 Windows / Linux）：`custom` 或 `native`。通常需要重启生效 |
| openFilesInNewWindow | Boolean | false | 从菜单/外部打开文件时是否在新窗口打开 |
| openFolderInNewWindow | Boolean | false | 从菜单打开文件夹时是否在新窗口打开 |
| zoom | Number | 1.0 | 缩放比例，范围 0.5 ~ 2.0（含） |
| hideScrollbar | Boolean | false | 是否隐藏滚动条 |
| wordWrapInToc | Boolean | false | TOC（目录）中是否启用自动换行 |
| fileSortBy | String | created | 打开文件夹时的文件排序字段：`created`（创建时间）、`modified`（修改时间）、`title`（标题）。（当前设置界面可能暂时不可用/禁用） |
| startUpAction | String | lastState | 启动后的动作：`folder`（打开默认目录）、`blank`（空白页）、`lastState`（恢复上次会话）。注意：当前 UI 可能暂时隐藏 `lastState` 选项，但该值仍可能存在于配置中 |
| defaultDirectoryToOpen | String | "" | 当 `startUpAction=folder` 时启动后要打开的目录路径 |
| language | String | en | 界面语言（当前构建默认/仅提供 `en`） |

## 编辑器（Editor）

| Key | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| fontSize | Number | 16 | 正文字号（px），范围 12~32 |
| lineHeight | Number | 1.6 | 行高，范围 1.2~2.0 |
| editorFontFamily | String | Open Sans | 正文字体（需符合字体名称格式） |
| editorLineWidth | String | "" | 编辑区域最大宽度。留空表示使用主题默认；否则可填如 `80ch`、`900px`、`80%` |
| codeFontSize | Number | 14 | 代码块字号（px），范围 12~28 |
| codeFontFamily | String | DejaVu Sans Mono | 代码块字体 |
| codeBlockLineNumbers | Boolean | true | 代码块行号开关（当前 UI 可能隐藏该选项，但配置项仍存在） |
| trimUnnecessaryCodeBlockEmptyLines | Boolean | true | 是否移除代码块首尾多余的空行 |
| autoPairBracket | Boolean | true | 输入时是否自动补全括号 |
| autoPairMarkdownSyntax | Boolean | true | 是否自动补全 Markdown 语法（例如成对符号） |
| autoPairQuote | Boolean | true | 是否自动补全引号 |
| endOfLine | String | default | 文件换行符：`default`（跟随系统）、`lf`、`crlf` |
| defaultEncoding | String | utf8 | 默认文件编码（枚举，见设置界面下拉选项） |
| autoGuessEncoding | Boolean | true | 打开文件时是否自动猜测文件编码 |
| trimTrailingNewline | Number（枚举） | 2 | 处理“文件末尾换行”的策略：`0` 去除所有结尾换行；`1` 强制保留且只保留一个结尾换行；`2` 保持原始文件风格（自动检测）；`3` 不做处理 |
| textDirection | String | ltr | 文本方向：`ltr`（从左到右）或 `rtl`（从右到左） |
| hideQuickInsertHint | Boolean | false | 是否隐藏“快速插入段落类型”的提示 |
| hideLinkPopup | Boolean | false | 鼠标悬停链接时是否隐藏链接弹出提示 |
| autoCheck | Boolean | false | 是否自动勾选相关任务（任务列表） |

## 图片（Image）

| Key | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| imageInsertAction | String | path | 插入/粘贴图片时的默认行为：`upload`（上传到图床）、`folder`（复制到本地目录）、`path`（保留原始路径）。更完整行为细节见 [IMAGES.md](IMAGES.md) |
| imagePreferRelativeDirectory | Boolean | false | 是否优先使用相对目录（通常为项目内的相对资源目录） |
| imageRelativeDirectoryName | String | assets | 相对图片目录名称（例如 `assets`） |

## Markdown

| Key | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| preferLooseListItem | Boolean | true | 列表是否偏好“松散列表项” |
| bulletListMarker | String（枚举） | - | 无序列表标记：`-`、`*`、`+` |
| orderListDelimiter | String（枚举） | . | 有序列表分隔符：`.` 或 `)` |
| preferHeadingStyle | String（枚举） | atx | 标题风格：`atx`（#）或 `setext`（= / -） |
| tabSize | Number | 4 | Tab 等价的空格数 |
| listIndentation | Enum | 1 | 列表缩进策略：`dfm`、`tab`，或数字 `1`~`4` |
| frontmatterType | String（枚举） | - | Front Matter 类型：`-`（YAML）、`+`（TOML）、`;`（JSON）、`{`（JSON） |
| superSubScript | Boolean | false | 是否启用 pandoc 的上标/下标扩展 |
| footnote | Boolean | false | 是否启用 pandoc 的脚注扩展 |
| isHtmlEnabled | Boolean | true | 是否允许/渲染 HTML |
| isGitlabCompatibilityEnabled | Boolean | false | 是否启用 GitLab 兼容模式 |
| sequenceTheme | String（枚举） | hand | 时序图主题：`hand` 或 `simple` |

## 主题（Theme）

| Key | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| theme | String | light | 主题名：`light`、`dark`、`graphite`、`material-dark`、`one-dark`、`ulysses`。注意：首次启动时可能根据系统外观自动切换到更匹配的主题 |
| autoSwitchTheme | Number（枚举） | 2 | 是否在启动时根据系统深色/浅色自动调整主题：`0` 启动时调整；`2` 从不自动调整。（`1` 目前未在 UI 中启用/保留值） |

## 拼写检查（Spelling）

| Key | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| spellcheckerEnabled | Boolean | false | 是否启用拼写检查 |
| spellcheckerNoUnderline | Boolean | false | 是否不对拼写错误加下划线 |
| spellcheckerLanguage | String | en-US | 拼写检查语言（形如 `en-US` 的语言标记） |

## 可通过文件编辑但会被会话/菜单覆盖的项

这部分 key 作为默认/回退值存在：当没有加载会话状态时会使用；但一旦你通过菜单切换显示状态，运行时状态会覆盖这些值

### 视图（View）

| Key | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| sideBarVisibility | Boolean | false | 侧边栏默认是否显示 |
| tabBarVisibility | Boolean | false | 标签栏默认是否显示 |
| sourceCodeModeEnabled | Boolean | false | 默认是否启用源码模式 |

### 文件系统 / 搜索（File system / Search）

| Key | 类型 | 默认值 | 说明 |
| --- | ---- | ------ | ---- |
| searchExclusions | Array&lt;String&gt; | [] | 搜索时要排除的 glob 模式列表 |
| searchMaxFileSize | String | "" | 搜索的最大文件大小（例如 `50K`、`10M`、`1G`；空字符串表示不限制） |
| searchIncludeHidden | Boolean | false | 是否搜索隐藏文件/目录 |
| searchNoIgnore | Boolean | false | 是否忽略 `.gitignore` 等忽略文件（true 表示“不尊重忽略文件”） |
| searchFollowSymlinks | Boolean | true | 是否跟随符号链接 |
| watcherUsePolling | Boolean | false | 文件监听是否使用轮询（在网络盘等场景可能需要，但可能增加 CPU 占用） |
