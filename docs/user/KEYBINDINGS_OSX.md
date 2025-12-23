# macOS 快捷键

这里列出 MarkText 在 macOS 下的默认快捷键

如果你想自定义快捷键（例如修改/新增/解绑），请先阅读通用说明：[通用快捷键说明](KEYBINDINGS.md)

注意：macOS 上单独使用 <kbd>Option</kbd>（不包含 <kbd>Command</kbd>）配合字母/数字通常会输入特殊字符；并且当前快捷键管理器也会禁止这类组合键。因此本文档的默认快捷键主要以 <kbd>Command</kbd>、<kbd>Command</kbd>+<kbd>Option</kbd> 等形式出现

## 菜单中的快捷键

#### MarkText 菜单

| Id                 | Default                                           | Description                            |
| ------------------ | ------------------------------------------------- | -------------------------------------- |
| `mt.hide`          | <kbd>Command</kbd>+<kbd>H</kbd>                   | 隐藏 MarkText                          |
| `mt.hide-others`   | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>H</kbd> | 隐藏除 MarkText 之外的其他窗口         |
| `file.preferences` | <kbd>Command</kbd>+<kbd>,</kbd>                   | 打开设置窗口                           |
| `file.quit`        | <kbd>Command</kbd>+<kbd>Q</kbd>                   | 退出 MarkText                          |

#### 文件 菜单

| Id                  | Default                                          | Description                           |
|:------------------- | ------------------------------------------------ | ------------------------------------- |
| `file.new-window`   | <kbd>Command</kbd>+<kbd>N</kbd>                  | 新建窗口                              |
| `file.new-tab`      | <kbd>Command</kbd>+<kbd>T</kbd>                  | 新建标签页                            |
| `file.open-file`    | <kbd>Command</kbd>+<kbd>O</kbd>                  | 打开 Markdown 文件                    |
| `file.open-folder`  | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> | 打开文件夹                            |
| `file.save`         | <kbd>Command</kbd>+<kbd>S</kbd>                  | 保存                                  |
| `file.save-as`      | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> | 另存为…                               |
| `file.move-file`    | -                                                | 将当前文件移动到其他位置              |
| `file.rename-file`  | -                                                | 重命名当前文件                        |
| `file.print`        | -                                                | 打印当前标签页                        |
| `file.close-tab`    | <kbd>Command</kbd>+<kbd>W</kbd>                  | 关闭标签页                            |
| `file.close-window` | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>W</kbd> | 关闭窗口                              |

#### 编辑 菜单

| Id                        | Default                                           | Description                                     |
|:------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| `edit.undo`               | <kbd>Command</kbd>+<kbd>Z</kbd>                   | 撤销上一步操作                                  |
| `edit.redo`               | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>  | 重做上一步操作                                  |
| `edit.cut`                | <kbd>Command</kbd>+<kbd>X</kbd>                   | 剪切选中文本                                    |
| `edit.copy`               | <kbd>Command</kbd>+<kbd>C</kbd>                   | 复制选中文本                                    |
| `edit.paste`              | <kbd>Command</kbd>+<kbd>V</kbd>                   | 粘贴                                            |
| `edit.copy-as-markdown`   | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd>  | 将选中文本复制为 Markdown                        |
| `edit.copy-as-html`       | -                                                 | 将选中文本复制为 HTML                           |
| `edit.paste-as-plaintext` | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>  | 以纯文本方式粘贴                                |
| `edit.select-all`         | <kbd>Command</kbd>+<kbd>A</kbd>                   | 全选                                            |
| `edit.duplicate`          | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>D</kbd> | 复制当前段落                                    |
| `edit.create-paragraph`   | <kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>N</kbd>  | 在当前段落后新建一个段落                        |
| `edit.delete-paragraph`   | <kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>D</kbd>  | 删除当前段落                                    |
| `edit.find`               | <kbd>Command</kbd>+<kbd>F</kbd>                   | 查找                                            |
| `edit.find-next`          | <kbd>Cmd</kbd>+<kbd>G</kbd>                       | 查找下一个匹配项                                |
| `edit.find-previous`      | <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>G</kbd>      | 查找上一个匹配项                                |
| `edit.replace`            | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>F</kbd> | 替换                                            |
| `edit.find-in-folder`     | <kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>F</kbd>  | 在打开的文件夹中查找                            |
| `edit.screenshot`         | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>A</kbd> | 截图（仅 macOS）                                |

