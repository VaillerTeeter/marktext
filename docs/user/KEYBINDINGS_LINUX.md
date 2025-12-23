# Linux 快捷键

本文列出 MarkText 在 Linux 上的默认快捷键

如果你想自定义快捷键（通过 `keybindings.json` 覆盖默认值），请先阅读 [快捷键（总览）](KEYBINDINGS.md)

> 说明（Linux 特别注意）：部分发行版（尤其是基于 Ubuntu 的桌面环境）对 `Ctrl+Alt`、`Alt` 等组合键有系统级保留快捷键
> 默认快捷键已尽量避开这类组合，但你的桌面环境/输入法仍可能产生冲突；如遇到冲突建议在 `keybindings.json` 中改为其他组合

## 菜单快捷键

#### File（文件）

| Id                  | 默认快捷键                                     | 说明                                  |
|:------------------- | --------------------------------------------- | ------------------------------------- |
| `file.new-window`   | <kbd>Ctrl</kbd>+<kbd>N</kbd>                  | 新建窗口                              |
| `file.new-tab`      | <kbd>Ctrl</kbd>+<kbd>T</kbd>                  | 新建标签页                            |
| `file.open-file`    | <kbd>Ctrl</kbd>+<kbd>O</kbd>                  | 打开 Markdown 文件                    |
| `file.open-folder`  | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> | 打开文件夹                            |
| `file.save`         | <kbd>Ctrl</kbd>+<kbd>S</kbd>                  | 保存                                  |
| `file.save-as`      | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> | 另存为…                               |
| `file.move-file`    | -                                             | 移动当前文件到其他位置                |
| `file.rename-file`  | -                                             | 重命名当前文件                        |
| `file.print`        | -                                             | 打印当前标签页                        |
| `file.preferences`  | <kbd>Ctrl</kbd>+<kbd>,</kbd>                  | 打开偏好设置                          |
| `file.close-tab`    | <kbd>Ctrl</kbd>+<kbd>W</kbd>                  | 关闭标签页                            |
| `file.close-window` | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>W</kbd> | 关闭窗口                              |
| `file.quit`         | <kbd>Ctrl</kbd>+<kbd>Q</kbd>                  | 退出 MarkText                         |

#### Edit（编辑）

| Id                        | 默认快捷键                                     | 说明                                            |
|:------------------------- | --------------------------------------------- | ----------------------------------------------- |
| `edit.undo`               | <kbd>Ctrl</kbd>+<kbd>Z</kbd>                  | 撤销                                            |
| `edit.redo`               | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> | 重做                                            |
| `edit.cut`                | <kbd>Ctrl</kbd>+<kbd>X</kbd>                  | 剪切选中文本                                    |
| `edit.copy`               | <kbd>Ctrl</kbd>+<kbd>C</kbd>                  | 复制选中文本                                    |
| `edit.paste`              | <kbd>Ctrl</kbd>+<kbd>V</kbd>                  | 粘贴                                            |
| `edit.copy-as-markdown`   | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd> | 将选中文本复制为 Markdown                        |
| `edit.copy-as-html`       | -                                             | 将选中文本复制为 HTML                            |
| `edit.paste-as-plaintext` | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> | 以纯文本方式粘贴                                |
| `edit.select-all`         | <kbd>Ctrl</kbd>+<kbd>A</kbd>                  | 全选                                            |
| `edit.duplicate`          | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd> | 复制当前段落                                    |
| `edit.create-paragraph`   | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd> | 在当前段落后创建新段落                          |
| `edit.delete-paragraph`   | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> | 删除当前段落                                    |
| `edit.find`               | <kbd>Ctrl</kbd>+<kbd>F</kbd>                  | 查找                                            |
| `edit.find-next`          | <kbd>F3</kbd>                                 | 查找下一个                                      |
| `edit.find-previous`      | <kbd>Shift</kbd>+<kbd>F3</kbd>                | 查找上一个                                      |
| `edit.replace`            | <kbd>Ctrl</kbd>+<kbd>R</kbd>                  | 替换                                            |
| `edit.find-in-folder`     | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> | 在已打开文件夹中查找                            |

