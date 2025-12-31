<template>
  <div class="pref-keybindings">
    <h4>{{ $t('pref.keybindings.title') }}</h4>
    <section class="keybindings">
      <div class="text">
        {{ $t('pref.keybindings.description') }}<a class="link" @click="openKeybindingWiki">{{ $t('pref.keybindings.links.wiki') }}</a>{{ $t('pref.keybindings.links.suffix') }}
      </div>
      <el-table
        :data="keybindingList"
        style="width: 100%"
      >
        <el-table-column prop="description" :label="$t('pref.keybindings.table.description')">
        </el-table-column>
        <el-table-column prop="acceleratorDisplay" :label="$t('pref.keybindings.table.accelerator')" width="220">
        </el-table-column>
        <el-table-column fixed="right" :label="$t('pref.keybindings.table.options')" width="90">
          <template slot-scope="scope">
            <el-button @click="handleEditClick(scope.$index, scope.row)" type="text" size="small" :title="$t('pref.keybindings.table.edit')">
              <i class="el-icon-edit"></i>
            </el-button>
            <el-button @click="handleResetClick(scope.$index, scope.row)" type="text" size="small" :title="$t('pref.keybindings.table.reset')">
              <i class="el-icon-refresh-right"></i>
            </el-button>
            <el-button @click="handleUnbindClick(scope.$index, scope.row)" type="text" size="small" :title="$t('pref.keybindings.table.unbind')">
              <i class="el-icon-delete"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <section class="footer">
      <separator></separator>
      <el-button size="medium" @click="saveKeybindings">{{ $t('pref.keybindings.footer.save') }}</el-button>
      <el-button size="medium" @click="restoreDefaults">{{ $t('pref.keybindings.footer.restore') }}</el-button>
    </section>
    <section v-if="showDebugTools" class="keyboard-debug">
      <separator></separator>
      <div><strong>{{ $t('pref.keybindings.debug.title') }}</strong></div>
      <el-button size="medium" @click="dumpKeyboardInformation">{{ $t('pref.keybindings.debug.dump') }}</el-button>
    </section>
    <key-input-dialog
      :showWithId="selectedShortcutId"
      :onCommit="onKeybinding"
    ></key-input-dialog>
  </div>
</template>

<script>
import { ipcRenderer, shell } from 'electron'
import log from 'electron-log/renderer'
import { setKeyboardLayout } from '@hfelix/electron-localshortcut'
import Compound from '../common/compound'
import Separator from '../common/separator'
import KeyInputDialog from './key-input-dialog.vue'
import KeybindingConfigurator from './KeybindingConfigurator'
import notice from '@/services/notification'