#### 段落 菜单

| Id                          | Default                                           | Description                              |
| --------------------------- | ------------------------------------------------- | ---------------------------------------- |
| `paragraph.heading-1`       | <kbd>Command</kbd>+<kbd>1</kbd>                   | 将当前行设为 1 级标题                     |
| `paragraph.heading-2`       | <kbd>Command</kbd>+<kbd>2</kbd>                   | 将当前行设为 2 级标题                     |
| `paragraph.heading-3`       | <kbd>Command</kbd>+<kbd>3</kbd>                   | 将当前行设为 3 级标题                     |
| `paragraph.heading-4`       | <kbd>Command</kbd>+<kbd>4</kbd>                   | 将当前行设为 4 级标题                     |
| `paragraph.heading-5`       | <kbd>Command</kbd>+<kbd>5</kbd>                   | 将当前行设为 5 级标题                     |
| `paragraph.heading-6`       | <kbd>Command</kbd>+<kbd>6</kbd>                   | 将当前行设为 6 级标题                     |
| `paragraph.upgrade-heading` | <kbd>Command</kbd>+<kbd>Plus</kbd>                | 提升标题级别                              |
| `paragraph.degrade-heading` | <kbd>Command</kbd>+<kbd>-</kbd>                   | 降低标题级别                              |
| `paragraph.table`           | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>  | 插入表格                                  |
| `paragraph.code-fence`      | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>C</kbd> | 插入代码块                                |
| `paragraph.quote-block`     | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>Q</kbd> | 插入引用块                                |
| `paragraph.math-formula`    | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>M</kbd> | 插入数学公式块                            |
| `paragraph.html-block`      | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>J</kbd> | 插入 HTML 块                              |
| `paragraph.order-list`      | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>O</kbd> | 插入有序列表                              |
| `paragraph.bullet-list`     | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>U</kbd> | 插入无序列表                              |
| `paragraph.task-list`       | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>X</kbd> | 插入任务列表                              |
| `paragraph.loose-list-item` | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>L</kbd> | 将列表项转换为松散列表项                  |
| `paragraph.paragraph`       | <kbd>Command</kbd>+<kbd>0</kbd>                   | 将标题转换为普通段落                      |
| `paragraph.horizontal-line` | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>-</kbd> | 插入水平分割线                            |
| `paragraph.front-matter`    | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>Y</kbd> | 插入 YAML Front Matter 块                 |

#### 格式 菜单

