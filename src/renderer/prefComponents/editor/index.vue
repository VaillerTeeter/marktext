<template>
  <div class="pref-editor">
    <h4>{{ $t('pref.editor.title') }}</h4>
    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.editor.text.title') }}</h6>
      </template>
      <template #children>
        <range
          :description="$t('pref.editor.text.fontSize')"
          :value="fontSize"
          :min="12"
          :max="32"
          unit="px"
          :step="1"
          :onChange="value => onSelectChange('fontSize', value)"
        ></range>
        <range
          :description="$t('pref.editor.text.lineHeight')"
          :value="lineHeight"
          :min="1.2"
          :max="2.0"
          :step="0.1"
          :onChange="value => onSelectChange('lineHeight', value)"
        ></range>
        <font-text-box
          :description="$t('pref.editor.text.fontFamily')"
          :value="editorFontFamily"
          :placeholder="$t('pref.editor.text.fontPlaceholder')"
          :onChange="value => onSelectChange('editorFontFamily', value)"
        ></font-text-box>
        <text-box
          :description="$t('pref.editor.text.lineWidth')"
          :notes="$t('pref.editor.text.lineWidthNote')"
          :input="editorLineWidth"
          :regexValidator="/^(?:$|[0-9]+(?:ch|px|%)$)/"
          :onChange="value => onSelectChange('editorLineWidth', value)"
        ></text-box>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.editor.code.title') }}</h6>
      </template>
      <template #children>
        <range
          :description="$t('pref.editor.code.fontSize')"
          :value="codeFontSize"
          :min="12"
          :max="28"
          unit="px"
          :step="1"
          :onChange="value => onSelectChange('codeFontSize', value)"
        ></range>
        <font-text-box
          :description="$t('pref.editor.code.fontFamily')"
          :onlyMonospace="true"
          :value="codeFontFamily"
          :placeholder="$t('pref.editor.code.fontPlaceholder')"
          :onChange="value => onSelectChange('codeFontFamily', value)"
        ></font-text-box>
        <!-- FIXME: Disabled due to #1648. -->
        <bool
          v-show="false"
          :description="$t('pref.editor.code.lineNumbers')"
          :bool="codeBlockLineNumbers"
          :onChange="value => onSelectChange('codeBlockLineNumbers', value)"
        ></bool>
        <bool
          :description="$t('pref.editor.code.trimEmpty')"
          :bool="trimUnnecessaryCodeBlockEmptyLines"
          :onChange="value => onSelectChange('trimUnnecessaryCodeBlockEmptyLines', value)"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.editor.writing.title') }}</h6>
      </template>
      <template #children>
        <bool
          :description="$t('pref.editor.writing.autoBracket')"
          :bool="autoPairBracket"
          :onChange="value => onSelectChange('autoPairBracket', value)"
        ></bool>
        <bool
          :description="$t('pref.editor.writing.autoMarkdown')"
          :bool="autoPairMarkdownSyntax"
          :onChange="value => onSelectChange('autoPairMarkdownSyntax', value)"
        ></bool>
        <bool
          :description="$t('pref.editor.writing.autoQuote')"
          :bool="autoPairQuote"
          :onChange="value => onSelectChange('autoPairQuote', value)"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.editor.file.title') }}</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('pref.editor.file.tabWidth')"
          :value="tabSize"
          :options="tabSizeOptions"
          :onChange="value => onSelectChange('tabSize', value)"
        ></cur-select>
        <cur-select
          :description="$t('pref.editor.file.endOfLine')"
          :value="endOfLine"
          :options="endOfLineOptions"
          :onChange="value => onSelectChange('endOfLine', value)"
        ></cur-select>
        <cur-select
          :description="$t('pref.editor.file.defaultEncoding')"
          :value="defaultEncoding"
          :options="defaultEncodingOptions"
          :onChange="value => onSelectChange('defaultEncoding', value)"
        ></cur-select>
        <bool
          :description="$t('pref.editor.file.autoGuessEncoding')"
          :bool="autoGuessEncoding"
          :onChange="value => onSelectChange('autoGuessEncoding', value)"
        ></bool>
        <cur-select
          :description="$t('pref.editor.file.trailingNewline')"
          :value="trimTrailingNewline"
          :options="trimTrailingNewlineOptions"
          :onChange="value => onSelectChange('trimTrailingNewline', value)"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.editor.misc.title') }}</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('pref.editor.misc.textDirection')"
          :value="textDirection"
          :options="textDirectionOptions"
          :onChange="value => onSelectChange('textDirection', value)"
        ></cur-select>
        <bool
          :description="$t('pref.editor.misc.hideQuickInsertHint')"
          :bool="hideQuickInsertHint"
          :onChange="value => onSelectChange('hideQuickInsertHint', value)"
        ></bool>
        <bool
          :description="$t('pref.editor.misc.hideLinkPopup')"
          :bool="hideLinkPopup"
          :onChange="value => onSelectChange('hideLinkPopup', value)"
        ></bool>
        <bool
          :description="$t('pref.editor.misc.autoCheck')"
          :bool="autoCheck"
          :onChange="value => onSelectChange('autoCheck', value)"
        ></bool>
      </template>
    </compound>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Compound from '../common/compound'
