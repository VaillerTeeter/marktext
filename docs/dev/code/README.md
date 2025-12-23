# 内部文档（开发向）

这里是 MarkText 内部实现的“约定与机制”文档（WIP）。它们不面向最终用户，主要用于：

- 维护者快速理解关键约定（例如 IPC 通道命名规则）
- 新功能/重构时避免破坏既有协议与数据结构
- 帮助定位“应该去看哪个模块/哪类事件/哪套数据结构”

目前覆盖的主题包括：IPC 约定、命令系统、编辑器（renderer）侧的 tab / document state 结构，以及 Muya 的 block 附加属性等

## 1. 推荐阅读顺序

1. 先读 [Inter-Process Communication (IPC)（进程间通信）](IPC.md) —— 这是主进程/渲染进程之间通讯的基础
2. 再读 [Renderer / Editor（渲染进程编辑器与文档状态）](renderer/editor.md) —— 理解“打开文件 → 创建 tab → 维护文档状态”的数据流与关键字段（编码/换行/保存选项等）
3. 然后读 [Commands（命令系统）](COMMANDS.md) —— 理解命令面板/事件总线如何组织与执行命令
4. 最后读 [Block addition properties（块附加属性）](BLOCK_ADDITION_PROPERTY.md) —— 涉及编辑器内部 block/span 结构与特殊块（mermaid、数学公式等）的属性约定

## 2. 文档索引

- [Block addition properties（块附加属性）](BLOCK_ADDITION_PROPERTY.md)
	- 什么时候看：你在改编辑器内部数据结构、渲染特殊块（数学/流程图/表格等）或处理 block/span 的属性时
	- 你会学到：不同 block/span 类型允许的附加属性（例如 `functionType`、`lang`、list/heading/table 相关字段）

- [Commands（命令系统）](COMMANDS.md)
	- 什么时候看：你要新增/调整命令面板条目、让某个功能可通过 command palette 触发、或在运行期动态注册命令时
	- 你会学到：静态命令/动态命令的形态、root command 的要求（例如需要 `run`）、以及通过事件总线显示命令面板的方式

- [Inter-Process Communication (IPC)（进程间通信）](IPC.md)
	- 什么时候看：你要新增/修改主进程与渲染进程之间的事件通道，或在调试时需要确认事件参数签名
	- 关键约定（与当前仓库实现保持一致）：
		- 主进程 ↔ 渲染进程的 IPC channel 必须以 `mt::` 为前缀
		- `ipcMain.emit(...)` 仅用于“主进程内部事件”，不带 `mt::` 前缀，且参数列表不包含 `event`
		- 模拟渲染进程事件时需要提供 `event` 参数（文档内的示例会说明原因）

- [Renderer / Editor（渲染进程编辑器与文档状态）](renderer/editor.md)
	- 什么时候看：你在排查“打开文件后 tab 状态怎么来的”、或要改编码/换行/保存选项、以及 tab 切换时 UI/编辑器状态同步相关逻辑时
	- 你会学到：main 侧 `loadMarkdownFile` 的返回结构、`mt::open-new-tab` 的数据流、以及 renderer 侧 `createDocumentState/defaultFileState` 如何构造 tab/document state

提示：如果你在找“更宏观”的架构入口（主/渲染进程入口文件、调试端口、打开文件链路等），请优先参考 `docs/dev/ARCHITECTURE.md` 与 `docs/dev/DEBUGGING.md`