#### Paragraph（段落）

| Id                          | 默认快捷键                                     | 说明                                     |
| --------------------------- | --------------------------------------------- | ---------------------------------------- |
| `paragraph.heading-1`       | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>1</kbd>   | 将当前行设为标题 1                         |
| `paragraph.heading-2`       | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>2</kbd>   | 将当前行设为标题 2                         |
| `paragraph.heading-3`       | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>3</kbd>   | 将当前行设为标题 3                         |
| `paragraph.heading-4`       | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>4</kbd>   | 将当前行设为标题 4                         |
| `paragraph.heading-5`       | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>5</kbd>   | 将当前行设为标题 5                         |
| `paragraph.heading-6`       | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>6</kbd>   | 将当前行设为标题 6                         |
| `paragraph.upgrade-heading` | <kbd>Ctrl</kbd>+<kbd>Plus</kbd>               | 提升标题级别                               |
| `paragraph.degrade-heading` | <kbd>Ctrl</kbd>+<kbd>-</kbd>                  | 降低标题级别                               |
| `paragraph.table`           | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> | 插入表格                                   |
| `paragraph.code-fence`      | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd> | 插入代码块                                 |
| `paragraph.quote-block`     | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Q</kbd> | 插入引用块                                 |
| `paragraph.math-formula`    | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>M</kbd>   | 插入数学公式块                             |
| `paragraph.html-block`      | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>H</kbd>   | 插入 HTML 块                               |
| `paragraph.order-list`      | <kbd>Ctrl</kbd>+<kbd>G</kbd>                  | 插入有序列表                               |
| `paragraph.bullet-list`     | <kbd>Ctrl</kbd>+<kbd>H</kbd>                  | 插入无序列表                               |
| `paragraph.task-list`       | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> | 插入任务列表                               |
| `paragraph.loose-list-item` | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> | 将列表项转换为松散列表项                   |
| `paragraph.paragraph`       | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd> | 将标题转换为普通段落                       |
| `paragraph.horizontal-line` | <kbd>Ctrl</kbd>+<kbd>_</kbd>                  | 插入分割线（等价于 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>-</kbd>） |
| `paragraph.front-matter`    | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Y</kbd> | 插入 YAML Front Matter 块                  |

#### Format（格式）

| Id                    | 默认快捷键                                     | 说明                                            |
| --------------------- | --------------------------------------------- | ----------------------------------------------- |
| `format.strong`       | <kbd>Ctrl</kbd>+<kbd>B</kbd>                  | 加粗                                            |
| `format.emphasis`     | <kbd>Ctrl</kbd>+<kbd>I</kbd>                  | 斜体                                            |
| `format.underline`    | <kbd>Ctrl</kbd>+<kbd>U</kbd>                  | 下划线                                          |
| `format.superscript`  | -                                             | 上标                                            |
| `format.subscript`    | -                                             | 下标                                            |
| `format.highlight`    | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd> | 高亮（使用 <mark> 标签）                        |
| `format.inline-code`  | <kbd>Ctrl</kbd>+<kbd>Y</kbd>                  | 行内代码                                        |
| `format.inline-math`  | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> | 行内数学公式                                    |
| `format.strike`       | <kbd>Ctrl</kbd>+<kbd>D</kbd>                  | 删除线                                          |
| `format.hyperlink`    | <kbd>Ctrl</kbd>+<kbd>L</kbd>                  | 插入链接                                        |
| `format.image`        | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> | 插入图片                                        |
| `format.clear-format` | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> | 清除格式                                        |

#### Window（窗口）

| Id                            | 默认快捷键                    | 说明                      |
| ----------------------------- | ---------------------------- | ------------------------- |
| `window.minimize`             | <kbd>Ctrl</kbd>+<kbd>M</kbd> | 最小化窗口                 |
| `window.toggle-always-on-top` | -                            | 切换窗口置顶               |
| `window.zoom-in`              | -                            | 放大                       |
| `window.zoom-out`             | -                            | 缩小                       |
| `window.toggle-full-screen`   | <kbd>F11</kbd>               | 切换全屏                   |