export default {
  components: {
    Compound,
    Separator,
    KeyInputDialog
  },
  data () {
    return {
      showDebugTools: false,
      keybindingConfigurator: null,
      selectedShortcutId: null,
      keybindingList: []
    }
  },

  mounted () {
    ipcRenderer.invoke('mt::keybinding-get-keyboard-info')
      .then(({ layout, keymap }) => {
        // Update the key mapper to prevent problems on non-US keyboards.
        setKeyboardLayout(layout, keymap)
      })
      .catch(error => log.error('Error while loading keyboard information for settings:', error))

    ipcRenderer.invoke('mt::keybinding-get-pref-keybindings')
      .then(({ defaultKeybindings, userKeybindings }) => {
        this.keybindingConfigurator = new KeybindingConfigurator(defaultKeybindings, userKeybindings)
        this.keybindingList = this.keybindingConfigurator.getKeybindings()
      })
      .catch(error => log.error('Error while loading keyboard information for settings:', error))

    // Show keyboard debugging tools which has been moved from CLI because we
    // need an active window on Windows.
    this.showDebugTools = global.marktext.env.debug
  },

  unmounted () {
    this.keybindingList = []
    this.keybindingConfigurator = null
  },

  methods: {
    openKeybindingWiki () {
      shell.openExternal(this.$t('pref.keybindings.links.url'))
    },
    saveKeybindings () {
      if (this.keybindingConfigurator && this.keybindingList.length > 0) {
        this.keybindingConfigurator.save()
          .then(success => {
            if (!success) {
              notice.notify({
                title: this.$t('pref.keybindings.notices.saveFailedTitle'),
                type: 'error',
                message: this.$t('pref.keybindings.notices.saveFailedMsg')
              })
            }
          })
          .catch(error => log.error(error))
      }
    },
    restoreDefaults () {
      this.keybindingConfigurator.resetAll()
        .then(success => {
          if (!success) {
            notice.notify({
              title: this.$t('pref.keybindings.notices.saveFailedTitle'),
              type: 'error',
              message: this.$t('pref.keybindings.notices.saveFailedMsg')
            })
          }
        })
        .catch(error => log.error(error))
    },
    handleEditClick (index, entry) {
      if (index >= 0 && entry) {
        this.selectedShortcutId = entry.id
      }
    },
    handleResetClick (index, entry) {
      const { keybindingConfigurator } = this
      const { id } = entry
      const success = keybindingConfigurator.resetToDefault(id)
      if (!success) {
        this.handleDuplicateShortcut(id, keybindingConfigurator.getDefaultAccelerator(id))
      }
    },
    handleUnbindClick (index, entry) {
      this.keybindingConfigurator.unbind(entry.id)
    },
    onKeybinding (value) {
      const selectedId = this.selectedShortcutId
      if (value && selectedId) {
        const success = this.keybindingConfigurator.change(selectedId, value)
        if (!success) {
          this.handleDuplicateShortcut(selectedId, value)
        }
      }
      this.selectedShortcutId = null
    },
    handleDuplicateShortcut (id, accelerator) {
      notice.notify({
        title: this.$t('pref.keybindings.notices.duplicateTitle'),
        type: 'warning',
        message: this.$t('pref.keybindings.notices.duplicateMsg', { accelerator })
      })
    },
    dumpKeyboardInformation () {
      ipcRenderer.send('mt::keybinding-debug-dump-keyboard-info')
    }
  }
}
</script>

<style scoped>
.pref-keybindings {
  & .keyboard-debug,
  & .keybindings {
    font-size: 14px;
    margin: 20px 0;
    color: var(--editorColor);
    & .link {
      cursor: pointer;
    }
  }
  & .keybindings > div.text {
    margin-bottom: 10px;
  }
  & .link {
    color: var(--themeColor);
    cursor: pointer;
  }
  & button.el-button {
    font-size: 13px;
  }
}
.el-table, .el-table__expanded-cell {
  background: var(--editorBgColor);
}
.el-table button {
  padding: 2px 2px;
  margin: 4px 0px;
  color: var(--themeColor);
  background: none;
  border: none;
}
.el-table button:not(:last-child) {
  margin-right: 4px;
}
.el-table button:hover,
.el-table button:active {
  opacity: 0.9;
  background: none;
}
</style>
<style>
.pref-keybindings .el-table table {
  margin: 0;
  border: none;
}
.pref-keybindings .el-table th,
.pref-keybindings .el-table tr {
  background: var(--editorBgColor);
}
.pref-keybindings .el-table th.el-table__cell.is-leaf,
.pref-keybindings .el-table th,
.pref-keybindings .el-table td {
  border: none;
}
.pref-keybindings .el-table th.el-table__cell.is-leaf:last-child,
.pref-keybindings .el-table th:last-child,
.pref-keybindings .el-table td:last-child {
  border-right: 1px solid var(--tableBorderColor);
}
.pref-keybindings .el-table--border::after,
.pref-keybindings .el-table--group::after,
.pref-keybindings .el-table::before,
.pref-keybindings .el-table__fixed-right::before,
.pref-keybindings .el-table__fixed::before {
  background: var(--tableBorderColor);
}
.pref-keybindings .el-table__body tr.hover-row.current-row>td,
.pref-keybindings .el-table__body tr.hover-row.el-table__row--striped.current-row>td,
.pref-keybindings .el-table__body tr.hover-row.el-table__row--striped>td,
.pref-keybindings .el-table__body tr.hover-row>td {
  background: var(--selectionColor);
}
.pref-keybindings .el-table .el-table__cell {
  padding: 2px 0;
  margin: 0;
}
</style>
