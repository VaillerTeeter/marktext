export default {
  common: {
    appName: 'MarkText',
    currentSuffix: ' - current'
  },
  dialogs: {
    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      dontSave: "Don't save",
      ok: 'OK',
      copyError: 'Copy Error',
      report: 'Report...',
      close: 'Close',
      reload: 'Reload',
      keepItOpen: 'Keep It Open',
      replace: 'Replace'
    },
    unsavedFiles: {
      title: 'Unsaved Changes',
      message: 'Do you want to save the changes you made to {count} {itemType}?',
      detail: 'Your changes will be lost if you don\'t save them.',
      file: 'file',
      files: 'files'
    },
    fileExists: {
      title: 'File Exists',
      message: 'The file "{filename}" already exists. Do you want to replace it?'
    },
    savingFailed: {
      title: 'Failure while saving files',
      message: 'An error occurred while saving the file.'
    },
    exportFailed: {
      title: 'Export failure',
      message: 'Error happened when export {filename}'
    },
    importWarning: {
      title: 'Import Warning',
      message: 'Install pandoc before you want to import files.'
    },
    crashed: {
      title: 'MarkText has crashed',
      message: 'An unexpected error occurred. Do you want to reload the window?'
    },
    unexpectedError: {
      title: 'Unexpected error',
      message: '{error}'
    },
    cannotOpenTab: {
      title: 'Cannot open tab',
      message: 'Failed to open the file or directory.'
    },
    watcherIoError: {
      title: 'Watcher I/O error',
      message: '{error}'
    },
    inotifyLimitReached: {
      title: 'inotify limit reached',
      message: 'Cannot watch all files and file changes because too many file descriptors are opened.'
    },
    exportError: {
      title: 'Export error',
      message: 'There is something wrong when exporting.'
    },
    exportHtmlError: {
      title: 'Export error',
      message: 'There is something wrong when export {type}.'
    },
    printError: {
      title: 'Print error',
      message: 'There is something wrong when print {type}.'
    },
    languageSwitchFailed: {
      title: 'Language switch failed',
      message: 'Unable to switch to language "{language}". Requested language dictionary is missing.'
    },
    languageSwitchError: {
      title: 'Language switch error',
      message: 'Error while switching to "{language}": {error}'
    },
    import: {
      title: 'Import or Open',
      dropHint: 'Drop here to get you stuff into MarkText'
    }
  },
  contextMenu: {
    editor: {
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      copyAsMarkdown: 'Copy As Markdown',
      copyAsHtml: 'Copy As Html',
      pasteAsPlainText: 'Paste as Plain Text',
      insertParagraphBefore: 'Insert Paragraph Before',
      insertParagraphAfter: 'Insert Paragraph After'
    },
    spelling: {
      spelling: 'Spelling...',
      changeLanguage: 'Change Language...',
      addToDictionary: 'Add to Dictionary',
      editDictionary: 'Edit Dictionary...'
    }
  },
  titlebar: {
    defaultTitle: 'MarkText'
  },
  search: {
    matchCountFormat: '{count} {type} in {fileCount} {fileType}',
    match: 'match',
    matches: 'matches',
    file: 'file',
    files: 'files',
    placeholder: 'Search',
    replacementPlaceholder: 'Replacement',
    caseSensitive: 'Case Sensitive',
    selectWholeWord: 'Select whole word',
    useRegex: 'Use query as RegEx'
  },
  export: {
    title: 'Export Options',
    form: {
      rows: 'Rows',
      columns: 'Columns'
    },
    tabs: {
      info: 'Info',
      page: 'Page',
      style: 'Style',
      theme: 'Theme',
      header: 'Header & Footer',
      toc: 'Table of Contents',
      headerDescription: 'The text appears on all pages if header and/or footer is defined.'
    },
    infoDescription: 'Please customize the page appearance and click on "export" to continue.',
    labels: {
      pageTitle: 'The page title',
      pageSize: 'Page size',
      landscape: 'Landscape orientation',
      pageMargin: 'Page margin in mm',
      topBottom: 'Top/Bottom',
      leftRight: 'Left/Right',
      theme: 'Theme',
      widthHeight: 'Width/Height in mm',
      headerType: 'Header type',
      footerType: 'Footer type',
      headerLeft: 'The left header text',
      headerMain: 'The main header text',
      headerRight: 'The right header text',
      footerLeft: 'The left footer text',
      footerMain: 'The main footer text',
      footerRight: 'The right footer text',
      overwriteThemeFontSettings: 'Overwrite theme font settings',
      fontFamily: 'Font family',
      fontSize: 'Font size',
      lineHeight: 'Line height',
      autoNumberingHeadings: 'Auto numbering headings',
      showFrontMatter: 'Show Front Matter',
      allowStyledHeaderFooter: 'Allow styled header and footer',
      headerFooterFontSize: 'Header and footer font size',
      headerFooterCustomize: 'Customize style',
      themeDescription: 'You can change the document appearance by choosing a theme or create a handcrafted one.',
      exportButton: 'Export...'
    },
    toc: {
      includeTopHeading: 'Include top heading',
      includeTopHeadingNote: 'Includes the first heading level too.',
      titleLabel: 'Title'
    }
  },
  sidebar: {
    openedFiles: 'Opened files',
    saveAll: 'Save All',
    closeAll: 'Close All',
    emptyProject: 'Empty project',
    createFile: 'Create File',
    openFolder: 'Open Folder',
    searchPlaceholder: 'Search in folder...',
    caseSensitive: 'Case Sensitive',
    selectWholeWord: 'Select whole word',
    useRegex: 'Use query as RegEx',
    noFolderOpen: 'No folder open',
    noResultsFound: 'No results found.',
    cancel: 'Cancel',
    tocTitle: 'Table Of Contents',
    showMoreMatches: 'Show more matches',
    newFile: 'New File',
    newDirectory: 'New Directory',
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    rename: 'Rename',
    moveToTrash: 'Move To Trash',
    showInFolder: 'Show In Folder'
  },
  pref: {
    sidebar: {
      title: 'Preferences',
      searchPlaceholder: 'Search preferences',
      categories: {
        general: 'General',
        editor: 'Editor',
        markdown: 'Markdown',
        spelling: 'Spelling',
        theme: 'Theme',
        image: 'Image',
        keybindings: 'Key Bindings'
      }
    },
    common: {
      fontPlaceholder: 'Select font...'
    },
    general: {
      title: 'General',
      autoSave: {
        title: 'Auto Save:',
        description: 'Automatically save document changes',
        delay: 'Delay following document edit before automatically saving'
      },
      window: {
        title: 'Window:',
        titleBarStyle: 'Title bar style',
        options: {
          custom: 'Custom',
          native: 'Native'
        },
        titleBarNote: 'Requires restart.',
        hideScrollbar: 'Hide scrollbars',
        openFilesInNewWindow: 'Open files in new window',
        openFoldersInNewWindow: 'Open folders in new window',
        zoom: 'Zoom'
      },
      sidebar: {
        title: 'Sidebar:',
        wrapToc: 'Wrap text in table of contents',
        sortField: 'Sort field for files in open folders'
      },
      startup: {
        title: 'Action on startup:',
        restoreLastSession: 'Restore last editor session',
        openDefaultDir: 'Open the default directory',
        selectFolder: 'Select Folder',
        openBlank: 'Open a blank page'
      },
      misc: {
        title: 'Misc:',
        language: 'User interface language'
      }
    },
    editor: {
      title: 'Editor',
      text: {
        title: 'Text editor settings:',
        fontSize: 'Font size',
        lineHeight: 'Line height',
        fontFamily: 'Font family',
        fontPlaceholder: 'Select font... ',
        lineWidth: 'Maximum width of text editor',
        lineWidthNote: "Leave empty for theme default, otherwise use number with unit suffix, which is one of 'ch' for characters, 'px' for pixels, or '%' for percentage."
      },
      code: {
        title: 'Code block settings:',
        fontSize: 'Font size',
        fontFamily: 'Font family',
        fontPlaceholder: 'Select font... ',
        lineNumbers: 'Show line numbers',
        trimEmpty: 'Remove leading and trailing empty lines'
      },
      writing: {
        title: 'Writing behavior:',
        autoBracket: 'Automatically close brackets when writing',
        autoMarkdown: 'Automatically complete markdown syntax',
        autoQuote: 'Automatically close quotation marks'
      },
      file: {
        title: 'File representation:',
        tabWidth: 'Preferred tab width',
        endOfLine: 'Line separator type',
        defaultEncoding: 'Default encoding',
        autoGuessEncoding: 'Automatically detect file encoding',
        trailingNewline: 'Handling of trailing newline characters'
      },
      misc: {
        title: 'Misc:',
        textDirection: 'Text direction',
        hideQuickInsertHint: 'Hide hint for selecting type of new paragraph',
        hideLinkPopup: 'Hide popup when cursor is over link',
        autoCheck: 'Whether to automatically check any related tasks'
      },
      options: {
        endOfLine: {
          default: 'Default',
          crlf: 'Carriage return and line feed (CRLF)',
          lf: 'Line feed (LF)'
        },
        trimTrailingNewline: {
          trimAll: 'Trim all trailing',
          ensureOne: 'Ensure exactly one trailing',
          preserve: 'Preserve style of original document',
          none: 'Do nothing'
        },
        textDirection: {
          ltr: 'Left to Right',
          rtl: 'Right to Left'
        }
      }
    },
    markdown: {
      title: 'Markdown',
      lists: {
        title: 'Lists:',
        preferLoose: 'Prefer loose list items',
        bulletMarker: 'Preferred marker for bullet lists',
        orderMarker: 'Preferred marker for ordered lists',
        indentation: 'Preferred list indentation'
      },
      extensions: {
        title: 'Markdown extensions:',
        frontmatter: 'Front matter format',
        superSub: 'Enable Pandoc-style superscript and subscript',
        footnote: 'Enable Pandoc-style footnotes',
        footnoteNote: 'Requires restart.'
      },
      compatibility: {
        title: 'Compatibility:',
        html: 'Enable HTML rendering',
        gitlab: 'Enable GitLab compatibility mode'
      },
      diagrams: {
        title: 'Diagrams:',
        sequenceTheme: 'Sequence diagram theme'
      },
      misc: {
        title: 'Misc:',
        headingStyle: 'Preferred heading style'
      },
      options: {
        heading: {
          atx: 'ATX heading',
          setext: 'Setext heading'
        },
        listIndentation: {
          dfm: 'DocFX style',
          tab: 'True tab character',
          space1: 'Single space character',
          space2: 'Two space characters',
          space3: 'Three space characters',
          space4: 'Four space characters'
        },
        frontmatter: {
          yaml: 'YAML',
          toml: 'TOML',
          jsonSemi: 'JSON (;;;)',
          jsonCurly: 'JSON ({})'
        },
        sequenceTheme: {
          hand: 'Hand drawn',
          simple: 'Simple'
        }
      }
    },
    spellchecker: {
      title: 'Spelling',
      enable: 'Enable spell checking',
      hideUnderline: 'Hide marks for spelling errors',
      autoDetect: 'Automatically detect document language',
      defaultLanguage: 'Default language for spell checking',
      osxDescription: 'The used language will be detected automatically while typing. Additional languages may be added through "Language & Region" in your system preferences pane.',
      customDictTitle: 'Custom dictionary:',
      customDictDesc: 'Edit words in custom dictionary.',
      tableEmpty: 'No words available',
      tableWord: 'Word',
      tableOptions: 'Options',
      delete: 'Delete',
      errors: {
        switchTitle: 'Failed to switch language',
        removeTitle: 'Failed to remove custom word',
        removeMessage: 'An unexpected error occurred while saving.'
      }
    },
    theme: {
      title: 'Theme',
      autoSwitch: 'Automatically adjust application theme according to system settings',
      options: {
        always: 'Adjust theme at startup',
        never: 'Never'
      },
      import: {
        openFolder: 'Open the themes folder',
        importTheme: 'Import custom themes'
      }
    },
    image: {
      title: 'Image',
      defaultAction: 'Default action after an image is inserted from local folder or clipboard',
      clipboardTip: 'Clipboard handling is only fully supported on macOS and Windows.',
      actions: {
        upload: 'Upload image to cloud using selected uploader (must be configured below)',
        folder: 'Copy image to designated relative assets or global local folder',
        path: 'Keep original location'
      },
      folder: {
        title: 'Global or relative image folder',
        global: 'Global image folder',
        open: 'Open...',
        show: 'Show in Folder',
        preferRelative: 'Prefer relative assets folder',
        relativeName: 'Relative image folder name',
        footnote: 'Include ${filename} in the text-box above to automatically insert the document file name.'
      },
      uploader: {
        title: 'Uploader',
        current: 'The current image uploader is {name}.',
        none: 'Currently no uploader is selected. Please select an uploader and config it.',
        select: 'Select uploader',
        picgoMissing: 'Your system does not have picgo installed, please install it before use:',
        githubToken: 'GitHub token:',
        githubTokenTip: 'The token is saved by Keychain on macOS, Secret Service API/libsecret on Linux and Credential Vault on Windows',
        githubOwner: 'Owner name:',
        githubRepo: 'Repo name:',
        githubBranch: 'Branch name (optional):',
        scriptDesc: 'The script will be executed with the image file path as its only argument and it should output any valid value for the src attribute of a HTMLImageElement.',
        scriptPath: 'Shell script location:',
        placeholders: {
          token: 'Input token',
          owner: 'owner',
          repo: 'repo',
          branch: 'branch',
          script: 'Script absolute path'
        },
        buttons: {
          save: 'Save',
          open: 'Open'
        },
        notices: {
          saveTitle: 'Save Config',
          githubSaved: 'The Github configuration has been saved.',
          scriptSaved: 'The command line script configuration has been saved'
        },
        errors: {
          saveFailedTitle: 'Failed to save',
          saveFailedMsg: 'An unexpected error occurred while saving.'
        },
        legal: {
          prefix: 'By using {name}, you agree to {name}\'s',
          privacy: 'Privacy Statement',
          connector: 'and',
          tos: 'Terms of Service',
          suffix: '.',
          gdpr: 'This service cannot be used in Europe due to GDPR issues.',
          privacyUrl: 'https://docs.github.com/zh/site-policy/privacy-policies/github-general-privacy-statement',
          tosUrl: 'https://docs.github.com/zh/site-policy/github-terms/github-terms-of-service'
        }
      }
    },
    keybindings: {
      title: 'Key Bindings',
      description: 'Customize MarkText shortcuts and click on the save button below to apply all changes (requires a restart). All available and default key bindings can be found ',
      dialog: {
        placeholder: 'Press a key combination',
        instructions: 'Press Enter to continue or ESC to exit.',
        invalidKeybinding: 'Current key combination cannot be bound!'
      },
      table: {
        description: 'Description',
        accelerator: 'Key Combination',
        options: 'Options',
        edit: 'Edit',
        reset: 'Reset',
        unbind: 'Unbind'
      },
      footer: {
        save: 'Save',
        restore: 'Restore default key bindings'
      },
      debug: {
        title: 'Debug options:',
        dump: 'Dump keyboard information'
      },
      notices: {
        saveFailedTitle: 'Failed to save',
        saveFailedMsg: 'An unexpected error occurred while saving.',
        duplicateTitle: 'Shortcut already in use',
        duplicateMsg: 'The shortcut "{accelerator}" is already in use. Please unset the shortcut and try again.'
      },
      links: {
        wiki: 'online',
        suffix: '.',
        url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/docs/user/KEYBINDINGS.md'
      }
    }
  },
  menu: {
    marktext: {
      label: 'MarkText',
      about: 'About MarkText',
      checkUpdates: 'Check for updates...',
      preferences: 'Preferences',
      services: 'Services',
      hide: 'Hide MarkText',
      hideOthers: 'Hide Others',
      showAll: 'Show All',
      quit: 'Quit MarkText'
    },
    dock: {
      open: 'Open...',
      clearRecent: 'Clear Recent'
    },
    file: {
      label: '&File',
      newTab: 'New Tab',
      newWindow: 'New Window',
      openFile: 'Open File...',
      openFolder: 'Open Folder...',
      openRecent: 'Open Recent',
      clearRecentlyUsed: 'Clear Recently Used',
      save: 'Save',
      saveAs: 'Save As...',
      autoSave: 'Auto Save',
      moveTo: 'Move To...',
      rename: 'Rename...',
      import: 'Import...',
      export: 'Export',
      exportHtml: 'HTML',
      exportPdf: 'PDF',
      print: 'Print',
      preferences: 'Preferences...',
      closeTab: 'Close Tab',
      closeWindow: 'Close Window',
      quit: 'Quit'
    },
    edit: {
      label: '&Edit',
      undo: 'Undo',
      redo: 'Redo',
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      copyAsMarkdown: 'Copy as Markdown',
      copyAsHtml: 'Copy as HTML',
      pasteAsPlainText: 'Paste as Plain Text',
      selectAll: 'Select All',
      duplicate: 'Duplicate',
      createParagraph: 'Create Paragraph',
      deleteParagraph: 'Delete Paragraph',
      find: 'Find',
      findNext: 'Find Next',
      findPrevious: 'Find Previous',
      replace: 'Replace',
      findInFolder: 'Find in Folder',
      screenshot: 'Screenshot',
      lineEnding: 'Line Ending',
      crlf: 'Carriage return and line feed (CRLF)',
      lf: 'Line feed (LF)'
    },
    paragraph: {
      label: '&Paragraph',
      heading1: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      heading4: 'Heading 4',
      heading5: 'Heading 5',
      heading6: 'Heading 6',
      promote: 'Promote Heading',
      demote: 'Demote Heading',
      table: 'Table',
      codeFence: 'Code Fences',
      quoteBlock: 'Quote Block',
      mathBlock: 'Math Block',
      htmlBlock: 'Html Block',
      orderedList: 'Ordered List',
      bulletList: 'Bullet List',
      taskList: 'Task List',
      looseListItem: 'Loose List Item',
      paragraph: 'Paragraph',
      horizontalRule: 'Horizontal Rule',
      frontMatter: 'Front Matter'
    },
    format: {
      label: '&Format',
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      superscript: 'Superscript',
      subscript: 'Subscript',
      highlight: 'Highlight',
      inlineCode: 'Inline Code',
      inlineMath: 'Inline Math',
      strikethrough: 'Strikethrough',
      hyperlink: 'Hyperlink',
      image: 'Image',
      clearFormatting: 'Clear Formatting'
    },
    window: {
      label: '&Window',
      minimize: 'Minimize',
      alwaysOnTop: 'Always on Top',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      fullScreen: 'Show in Full Screen',
      bringAllToFront: 'Bring All to Front'
    },
    theme: {
      label: '&Theme',
      cadmiumLight: 'Cadmium Light',
      dark: 'Dark',
      graphiteLight: 'Graphite Light',
      materialDark: 'Material Dark',
      oneDark: 'One Dark',
      ulyssesLight: 'Ulysses Light'
    },
    view: {
      label: '&View',
      commandPalette: 'Command Palette...',
      commandPalettePlaceholder: 'Type a command to execute',
      sourceCodeMode: 'Source Code Mode',
      typewriterMode: 'Typewriter Mode',
      focusMode: 'Focus Mode',
      showSidebar: 'Show Sidebar',
      showTabBar: 'Show Tab Bar',
      toggleToc: 'Toggle Table of Contents',
      reloadImages: 'Reload Images',
      showDevTools: 'Show Developer Tools',
      reloadWindow: 'Reload window'
    },
    titlebar: {
      words: 'Words:',
      characters: 'Characters:',
      paragraphs: 'Paragraphs:'
    },
    help: {
      label: '&Help',
      quickStart: 'Quick Start...',
      markdownReference: 'Markdown Reference...',
      changelog: 'Changelog...',
      reportIssue: 'Report Issue or Request Feature...',
      website: 'Website...',
      watchOnGithub: 'Watch on GitHub...',
      followOnGithub: 'Follow us on Github...',
      license: 'License...',
      checkUpdates: 'Check for updates...',
      about: 'About MarkText...',
      links: {
        quickStart: { label: 'Quick Start...', url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/docs/user/README.md' },
        markdownReference: { label: 'Markdown Reference...', url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/docs/user/MARKDOWN_SYNTAX.md' },
        changelog: { label: 'Changelog...', url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/.github/CHANGELOG.md' },
        reportIssue: { label: 'Report Issue or Request Feature...', url: 'https://github.com/VaillerTeeter/marktext-maintained/issues' },
        website: { label: 'Website...', url: 'https://github.com/VaillerTeeter/marktext-maintained' },
        watchOnGithub: { label: 'Watch on GitHub...', url: 'https://github.com/VaillerTeeter/marktext-maintained' },
        followOnGithub: { label: 'Follow us on Github...', url: 'https://github.com/VaillerTeeter' },
        license: { label: 'License...', url: 'https://github.com/VaillerTeeter/marktext-maintained/blob/develop/LICENSE' }
      }
    }
  },
  commands: {
    mt_hide: 'MarkText: Hide MarkText',
    mt_hide_others: 'MarkText: Hide Others',
    file_new_window: 'File: New Window',
    file_new_tab: 'File: New Tab',
    file_open_file: 'File: Open file',
    file_open_folder: 'File: Open Folder',
    file_save: 'File: Save',
    file_save_as: 'File: Save As...',
    file_move_file: 'File: Move...',
    file_rename_file: 'File: Rename...',
    file_quick_open: 'File: Show quick open dialog',
    file_print: 'File: Print current Tab',
    file_change_encoding: 'File: Change Encoding',
    file_line_ending: 'File: Change Line Ending',
    file_line_ending_crlf: 'Carriage return and line feed (CRLF)',
    file_line_ending_lf: 'Line feed (LF)',
    file_trailing_newline: 'File: Trailing Newline',
    file_trailing_newline_trim: 'Trim all trailing newlines',
    file_trailing_newline_single: 'Ensure single newline',
    file_trailing_newline_disabled: 'Disabled',
    file_preferences: 'MarkText: Preferences',
    file_close_tab: 'File: Close current Tab',
    file_close_window: 'File: Close Window',
    file_quit: 'MarkText: Quit',
    edit_undo: 'Edit: Undo',
    edit_redo: 'Edit: Redo',
    edit_cut: 'Edit: Cut',
    edit_copy: 'Edit: Copy',
    edit_paste: 'Edit: Paste',
    edit_copy_as_markdown: 'Edit: Copy as Markdown',
    edit_copy_as_html: 'Edit: Copy as HTML',
    edit_paste_as_plaintext: 'Edit: Paste as Plain Text',
    edit_select_all: 'Edit: Select All',
    edit_duplicate: 'Edit: Duplicate',
    edit_create_paragraph: 'Edit: Create Paragraph',
    edit_delete_paragraph: 'Edit: Delete Paragraph',
    edit_find: 'Edit: Find',
    edit_find_next: 'Edit: Find Next',
    edit_find_previous: 'Edit: Find Previous',
    edit_replace: 'Edit: Replace',
    edit_find_in_folder: 'Edit: Find in Folder',
    edit_screenshot: 'Edit: Make Screenshot',
    paragraph_heading_1: 'Paragraph: Transform into Heading 1',
    paragraph_heading_2: 'Paragraph: Transform into Heading 2',
    paragraph_heading_3: 'Paragraph: Transform into Heading 3',
    paragraph_heading_4: 'Paragraph: Transform into Heading 4',
    paragraph_heading_5: 'Paragraph: Transform into Heading 5',
    paragraph_heading_6: 'Paragraph: Transform into Heading 6',
    paragraph_upgrade_heading: 'Paragraph: Upgrade Heading',
    paragraph_degrade_heading: 'Paragraph: Degrade Heading',
    paragraph_table: 'Paragraph: Create Table',
    paragraph_code_fence: 'Paragraph: Transform into Code Fence',
    paragraph_quote_block: 'Paragraph: Transform into Quote Block',
    paragraph_math_formula: 'Paragraph: Transform into Math Formula',
    paragraph_html_block: 'Paragraph: Transform into HTML Block',
    paragraph_order_list: 'Paragraph: Transform into Order List',
    paragraph_bullet_list: 'Paragraph: Transform into Bullet List',
    paragraph_task_list: 'Paragraph: Transform into Task List',
    paragraph_loose_list_item: 'Paragraph: Convert to Loose List Item',
    paragraph_paragraph: 'Paragraph: Create new Paragraph',
    paragraph_horizontal_line: 'Paragraph: Insert Horizontal Line',
    paragraph_front_matter: 'Paragraph: Insert Front Matter',
    format_strong: 'Format: Strong',
    format_emphasis: 'Format: Emphasis',
    format_underline: 'Format: Underline',
    format_superscript: 'Format: Superscript',
    format_subscript: 'Format: Subscript',
    format_highlight: 'Format: Highlight',
    format_inline_code: 'Format: Inline Code',
    format_inline_math: 'Format: Inline Math',
    format_strike: 'Format: Strike',
    format_hyperlink: 'Format: Hyperlink',
    format_image: 'Format: Insert Image',
    format_clear_format: 'Format: Clear Format',
    window_minimize: 'Window: Minimize',
    window_toggle_always_on_top: 'Window: Always on Top',
    window_zoom_in: 'Window: Zoom In',
    window_zoom_out: 'Window: Zoom Out',
    window_toggle_full_screen: 'Window: Toggle Full Screen',
    view_command_palette: 'View: Show Command Palette',
    view_source_code_mode: 'View: Toggle Source Code Mode',
    view_typewriter_mode: 'View: Toggle Typewriter Mode',
    view_focus_mode: 'View: Focus Mode',
    view_toggle_sidebar: 'View: Toggle Sidebar',
    view_toggle_toc: 'View: Toggle Table of Content',
    view_toggle_tabbar: 'View: Toggle Tabs',
    view_toggle_dev_tools: 'View: Show Developer Tools (Debug)',
    view_dev_reload: 'View: Reload Window (Debug)',
    tabs_cycle_forward: 'Misc: Cycle Tabs Forward',
    tabs_cycle_backward: 'Misc: Cycle Tabs Backward',
    tabs_switch_to_left: 'Misc: Switch tab to the left',
    tabs_switch_to_right: 'Misc: Switch tab to the right',
    tabs_switch_to_first: 'Misc: Switch tab to the 1st',
    tabs_switch_to_second: 'Misc: Switch tab to the 2st',
    tabs_switch_to_third: 'Misc: Switch tab to the 3st',
    tabs_switch_to_fourth: 'Misc: Switch tab to the 4st',
    tabs_switch_to_fifth: 'Misc: Switch tab to the 5st',
    tabs_switch_to_sixth: 'Misc: Switch tab to the 6st',
    tabs_switch_to_seventh: 'Misc: Switch tab to the 7st',
    tabs_switch_to_eighth: 'Misc: Switch tab to the 8st',
    tabs_switch_to_ninth: 'Misc: Switch tab to the 9st',
    tabs_switch_to_tenth: 'Misc: Switch tab to the 10st',
    view_reload_images: 'View: Force reload images',
    file_toggle_auto_save: 'File: Toggle Auto Save',
    file_import_file: 'File: Import...',
    file_export_file: 'File: Export...',
    file_zoom: 'Window: Zoom...',
    file_check_update: 'MarkText: Check for Updates...',
    paragraph_reset_paragraph: 'Paragraph: Transform into Paragraph',
    window_change_theme: 'Theme: Change Theme...',
    view_text_direction: 'View: Set Text Direction',
    docs_user_guide: 'MarkText: End User Guide',
    docs_markdown_syntax: 'MarkText: Markdown Syntax Guide',
    spellchecker_switch_language: 'Spelling: Switch language',
    spellchecker_switch_placeholder: 'Select a language to switch to'
  },
  quickInsert: {
    hint: 'Type @ to insert',
    section: {
      basic_block: 'BASIC BLOCK',
      header: 'HEADER',
      advanced_block: 'ADVANCED BLOCK',
      list_block: 'LIST BLOCK',
      diagram: 'DIAGRAM'
    },
    paragraph: { title: 'Paragraph', subtitle: 'Lorem Ipsum is simply dummy text' },
    hr: { title: 'Horizontal Line', subtitle: '---' },
    front_matter: { title: 'Front Matter', subtitle: '--- Lorem Ipsum ---' },
    heading_1: { title: 'Header 1', subtitle: '# Lorem Ipsum is simply ...' },
    heading_2: { title: 'Header 2', subtitle: '## Lorem Ipsum is simply ...' },
    heading_3: { title: 'Header 3', subtitle: '### Lorem Ipsum is simply ...' },
    heading_4: { title: 'Header 4', subtitle: '#### Lorem Ipsum is simply ...' },
    heading_5: { title: 'Header 5', subtitle: '##### Lorem Ipsum is simply ...' },
    heading_6: { title: 'Header 6', subtitle: '###### Lorem Ipsum is simply ...' },
    table: { title: 'Table Block', subtitle: '|Lorem | Ipsum is simply |' },
    mathblock: { title: 'Display Math', subtitle: '$$ Lorem Ipsum is simply $$' },
    html: { title: 'HTML Block', subtitle: '<div> Lorem Ipsum is simply </div>' },
    pre: { title: 'Code Block', subtitle: '```java Lorem Ipsum is simply ```' },
    blockquote: { title: 'Quote Block', subtitle: '>Lorem Ipsum is simply ...' },
    ol_order: { title: 'Order List', subtitle: '1. Lorem Ipsum is simply ...' },
    ul_bullet: { title: 'Bullet List', subtitle: '- Lorem Ipsum is simply ...' },
    ul_task: { title: 'To-do List', subtitle: '- [x] Lorem Ipsum is simply ...' },
    'vega_lite': { title: 'Vega Chart', subtitle: 'Render flow chart by vega-lite.js.' },
    flowchart: { title: 'Flow Chart', subtitle: 'Render flow chart by flowchart.js.' },
    sequence: { title: 'Sequence Diagram', subtitle: 'Render sequence diagram by js-sequence.' },
    plantuml: { title: 'PlantUML Diagram', subtitle: 'Render PlantUML diagrams' },
    mermaid: { title: 'Mermaid', subtitle: 'Render Diagram by mermaid.' }
  },
  notification: {
    pandoc: {
      title: 'Import Warning',
      message: 'Install pandoc before you import files.'
    },
    update: {
      errorTitle: 'Update',
      errorMessage: 'An error occurred while checking for updates: {msg}',
      notAvailableTitle: 'Update not Available',
      notAvailableMessage: 'Current version is up-to-date.',
      downloadedTitle: 'Update Downloaded',
      downloadedMessage: 'Update downloaded, application will be quit for update...',
      availableTitle: 'Update Available',
      availableMessage: 'Found an update, do you want to download and install now?'
    }
  },
  about: {
    maintenanceNote: 'Upstream maintenance ended in 2022.',
    forkNote: 'Forked (Dec 2025) as marktext-maintained — updated deps and fixed bugs.',
    copyrightOriginal: 'Copyright © 2017-2022 Luo Ran',
    copyrightContributors1: 'Copyright © 2018-{year} MarkText Contributors',
    copyrightContributors2: 'Copyright © 2025-{year} Vaciller'
  }
}
