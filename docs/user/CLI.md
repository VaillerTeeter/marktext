# 命令行（CLI）

MarkText 支持通过命令行打开文件、查看版本信息、调整部分启动行为

## 1. 用法

```text
Usage: marktext [commands] [path ...]

    Available commands:

                --debug                   Enable debug mode
                --safe                    Disable plugins and other user configuration
        -n, --new-window              Open a new window on second-instance
                --user-data-dir           Change the user data directory
                --disable-gpu             Disable GPU hardware acceleration
                --disable-spellcheck      Disable built-in spellchecker
        -v, --verbose                 Be verbose
                --version                 Print version information
        -h, --help                    Print this help message
```

说明：上面这段帮助输出来自当前项目的真实实现（主进程启动参数解析与 `--help` 输出）

## 2. 常用示例

- 打开一个或多个 Markdown 文件：

    ```sh
    marktext /path/to/a.md /path/to/b.md
    ```

- 打印版本信息（包含 Node/Electron/Chromium/OS 信息）：

    ```sh
    marktext --version
    ```

- 设置更详细的日志（可重复 `-v` 提高详细程度，例如 `-vv`）：

    ```sh
    marktext -v
    marktext -vv
    ```

- 更改用户数据目录（也用于便携模式）：

    ```sh
    marktext --user-data-dir /path/to/marktext-user-data
    ```

    用户数据目录的默认位置与内容说明见：
    - [应用数据目录](APPLICATION_DATA_DIRECTORY.md)
    - [便携模式（Portable）](PORTABLE.md)

## 3. 参数说明（按当前实现对齐）

- `--debug`
    - 启用调试模式：会在菜单中启用与调试相关的入口（例如打开开发者工具等）

- `--safe`
    - 安全模式，用于排查启动/配置问题
    - 以当前版本实现为准：会跳过加载用户自定义快捷键（`keybindings.json`）等部分用户配置；其他“禁用插件”等行为可能随版本演进而变化

- `-n, --new-window`
    - **仅在“第二个实例启动”时生效**：当系统已存在一个 MarkText 实例，你再次从命令行启动时，若传入该参数，会强制在新窗口中打开本次传入的文件列表

- `--user-data-dir <path>`
    - 指定用户数据目录（必须是可写的绝对路径；相对路径会被解析为绝对路径）
    - 如果未指定该参数，并且应用可执行文件附近存在 `marktext-user-data` 目录，MarkText 会自动使用它（便携模式自动检测）

- `--disable-gpu`
    - 禁用 GPU 硬件加速（等价于 Electron 启动时禁用硬件加速）

- `--disable-spellcheck`
    - 禁用内置拼写检查

- `-v, --verbose`
    - 输出更详细的日志信息；可重复设置（例如 `-vv`）

- `--help`
    - 打印帮助并退出

## 4. `marktext` 命令在哪里？

不同平台/安装方式下可执行文件位置可能不同：

- Linux：通常可以直接使用 `marktext`（取决于你的安装方式是否把它加入了 `PATH`）
- Windows：通常是 `MarkText.exe`（可在安装目录下找到；PowerShell/CMD 使用时注意带上路径或把目录加入 `PATH`）
- macOS：可以创建一个方便的 alias（下面是常见路径示例，具体以你的安装位置为准）：

    ```sh
    alias marktext="/Applications/MarkText.app/Contents/MacOS/MarkText"
    ```