| Id                    | Default                                          | Description                                     |
| --------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `format.strong`       | <kbd>Command</kbd>+<kbd>B</kbd>                  | 加粗选中文本                                    |
| `format.emphasis`     | <kbd>Command</kbd>+<kbd>I</kbd>                  | 斜体选中文本                                    |
| `format.underline`    | <kbd>Command</kbd>+<kbd>U</kbd>                  | 为选中文本添加下划线                            |
| `format.superscript`  | -                                                | 上标                                            |
| `format.subscript`    | -                                                | 下标                                            |
| `format.highlight`    | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd> | 高亮选中文本（使用 <mark> 标签）                |
| `format.inline-code`  | <kbd>Command</kbd>+<kbd>`</kbd>                  | 行内代码                                        |
| `format.inline-math`  | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> | 行内公式                                        |
| `format.strike`       | <kbd>Command</kbd>+<kbd>D</kbd>                  | 删除线                                          |
| `format.hyperlink`    | <kbd>Command</kbd>+<kbd>L</kbd>                  | 插入链接                                        |
| `format.image`        | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> | 插入图片                                        |
| `format.clear-format` | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> | 清除选中文本的格式                              |

#### 窗口 菜单

| Id                            | Default                                         | Description               |
| ----------------------------- | ----------------------------------------------- | ------------------------- |
| `window.minimize`             | <kbd>Command</kbd>+<kbd>M</kbd>                 | 最小化窗口                |
| `window.toggle-always-on-top` | -                                               | 切换窗口置顶              |
| `window.zoom-in`              | -                                               | 放大                      |
| `window.zoom-out`             | -                                               | 缩小                      |
| `window.toggle-full-screen`   | <kbd>Ctrl</kbd>+<kbd>Command</kbd>+<kbd>F</kbd> | 切换全屏                  |

#### 视图 菜单

| Id                      | Default                                           | Description                              |
| ----------------------- | ------------------------------------------------- | ---------------------------------------- |
| `view.command-palette`  | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>  | 打开/关闭命令面板                         |
| `view.source-code-mode` | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>S</kbd> | 切换到源码模式                            |
| `view.typewriter-mode`  | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>T</kbd> | 开启打字机模式                            |
| `view.focus-mode`       | <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd>  | 开启专注模式                              |
| `view.toggle-sidebar`   | <kbd>Command</kbd>+<kbd>J</kbd>                   | 显示/隐藏侧边栏                           |
| `view.toggle-tabbar`    | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>B</kbd> | 显示/隐藏标签栏                           |
| `view.toggle-toc`       | <kbd>Command</kbd>+<kbd>K</kbd>                   | 显示/隐藏目录（TOC）                      |
| `view.toggle-dev-tools` | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>I</kbd> | 打开/关闭开发者工具（仅调试模式）          |
| `view.dev-reload`       | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>R</kbd> | 重新加载窗口（仅调试模式）                |
| `view.reload-images`    | <kbd>Command</kbd>+<kbd>R</kbd>                   | 重新加载图片                              |

## 其他可用快捷键

#### 标签页

| Id                       | Default                                         | Description                  |
| ------------------------ | ----------------------------------------------- | ---------------------------- |
| `tabs.cycle-forward`     | <kbd>Ctrl</kbd>+<kbd>Tab</kbd>                  | 切换到下一个标签页            |
| `tabs.cycle-backward`    | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Tab</kbd> | 切换到上一个标签页            |
| `tabs.switch-to-left`    | <kbd>Command</kbd>+<kbd>PageUp</kbd>            | 将当前标签页向左移动          |
| `tabs.switch-to-right`   | <kbd>Command</kbd>+<kbd>PageDown</kbd>          | 将当前标签页向右移动          |
| `tabs.switch-to-first`   | <kbd>Ctrl</kbd>+<kbd>1</kbd>                    | 切换到第 1 个标签页           |
| `tabs.switch-to-second`  | <kbd>Ctrl</kbd>+<kbd>2</kbd>                    | 切换到第 2 个标签页           |
| `tabs.switch-to-third`   | <kbd>Ctrl</kbd>+<kbd>3</kbd>                    | 切换到第 3 个标签页           |
| `tabs.switch-to-fourth`  | <kbd>Ctrl</kbd>+<kbd>4</kbd>                    | 切换到第 4 个标签页           |
| `tabs.switch-to-fifth`   | <kbd>Ctrl</kbd>+<kbd>5</kbd>                    | 切换到第 5 个标签页           |
| `tabs.switch-to-sixth`   | <kbd>Ctrl</kbd>+<kbd>6</kbd>                    | 切换到第 6 个标签页           |
| `tabs.switch-to-seventh` | <kbd>Ctrl</kbd>+<kbd>7</kbd>                    | 切换到第 7 个标签页           |
| `tabs.switch-to-eighth`  | <kbd>Ctrl</kbd>+<kbd>8</kbd>                    | 切换到第 8 个标签页           |
| `tabs.switch-to-ninth`   | <kbd>Ctrl</kbd>+<kbd>9</kbd>                    | 切换到第 9 个标签页           |
| `tabs.switch-to-tenth`   | <kbd>Ctrl</kbd>+<kbd>0</kbd>                    | 切换到第 10 个标签页          |

#### 其他

| Id                | Default                         | Description            |
| ----------------- | ------------------------------- | ---------------------- |
| `file.quick-open` | <kbd>Command</kbd>+<kbd>P</kbd> | 打开快速打开对话框     |
