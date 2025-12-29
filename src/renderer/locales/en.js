export default {
  common: {
    appName: 'MarkText'
  },
  export: {
    title: 'Export Options',
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
    docs_markdown_syntax: 'MarkText: Markdown Syntax Guide'
  },
  notification: {
    pandoc: {
      title: 'Import Warning',
      message: 'Install pandoc before you import files.'
    }
  }
}
