# 便携模式（Portable Mode）

默认情况下，MarkText 会把用户配置与数据保存到 [应用数据目录](APPLICATION_DATA_DIRECTORY.md)。你也可以通过命令行参数 `--user-data-dir <path>` 显式指定用户数据目录

## Linux / Windows：自动检测便携目录

在 Linux 和 Windows 下，如果你没有传入 `--user-data-dir`，并且在应用程序目录附近存在名为 `marktext-user-data` 的文件夹，MarkText 会自动把它当作用户数据目录使用（便携模式自动检测）

典型的目录结构如下：

```
marktext-portable/
 ├── marktext (Linux) 或 MarkText.exe (Windows)
 ├── marktext-user-data/
 ├── resources/
 ├── THIRD-PARTY-LICENSES.txt
 └── ...
```

说明：

- `--user-data-dir` 的优先级高于自动检测；只要你显式传了该参数，就会使用你指定的目录
- 如果你传入的是相对路径，应用会将其解析为绝对路径后再使用
- 便携目录需要可写；如果目录不可写，应用可能无法正常启动或在运行中出错
