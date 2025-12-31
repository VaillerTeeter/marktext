export default {
  common: {
    appName: 'MarkText'
  },
  export: {
    title: '导出选项',
    tabs: {
      info: '信息',
      page: '页面',
      style: '样式',
      theme: '主题',
      header: '页眉和页脚',
      toc: '目录',
      headerDescription: '如果定义了页眉和/或页脚，则该文本会出现在所有页面上。'
    },
    infoDescription: '请自定义页面外观，然后点击“导出”以继续。',
    labels: {
      pageTitle: '页面标题',
      pageSize: '页面大小',
      landscape: '横向排列',
      pageMargin: '页面边距（毫米）',
      topBottom: '上/下',
      leftRight: '左/右',
      theme: '主题',
      widthHeight: '宽度/高度（毫米）',
      headerType: '页眉类型',
      footerType: '页脚类型',
      headerLeft: '左侧页眉文本',
      headerMain: '页眉主文本',
      headerRight: '右侧页眉文本',
      footerLeft: '左侧页脚文本',
      footerMain: '页脚主文本',
      footerRight: '右侧页脚文本',
      overwriteThemeFontSettings: '覆盖主题字体设置',
      fontFamily: '字体',
      fontSize: '字号',
      lineHeight: '行高',
      autoNumberingHeadings: '自动编号标题',
      showFrontMatter: '显示 Front Matter',
      allowStyledHeaderFooter: '允许页眉和页脚使用样式',
      headerFooterFontSize: '页眉和页脚字号',
      headerFooterCustomize: '自定义样式',
      themeDescription: '你可以通过选择主题或创建自定义主题来改变文档外观。',
      exportButton: '导出...'
    },
    toc: {
      includeTopHeading: '包含顶部标题',
      includeTopHeadingNote: '包含第一级标题。',
      titleLabel: '标题'
    }
  },
  sidebar: {
    openedFiles: '打开的文件',
    saveAll: '全部保存',
    closeAll: '全部关闭',
    emptyProject: '工程为空',
    createFile: '创建文件',
    openFolder: '打开文件夹',
    searchPlaceholder: '在当前文件夹中搜索...',
    caseSensitive: '区分大小写',
    selectWholeWord: '整词匹配',
    useRegex: '把查询作为正则表达式',
    noFolderOpen: '未打开任何文件夹',
    noResultsFound: '未找到结果。',
    cancel: '取消',
    tocTitle: '目录',
    showMoreMatches: '显示更多匹配项',
    newFile: '新建文件',
    newDirectory: '新建目录',
    copy: '复制',
    cut: '剪切',
    paste: '粘贴',
    rename: '重命名',
    moveToTrash: '移动到回收站',
    showInFolder: '在文件夹中显示'
  },
  pref: {
    sidebar: {
      title: '偏好设置',
      searchPlaceholder: '搜索设置',
      categories: {
        general: '通用',
        editor: '编辑器',
        markdown: 'Markdown',
        spelling: '拼写',
        theme: '主题',
        image: '图片',
        keybindings: '快捷键'
      }
    },
    general: {
      title: '通用',
      autoSave: {
        title: '自动保存：',
        description: '自动保存文档更改',
        delay: '编辑后延迟多久自动保存'
      },
      window: {
        title: '窗口：',
        titleBarStyle: '标题栏样式',
        options: {
          custom: '自定义',
          native: '系统原生'
        },
        titleBarNote: '需要重启生效。',
        hideScrollbar: '隐藏滚动条',
        openFilesInNewWindow: '在新窗口打开文件',
        openFoldersInNewWindow: '在新窗口打开文件夹',
        zoom: '缩放'
      },
      sidebar: {
        title: '侧边栏：',
        wrapToc: '目录中自动换行',
        sortField: '打开文件夹时的文件排序字段'
      },
      startup: {
        title: '启动时动作：',
        openDefaultDir: '打开默认目录',
        selectFolder: '选择文件夹',
        openBlank: '打开空白页'
      },
      misc: {
        title: '其他：',
        language: '界面语言'
      }
    },
    editor: {
      title: '编辑器',
      text: {
        title: '文本编辑设置：',
        fontSize: '字号',
        lineHeight: '行高',
        fontFamily: '字体',
        fontPlaceholder: '选择字体…',
        lineWidth: '编辑器最大宽度',
        lineWidthNote: "留空使用主题默认；否则填写带单位的数字，单位可为 'ch' 字符数、'px' 像素或 '%' 百分比。"
      },
      code: {
        title: '代码块设置：',
        fontSize: '字号',
        fontFamily: '字体',
        fontPlaceholder: '选择字体…',
        lineNumbers: '显示行号',
        trimEmpty: '移除首尾空行'
      },
      writing: {
        title: '书写行为：',
        autoBracket: '自动补全括号',
        autoMarkdown: '自动补全 Markdown 语法',
        autoQuote: '自动补全引号'
      },
      file: {
        title: '文件表示：',
        tabWidth: '首选 Tab 宽度',
        endOfLine: '行分隔符类型',
        defaultEncoding: '默认编码',
        autoGuessEncoding: '自动检测文件编码',
        trailingNewline: '结尾换行的处理方式'
      },
      misc: {
        title: '其他：',
        textDirection: '文字方向',
        hideQuickInsertHint: '隐藏新增段落类型的提示',
        hideLinkPopup: '隐藏光标悬停链接时的弹窗',
        autoCheck: '是否自动检查相关任务'
      },
      options: {
        endOfLine: {
          default: '默认',
          crlf: '回车+换行 (CRLF)',
          lf: '换行 (LF)'
        },
        trimTrailingNewline: {
          trimAll: '移除所有末尾换行',
          ensureOne: '确保只保留一个末尾换行',
          preserve: '保持原文风格',
          none: '不处理'
        },
        textDirection: {
          ltr: '从左到右',
          rtl: '从右到左'
        }
      }
    },
    markdown: {
      title: 'Markdown',
      lists: {
        title: '列表：',
        preferLoose: '偏好松散列表项',
        bulletMarker: '无序列表的首选标记',
        orderMarker: '有序列表的首选标记',
        indentation: '列表缩进风格'
      },
      extensions: {
        title: 'Markdown 扩展：',
        frontmatter: 'Front matter 格式',
        superSub: '启用 Pandoc 上下标',
        footnote: '启用 Pandoc 脚注',
        footnoteNote: '需要重启生效。'
      },
      compatibility: {
        title: '兼容性：',
        html: '启用 HTML 渲染',
        gitlab: '启用 GitLab 兼容模式'
      },
      diagrams: {
        title: '图表：',
        sequenceTheme: '时序图主题'
      },
      misc: {
        title: '其他：',
        headingStyle: '标题风格偏好'
      },
      options: {
        heading: {
          atx: 'ATX 标题',
          setext: 'Setext 标题'
        },
        listIndentation: {
          dfm: 'DocFX 风格',
          tab: '真实 Tab 字符',
          space1: '单个空格',
          space2: '两个空格',
          space3: '三个空格',
          space4: '四个空格'
        },
        frontmatter: {
          yaml: 'YAML',
          toml: 'TOML',
          jsonSemi: 'JSON（;;;）',
          jsonCurly: 'JSON（{}）'
        },
        sequenceTheme: {
          hand: '手绘风格',
          simple: '简洁风格'
        }
      }
    },
    spellchecker: {
      title: '拼写',
      enable: '启用拼写检查',
      hideUnderline: '隐藏拼写错误下划线',
      autoDetect: '自动检测文档语言',
      defaultLanguage: '拼写检查默认语言',
      osxDescription: '输入时会自动检测语言，可在系统“语言与地区”中添加更多语言。',
      customDictTitle: '自定义词典：',
      customDictDesc: '编辑自定义词典中的单词。',
      tableEmpty: '暂无词条',
      tableWord: '单词',
      tableOptions: '操作',
      delete: '删除',
      errors: {
        switchTitle: '切换语言失败',
        removeTitle: '删除自定义单词失败',
        removeMessage: '保存时出现异常。'
      }
    },
    theme: {
      title: '主题',
      autoSwitch: '根据系统设置自动切换主题',
      options: {
        always: '启动时调整主题',
        never: '从不'
      },
      import: {
        openFolder: '打开主题目录',
        importTheme: '导入自定义主题'
      }
    },
    image: {
      title: '图片',
      defaultAction: '从本地或剪贴板插入图片后的默认动作',
      clipboardTip: '剪贴板处理仅在 macOS 和 Windows 上获得完整支持。',
      actions: {
        upload: '使用配置的上传器上传到云端（需先配置下方上传器）',
        folder: '复制到指定的相对资源目录或全局本地目录',
        path: '保持原始位置'
      },
      folder: {
        title: '全局或相对图片目录',
        global: '全局图片目录',
        open: '打开…',
        show: '在文件夹中显示',
        preferRelative: '优先使用相对资源目录',
        relativeName: '相对图片目录名',
        footnote: '在上方输入框中包含 ${filename} 可自动带入文档文件名。'
      },
      uploader: {
        title: '上传器',
        current: '当前图片上传器为 {name}。',
        none: '当前未选择上传器，请选择并配置一个上传器。',
        select: '选择上传器',
        picgoMissing: '系统未安装 picgo，请安装后再使用：',
        githubToken: 'GitHub token：',
        githubTokenTip: 'Token 会保存在 macOS Keychain、Linux Secret Service API/libsecret、Windows Credential Vault 中',
        githubOwner: 'Owner 名称：',
        githubRepo: 'Repo 名称：',
        githubBranch: '分支名（可选）：',
        scriptDesc: '脚本将以图片文件路径为唯一参数执行，应输出可用于 HTMLImageElement src 属性的有效值。',
        scriptPath: '脚本路径：',
        placeholders: {
          token: '输入 token',
          owner: 'owner',
          repo: 'repo',
          branch: 'branch',
          script: '脚本绝对路径'
        },
        buttons: {
          save: '保存',
          open: '打开'
        },
        notices: {
          saveTitle: '保存配置',
          githubSaved: 'GitHub 配置已保存。',
          scriptSaved: '命令行脚本配置已保存'
        },
        errors: {
          saveFailedTitle: '保存失败',
          saveFailedMsg: '保存时发生未知错误。'
        },
        legal: {
          prefix: '使用 {name} 即表示你同意 {name} 的',
          privacy: '隐私声明',
          connector: '和',
          tos: '服务条款',
          suffix: '。',
          gdpr: '由于 GDPR 限制，该服务无法在欧洲使用。',
          privacyUrl: 'https://docs.github.com/zh/site-policy/privacy-policies/github-general-privacy-statement',
          tosUrl: 'https://docs.github.com/zh/site-policy/github-terms/github-terms-of-service'
        }
      }
    },
    keybindings: {
      title: '快捷键',
      description: '自定义 MarkText 快捷键，点击下方保存以应用全部更改（需要重启）。所有可用及默认快捷键可在此',
      table: {
        description: '描述',
        accelerator: '按键组合',
        options: '操作',
        edit: '编辑',
        reset: '重置',
        unbind: '解绑'
      },
      footer: {
        save: '保存',
        restore: '恢复默认快捷键'
      },
      debug: {
        title: '调试选项：',
        dump: '导出键盘信息'
      },
      notices: {
        saveFailedTitle: '保存失败',
        saveFailedMsg: '保存时发生未知错误。',
        duplicateTitle: '快捷键已被占用',
        duplicateMsg: '快捷键 “{accelerator}” 已被使用，请先取消再重试。'
      },
      links: {
        wiki: '在线查看',
        suffix: '。',
        url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/docs/user/KEYBINDINGS.md'
      }
    }
  },
  menu: {
    file: {
      label: '文件(&F)',
      newTab: '新建标签页',
      newWindow: '新建窗口',
      openFile: '打开文件…',
      openFolder: '打开文件夹…',
      openRecent: '打开最近使用',
      clearRecentlyUsed: '清除最近使用',
      save: '保存',
      saveAs: '另存为…',
      autoSave: '自动保存',
      moveTo: '移动到…',
      rename: '重命名…',
      import: '导入…',
      export: '导出',
      exportHtml: 'HTML',
      exportPdf: 'PDF',
      print: '打印',
      preferences: '偏好设置…',
      closeTab: '关闭标签页',
      closeWindow: '关闭窗口',
      quit: '退出'
    },
    edit: {
      label: '编辑',
      undo: '撤销',
      redo: '重做',
      cut: '剪切',
      copy: '复制',
      paste: '粘贴',
      copyAsMarkdown: '复制为 Markdown',
      copyAsHtml: '复制为 HTML',
      pasteAsPlainText: '粘贴为纯文本',
      selectAll: '全选',
      duplicate: '复制一行',
      createParagraph: '创建段落',
      deleteParagraph: '删除段落',
      find: '查找',
      findNext: '查找下一个',
      findPrevious: '查找上一个',
      replace: '替换',
      findInFolder: '在文件夹中查找',
      screenshot: '截图',
      lineEnding: '换行符',
      crlf: '回车换行 (CRLF)',
      lf: '换行 (LF)'
    },
    paragraph: {
      label: '段落',
      heading1: '标题 1',
      heading2: '标题 2',
      heading3: '标题 3',
      heading4: '标题 4',
      heading5: '标题 5',
      heading6: '标题 6',
      promote: '提升标题',
      demote: '降低标题',
      table: '表格',
      codeFence: '代码块',
      quoteBlock: '引用块',
      mathBlock: '数学公式',
      htmlBlock: 'HTML 块',
      orderedList: '有序列表',
      bulletList: '无序列表',
      taskList: '任务列表',
      looseListItem: '松散列表项',
      paragraph: '段落',
      horizontalRule: '水平分割线',
      frontMatter: 'Front Matter'
    },
    format: {
      label: '格式',
      bold: '加粗',
      italic: '斜体',
      underline: '下划线',
      superscript: '上标',
      subscript: '下标',
      highlight: '高亮',
      inlineCode: '行内代码',
      inlineMath: '行内数学',
      strikethrough: '删除线',
      hyperlink: '超链接',
      image: '图片',
      clearFormatting: '清除格式'
    },
    window: {
      label: '窗口',
      minimize: '最小化',
      alwaysOnTop: '置顶窗口',
      zoomIn: '放大',
      zoomOut: '缩小',
      fullScreen: '切换全屏',
      bringAllToFront: '全部置顶'
    },
    theme: {
      label: '主题',
      cadmiumLight: 'Cadmium Light',
      dark: 'Dark',
      graphiteLight: 'Graphite Light',
      materialDark: 'Material Dark',
      oneDark: 'One Dark',
      ulyssesLight: 'Ulysses Light'
    },
    view: {
      label: '视图',
      commandPalette: '命令面板...',
      commandPalettePlaceholder: '在此输入要执行的命令',
      sourceCodeMode: '源码模式',
      typewriterMode: '打字机模式',
      focusMode: '专注模式',
      showSidebar: '显示侧边栏',
      showTabBar: '显示标签栏',
      toggleToc: '切换目录',
      reloadImages: '重新加载图片',
      showDevTools: '打开开发者工具',
      reloadWindow: '重新加载窗口'
    },
    help: {
      label: '帮助',
      quickStart: '快速开始...',
      markdownReference: 'Markdown 参考...',
      changelog: '更新日志...',
      reportIssue: '报告问题或请求功能...',
      website: '网站...',
      watchOnGithub: '在 GitHub 上关注...',
      followOnGithub: '在 Github 关注我们...',
      license: '许可证...',
      checkUpdates: '检查更新...',
      about: '关于 MarkText...',
      links: {
        quickStart: { label: '快速开始...', url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/docs/user/README.md' },
        markdownReference: { label: 'Markdown 参考...', url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/docs/user/MARKDOWN_SYNTAX.md' },
        changelog: { label: '更新日志...', url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/.github/CHANGELOG.md' },
        reportIssue: { label: '报告问题或请求功能...', url: 'https://github.com/VaillerTeeter/marktext-maintained/issues' },
        website: { label: '网站...', url: 'https://github.com/VaillerTeeter/marktext-maintained' },
        watchOnGithub: { label: '在 GitHub 上关注...', url: 'https://github.com/VaillerTeeter/marktext-maintained' },
        followOnGithub: { label: '在 Github 关注我们...', url: 'https://github.com/VaillerTeeter' },
        license: { label: '许可证...', url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/LICENSE' }
      }
    }
  },
  commands: {
    mt_hide: 'MarkText：隐藏 MarkText',
    mt_hide_others: 'MarkText：隐藏其他窗口',
    file_new_window: '文件：新建窗口',
    file_new_tab: '文件：新建标签页',
    file_open_file: '文件：打开文件',
    file_open_folder: '文件：打开文件夹',
    file_save: '文件：保存',
    file_save_as: '文件：另存为…',
    file_move_file: '文件：移动…',
    file_rename_file: '文件：重命名…',
    file_quick_open: '文件：打开快速打开对话框',
    file_print: '文件：打印当前标签页',
    file_preferences: 'MarkText：偏好设置',
    file_close_tab: '文件：关闭当前标签页',
    file_close_window: '文件：关闭窗口',
    file_quit: 'MarkText：退出',
    edit_undo: '编辑：撤销',
    edit_redo: '编辑：重做',
    edit_cut: '编辑：剪切',
    edit_copy: '编辑：复制',
    edit_paste: '编辑：粘贴',
    edit_copy_as_markdown: '编辑：复制为 Markdown',
    edit_copy_as_html: '编辑：复制为 HTML',
    edit_paste_as_plaintext: '编辑：粘贴为纯文本',
    edit_select_all: '编辑：全选',
    edit_duplicate: '编辑：复制一行',
    edit_create_paragraph: '编辑：创建段落',
    edit_delete_paragraph: '编辑：删除段落',
    edit_find: '编辑：查找',
    edit_find_next: '编辑：查找下一个',
    edit_find_previous: '编辑：查找上一个',
    edit_replace: '编辑：替换',
    edit_find_in_folder: '编辑：在文件夹中查找',
    edit_screenshot: '编辑：截图',
    paragraph_heading_1: '段落：转换为一级标题',
    paragraph_heading_2: '段落：转换为二级标题',
    paragraph_heading_3: '段落：转换为三级标题',
    paragraph_heading_4: '段落：转换为四级标题',
    paragraph_heading_5: '段落：转换为五级标题',
    paragraph_heading_6: '段落：转换为六级标题',
    paragraph_upgrade_heading: '段落：升级标题级别',
    paragraph_degrade_heading: '段落：降低标题级别',
    paragraph_table: '段落：创建表格',
    paragraph_code_fence: '段落：转换为代码块',
    paragraph_quote_block: '段落：转换为引用块',
    paragraph_math_formula: '段落：转换为数学公式',
    paragraph_html_block: '段落：转换为 HTML 块',
    paragraph_order_list: '段落：转换为有序列表',
    paragraph_bullet_list: '段落：转换为无序列表',
    paragraph_task_list: '段落：转换为任务列表',
    paragraph_loose_list_item: '段落：转换为松散列表项',
    paragraph_paragraph: '段落：新建段落',
    paragraph_horizontal_line: '段落：插入水平分割线',
    paragraph_front_matter: '段落：插入 Front Matter',
    format_strong: '格式：加粗',
    format_emphasis: '格式：斜体',
    format_underline: '格式：下划线',
    format_superscript: '格式：上标',
    format_subscript: '格式：下标',
    format_highlight: '格式：高亮',
    format_inline_code: '格式：行内代码',
    format_inline_math: '格式：行内公式',
    format_strike: '格式：删除线',
    format_hyperlink: '格式：插入链接',
    format_image: '格式：插入图片',
    format_clear_format: '格式：清除格式',
    window_minimize: '窗口：最小化',
    window_toggle_always_on_top: '窗口：置顶窗口',
    window_zoom_in: '窗口：放大',
    window_zoom_out: '窗口：缩小',
    window_toggle_full_screen: '窗口：切换全屏',
    view_command_palette: '视图：打开命令面板',
    view_source_code_mode: '视图：切换源码模式',
    view_typewriter_mode: '视图：切换打字机模式',
    view_focus_mode: '视图：切换专注模式',
    view_toggle_sidebar: '视图：切换侧边栏',
    view_toggle_toc: '视图：切换目录',
    view_toggle_tabbar: '视图：切换标签栏',
    view_toggle_dev_tools: '视图：打开开发者工具（调试）',
    view_dev_reload: '视图：重新加载窗口（调试）',
    tabs_cycle_forward: '杂项：向前切换标签页',
    tabs_cycle_backward: '杂项：向后切换标签页',
    tabs_switch_to_left: '杂项：切换到左侧标签页',
    tabs_switch_to_right: '杂项：切换到右侧标签页',
    tabs_switch_to_first: '杂项：切换到第 1 个标签页',
    tabs_switch_to_second: '杂项：切换到第 2 个标签页',
    tabs_switch_to_third: '杂项：切换到第 3 个标签页',
    tabs_switch_to_fourth: '杂项：切换到第 4 个标签页',
    tabs_switch_to_fifth: '杂项：切换到第 5 个标签页',
    tabs_switch_to_sixth: '杂项：切换到第 6 个标签页',
    tabs_switch_to_seventh: '杂项：切换到第 7 个标签页',
    tabs_switch_to_eighth: '杂项：切换到第 8 个标签页',
    tabs_switch_to_ninth: '杂项：切换到第 9 个标签页',
    tabs_switch_to_tenth: '杂项：切换到第 10 个标签页',
    view_reload_images: '视图：强制重新加载图片',
    file_toggle_auto_save: '文件：切换自动保存',
    file_import_file: '文件：导入…',
    file_export_file: '文件：导出…',
    file_zoom: '窗口：缩放…',
    file_check_update: 'MarkText：检查更新…',
    paragraph_reset_paragraph: '段落：转换为段落',
    window_change_theme: '主题：更换主题…',
    view_text_direction: '视图：设置文字方向',
    docs_user_guide: 'MarkText：用户指南',
    docs_markdown_syntax: 'MarkText：Markdown 语法指南'
  },
  notification: {
    pandoc: {
      title: '导入提示',
      message: '导入前请先安装 pandoc。'
    }
  }
}
