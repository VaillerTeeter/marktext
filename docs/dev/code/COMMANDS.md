# Commands（命令系统）

命令系统用于把“一个可执行的动作”统一抽象成 **command**，并通过 **Command Palette（命令面板）** 或事件触发执行

在本仓库里，命令主要发生在 **renderer（渲染进程）**：

- 命令面板 UI：`src/renderer/components/commandPalette/index.vue`
- 命令中心（维护 root command 与全部条目）：`src/renderer/store/commandCenter.js`
- 静态命令列表（编译期定义）：`src/renderer/commands/index.js`
- 命令描述映射（根据 id 生成 description）：`src/renderer/commands/descriptions.js`
- 事件总线（Vue 实例）：`src/renderer/bus/index.js`

## 1. 术语与整体流程

- **静态命令（static commands）**：在 `src/renderer/commands/index.js` 里以数组形式定义；通常只需要 `id` 与 `execute`
  - `description` 可以省略：文件末尾会用 `getCommandDescriptionById(id)`（来自 `descriptions.js`）补齐
- **运行期命令（runtime/dynamic commands）**：在运行期创建（通常是 class 实例），通过事件总线注册到命令中心：
  - 事件名是：`cmd::register-command`（注意是小写 `cmd`）

命令面板打开时，会选定一个“当前 root command”（默认是 CommandCenter 的 `rootCommand`），并调用其 `run()`：

- `run()` 负责准备 `subcommands`
- `search(query)`（可选）负责提供更复杂的搜索结果（例如 quick open）
- 执行时调用目标 command 的 `execute()`，或由父级 root 的 `executeSubcommand(...)` 统一处理

## 2. Command 对象的关键字段

以下字段是命令面板与命令中心会用到的核心属性（并非每个都必填）：

- `id`：唯一标识（用于 keybinding、执行、查找）
- `description`：显示文本（静态命令可由 `descriptions.js` 自动补齐）
- `execute()`：执行命令
- `run()`：当命令作为 root 展示时调用（用于填充 `subcommands`）
- `subcommands`：子命令数组（用于分组/二级菜单）
- `subcommandSelectedIndex`：默认选中的子命令索引（`-1` 表示无）
- `placeholder`：命令面板输入框 placeholder
- `title`：hover tooltip（UI 里绑定到了 `:title`）
- `shortcut`：快捷键展示（CommandCenter 会在收到 `mt::keybindings-response` 后填充）
- `search(query)`（可选）：自定义搜索器，返回子命令列表
- `unload()`（可选）：面板关闭时的清理逻辑
- `executeSubcommand(id, value?)`（可选）：如果 root 定义了该方法，子命令点击会走这里（而不是子命令自己的 `execute`）

## 3. 事件与执行入口（与当前实现对齐）

1）打开命令面板：

- renderer 内部：`bus.$emit('show-command-palette')`
- main → renderer：通过 IPC `mt::show-command-palette` 触发（见 `src/renderer/store/preferences.js`）

2）注册运行期命令：

- `bus.$emit('cmd::register-command', commandInstance)`
- 命令中心监听：`src/renderer/store/commandCenter.js`（`bus.$on('cmd::register-command', ...)`）

3）按 id 执行命令：

- renderer 内部：`bus.$emit('cmd::execute', commandId)`
- main → renderer：`mt::execute-command-by-id`（见 `src/renderer/store/commandCenter.js`）

## 4. 示例

### 4.1 静态命令（最小形态）

静态命令通常只提供 `id` 与 `execute`；`description` 会在 `src/renderer/commands/index.js` 末尾统一补齐

```js
{
  id: 'file.new-tab',
  execute: async () => {
    // 注意：这里用的是 ipcRenderer.emit(...)，它只是在 renderer 内部触发监听器，不会跨进程发送消息
    // 对照：src/renderer/store/editor.js 会监听 'mt::new-untitled-tab'
    ipcRenderer.emit('mt::new-untitled-tab', null)
  }
}
```

补充说明：

- `ipcRenderer.emit(...)` 是 renderer 内部的 EventEmitter 行为；它不会经过 main
- 如果你需要跨进程通信，请使用 `ipcRenderer.send(...)` / `ipcRenderer.invoke(...)`（详见 `IPC.md`）

### 4.2 运行期命令（通过事件总线注册）

运行期命令通常是 class（因为需要拿到 editor/state 等依赖），并通过 `cmd::register-command` 注册

本仓库的真实例子：

- `src/renderer/commands/quickOpen.js`
- `src/renderer/commands/fileEncoding.js`
- `src/renderer/commands/lineEnding.js`

一个简化的示例：

```js
import bus from '@/bus' // 实际路径：src/renderer/bus/index.js
import { delay } from '@/util'

export class ExampleCommand {
  constructor () {
    this.id = 'example-id'
    this.description = 'Example'
  }

  async execute () {
    // No-op
  }
}

export class ExampleRootCommand {
  constructor () {
    this.id = 'example-root'
    this.description = 'Example Root'
    this.placeholder = 'Type something...'
    this.subcommands = []
    this.subcommandSelectedIndex = -1
  }

  // 作为 root 展示时，命令面板会调用 run()
  run = async () => {
    this.subcommands = [
      {
        id: 'example-sub-1',
        description: 'Subcommand 1',
        execute: async () => {
          // No-op
        }
      },
      {
        id: 'example-sub-2',
        description: 'Subcommand 2',
        execute: async () => {
          // No-op
        }
      }
    ]
  }

  unload = () => {
    this.subcommands = []
  }

  execute = async () => {
    // 参考本仓库多个命令的做法：先关闭再打开，避免 UI 状态冲突
    await delay(100)
    bus.$emit('show-command-palette', this)
  }
}

// 注册：bus.$emit('cmd::register-command', new ExampleCommand())
```

## 5. 常见坑

- 文档里曾写成 `CMD::register-command`：本仓库实际事件名是 `cmd::register-command`
- `ipcRenderer.emit(...)` 不是跨进程：它只会触发 renderer 内部 `ipcRenderer.on(...)` 注册的监听器
- root command 必须保证 `run()` 可调用（命令面板打开时会调用 `currentCommand.run()`）
