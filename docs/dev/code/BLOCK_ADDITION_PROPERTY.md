# Block addition properties（块附加属性）

本文描述的是 **Muya 编辑器内部 ContentState 的 block 节点**上，除 `type/text/children` 之外的“附加属性”

这些字段主要由 Markdown 导入阶段创建，并在渲染阶段用于：

- 识别特殊块（表格、代码块、frontmatter、mermaid/flowchart/数学块等）
- 决定 UI 行为（例如 table tools、容器块的编辑/预览结构、列表样式）
- 导出 Markdown/HTML 时正确还原结构

与当前维护版代码一致的关键入口：

- Markdown → ContentState：`src/muya/lib/utils/importMarkdown.js`
- 容器块（figure + pre + preview div）创建：`src/muya/lib/contentState/containerCtrl.js`
- 渲染时如何使用这些字段：`src/muya/lib/parser/render/renderBlock/renderContainerBlock.js`
- TOC 生成使用 `headingStyle`：`src/muya/lib/contentState/tocCtrl.js`

下面按 block `type` 分组列出字段、取值与用途

## 1. `span`

`span` 通常是“行内容/叶子内容”的承载者，会通过 `functionType` 区分“它此刻在表示什么”

### 1.1 `functionType`

- `languageInput`
  - 用途：代码块语言输入行（fenced code block 的 info string）
  - 创建处：`importMarkdown.js`（代码块 token）
- `footnoteInput`
  - 用途：脚注 identifier 输入/展示
  - 创建处：`importMarkdown.js`（`footnote_start`）
- `codeContent`
  - 用途：代码内容（包含普通代码块，以及容器块 pre 内的源码区域）
  - 典型父链：`pre` → `code` → `span(functionType=codeContent)`
- `cellContent`
  - 用途：表格单元格内容
  - 约束：父节点必须是 `th` 或 `td`
- `atxLine`
  - 用途：ATX 标题的“整行文本”（包含 `#` 前缀），用于保留原始输入形式
- `thematicBreakLine`
  - 用途：分隔线（hr）的 marker 行（例如 `---`）
- `paragraphContent`
  - 用途：段落内容；同时也是 setext 标题的内容承载（setext 的 marker 另存于 heading block 的 `marker` 字段）

### 1.2 `lang`

仅在部分 `span` 用作代码内容时出现（尤其是 `functionType=codeContent`）

- 取值：字符串（prismjs 语言名）或空字符串
- 来源：
  - 普通代码块：来自 Markdown fenced code info string
  - 容器块：由 `containerCtrl.js` 按 `functionType` 映射得到（例如 `multiplemath → latex`、`mermaid → yaml`、`html → markup`）

## 2. `div`（容器块预览区）

该 `div` 通常是 **容器块的预览区域**，其特点是：

- `editable: false`（渲染层会映射为 `contenteditable=false`）
- `functionType` 用于标识预览类型

### 2.1 `functionType`

用于容器块预览，取值与 `figure/pre` 的容器块类型一致：

- `multiplemath`
- `mermaid`
- `flowchart`
- `vega-lite`
- `sequence`
- `plantuml`
- `html`

创建处：`src/muya/lib/contentState/containerCtrl.js`（`createPreAndPreview`）

## 3. `figure`（容器块外层）

`figure` 是多种“复合块”的外层容器：

- 表格：`figure(functionType=table)` 包裹 `table`
- 脚注：`figure(functionType=footnote)`
- 容器块：`figure(functionType in {html,multiplemath,...})`，内部通常是 `pre + preview div`

### 3.1 `functionType`

- `table`
- `footnote`
- `html`
- `multiplemath`
- `mermaid`
- `flowchart`
- `vega-lite`
- `sequence`
- `plantuml`

### 3.2 `mathStyle`（仅 `multiplemath`）

- 用途：标记数学块风格/兼容模式
- 创建处：`src/muya/lib/contentState/containerCtrl.js`（`createContainerBlock`）

## 4. `pre`（代码/容器块源码区）

`pre` 用于两类情况：

1) 普通代码块（fenced/indent code）
2) 容器块（html/mermaid/flowchart/数学块等）的源码区（容器块内部的第一子块）

### 4.1 `functionType`

- 容器块（与 `figure/div` 同步）：`html`、`multiplemath`、`mermaid`、`flowchart`、`vega-lite`、`sequence`、`plantuml`
- 普通代码块：
  - `fencecode`
  - `indentcode`
- Frontmatter：
  - `frontmatter`

### 4.2 `lang`

- 普通代码块：来自 fenced code info string（可为空）
- 容器块：由 `containerCtrl.js` 内部映射表 `FUNCTION_TYPE_LANG` 决定（例如 `multiplemath → latex`）

### 4.3 `style`（仅 frontmatter）

frontmatter token 会携带 `style`（例如 YAML/TOML 等），会被保存在 `pre` 的属性里
创建处：`src/muya/lib/utils/importMarkdown.js`

## 5. `code`

### 5.1 `lang`

用于语法高亮（渲染层会拼接 `language-${lang}` class）

## 6. `ul` / `ol`

### 6.1 `listType`

- `bullet`：无序列表
- `task`：任务列表（checkbox list）
- `order`：有序列表（通常对应 `ol`）

### 6.2 `start`（仅 `ol`）

- 用途：有序列表起始编号（渲染层会写入 `<ol start="...">`）
- 取值：数字（来自 token，非法时会回退到 `1`）

## 7. `li`

### 7.1 `listItemType`

- `order`
- `bullet`
- `task`

注意：在导入阶段如果 token 带有 `checked` 字段，会强制把 `listItemType` 设为 `task`

### 7.2 `isLooseListItem`

- `true`：松散列表项（loose item）
- `false`：紧凑列表项（tight item）

该字段会影响渲染时添加的 class（tight/loose）

### 7.3 `bulletMarkerOrDelimiter`

- 无序列表 marker：`-`、`+`、`*`
- 有序列表 delimiter：`)` 或 `.`

渲染层会把它写到 `data-marker`，用于样式/行为

## 8. `h1` ~ `h6`

### 8.1 `headingStyle`

- `atx`：`# Heading`
- `setext`：
  - `Heading`\n`-----`

TOC 生成（`tocCtrl.js`）会根据 `headingStyle` 选择如何从 `span.text` 中提取标题内容

### 8.2 `marker`（仅 setext）

- 用途：保存 setext 下划线 marker（例如 `---` 或 `===`）

## 9. `input`

任务列表 checkbox

- `checked`: `true | false`

## 10. `table`

表格节点本身会记录表格的“最大行/列索引”（用于 table drag bar、选择等逻辑）

- `row`：最后一行的索引（0 基；0 通常表示表头行）
- `column`：最后一列的索引（0 基）

创建处：

- Markdown 导入：`src/muya/lib/utils/importMarkdown.js`
- UI 插入表格：`src/muya/lib/contentState/tableBlockCtrl.js`（`createTableInFigure`）

## 11. `th` / `td`

- `align`：`left | center | right | ''`
- `column`：列索引（0 基）

渲染层会将 `align` 转换为 `style="text-align:..."`，并将 `column` 写入 `data-column`