import FontTextBox from '../common/fontTextBox'
import Range from '../common/range'
import CurSelect from '../common/select'
import Bool from '../common/bool'
import Separator from '../common/separator'
import TextBox from '../common/textBox'
import {
  tabSizeOptions,
  endOfLineOptions,
  textDirectionOptions,
  trimTrailingNewlineOptions,
  getDefaultEncodingOptions
} from './config'

export default {
  components: {
    Compound,
    FontTextBox,
    Range,
    CurSelect,
    Bool,
    Separator,
    TextBox
  },
  data () {
    return {}
  },
  computed: {
    ...mapState({
      fontSize: state => state.preferences.fontSize,
      editorFontFamily: state => state.preferences.editorFontFamily,
      lineHeight: state => state.preferences.lineHeight,
      autoPairBracket: state => state.preferences.autoPairBracket,
      autoPairMarkdownSyntax: state => state.preferences.autoPairMarkdownSyntax,
      autoPairQuote: state => state.preferences.autoPairQuote,
      tabSize: state => state.preferences.tabSize,
      endOfLine: state => state.preferences.endOfLine,
      textDirection: state => state.preferences.textDirection,
      codeFontSize: state => state.preferences.codeFontSize,
      codeFontFamily: state => state.preferences.codeFontFamily,
      codeBlockLineNumbers: state => state.preferences.codeBlockLineNumbers,
      trimUnnecessaryCodeBlockEmptyLines: state => state.preferences.trimUnnecessaryCodeBlockEmptyLines,
      hideQuickInsertHint: state => state.preferences.hideQuickInsertHint,
      hideLinkPopup: state => state.preferences.hideLinkPopup,
      autoCheck: state => state.preferences.autoCheck,
      editorLineWidth: state => state.preferences.editorLineWidth,
      defaultEncoding: state => state.preferences.defaultEncoding,
      autoGuessEncoding: state => state.preferences.autoGuessEncoding,
      trimTrailingNewline: state => state.preferences.trimTrailingNewline
    }),
    tabSizeOptions () {
      return tabSizeOptions
    },
    endOfLineOptions () {
      return endOfLineOptions.map(option => ({
        ...option,
        label: this.$t(`pref.editor.options.endOfLine.${option.value}`)
      }))
    },
    textDirectionOptions () {
      return textDirectionOptions.map(option => ({
        ...option,
        label: this.$t(`pref.editor.options.textDirection.${option.value}`)
      }))
    },
    trimTrailingNewlineOptions () {
      const valueToKey = {
        0: 'trimAll',
        1: 'ensureOne',
        2: 'preserve',
        3: 'none'
      }
      return trimTrailingNewlineOptions.map(option => ({
        ...option,
        label: this.$t(`pref.editor.options.trimTrailingNewline.${valueToKey[option.value]}`)
      }))
    },
    defaultEncodingOptions () {
      // Encoding names come from ENCODING_NAME_MAP and are already human-friendly.
      return getDefaultEncodingOptions()
    }
  },
  methods: {
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    }
  }
}
</script>

<style scoped>
  .pref-editor {
    & .image-ctrl {
      font-size: 14px;
      user-select: none;
      margin: 20px 0;
      color: var(--editorColor);
      & label {
        display: block;
        margin: 20px 0;
      }
    }
  }
</style>