#### View（视图）

| Id                      | 默认快捷键                                     | 说明                                     |
| ----------------------- | --------------------------------------------- | ---------------------------------------- |
| `view.command-palette`  | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> | 打开/关闭命令面板                         |
| `view.source-code-mode` | <kbd>Ctrl</kbd>+<kbd>E</kbd>                  | 切换源代码模式                             |
| `view.typewriter-mode`  | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>G</kbd> | 启用打字机模式                             |
| `view.focus-mode`       | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd> | 启用专注模式                               |
| `view.toggle-sidebar`   | <kbd>Ctrl</kbd>+<kbd>J</kbd>                  | 显示/隐藏侧边栏                           |
| `view.toggle-tabbar`    | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> | 显示/隐藏标签栏                           |
| `view.toggle-toc`       | <kbd>Ctrl</kbd>+<kbd>K</kbd>                  | 显示/隐藏目录（TOC）                      |
| `view.toggle-dev-tools` | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd>   | 打开/关闭开发者工具（仅调试模式）          |
| `view.dev-reload`       | <kbd>Ctrl</kbd>+<kbd>F5</kbd>                 | 重新加载窗口（仅调试模式）                |
| `view.reload-images`    | <kbd>F5</kbd>                                 | 重新加载图片                              |

## 其他快捷键（不在菜单中）

#### Tabs（标签页）

| Id                       | 默认快捷键                                       | 说明                         |
| ------------------------ | ----------------------------------------------- | ---------------------------- |
| `tabs.cycle-forward`     | <kbd>Ctrl</kbd>+<kbd>Tab</kbd>                  | 切换到下一个标签页            |
| `tabs.cycle-backward`    | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Tab</kbd> | 切换到上一个标签页            |
| `tabs.switch-to-left`    | <kbd>Ctrl</kbd>+<kbd>PageUp</kbd>               | 切换到左侧标签页              |
| `tabs.switch-to-right`   | <kbd>Ctrl</kbd>+<kbd>PageDown</kbd>             | 切换到右侧标签页              |
| `tabs.switch-to-first`   | <kbd>Ctrl</kbd>+<kbd>1</kbd>                    | 切换到第 1 个标签页            |
| `tabs.switch-to-second`  | <kbd>Ctrl</kbd>+<kbd>2</kbd>                    | 切换到第 2 个标签页            |
| `tabs.switch-to-third`   | <kbd>Ctrl</kbd>+<kbd>3</kbd>                    | 切换到第 3 个标签页            |
| `tabs.switch-to-fourth`  | <kbd>Ctrl</kbd>+<kbd>4</kbd>                    | 切换到第 4 个标签页            |
| `tabs.switch-to-fifth`   | <kbd>Ctrl</kbd>+<kbd>5</kbd>                    | 切换到第 5 个标签页            |
| `tabs.switch-to-sixth`   | <kbd>Ctrl</kbd>+<kbd>6</kbd>                    | 切换到第 6 个标签页            |
| `tabs.switch-to-seventh` | <kbd>Ctrl</kbd>+<kbd>7</kbd>                    | 切换到第 7 个标签页            |
| `tabs.switch-to-eighth`  | <kbd>Ctrl</kbd>+<kbd>8</kbd>                    | 切换到第 8 个标签页            |
| `tabs.switch-to-ninth`   | <kbd>Ctrl</kbd>+<kbd>9</kbd>                    | 切换到第 9 个标签页            |
| `tabs.switch-to-tenth`   | <kbd>Ctrl</kbd>+<kbd>0</kbd>                    | 切换到第 10 个标签页           |

#### Misc（其他）

| Id                | 默认快捷键                    | 说明                   |
| ----------------- | ---------------------------- | ---------------------- |
| `file.quick-open` | <kbd>Ctrl</kbd>+<kbd>P</kbd> | 打开快速打开（Quick Open） |
