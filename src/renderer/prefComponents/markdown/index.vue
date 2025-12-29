<template>
  <div class="pref-markdown">
    <h4>{{ $t('pref.markdown.title') }}</h4>
    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.markdown.lists.title') }}</h6>
      </template>
      <template #children>
        <bool
          :description="$t('pref.markdown.lists.preferLoose')"
          :bool="preferLooseListItem"
          :onChange="value => onSelectChange('preferLooseListItem', value)"
          more="https://spec.commonmark.org/0.29/#loose"
        ></bool>
        <cur-select
          :description="$t('pref.markdown.lists.bulletMarker')"
          :value="bulletListMarker"
          :options="bulletListMarkerOptions"
          :onChange="value => onSelectChange('bulletListMarker', value)"
          more="https://spec.commonmark.org/0.29/#bullet-list-marker"
        ></cur-select>
        <cur-select
          :description="$t('pref.markdown.lists.orderMarker')"
          :value="orderListDelimiter"
          :options="orderListDelimiterOptions"
          :onChange="value => onSelectChange('orderListDelimiter', value)"
          more="https://spec.commonmark.org/0.29/#ordered-list"
        ></cur-select>
        <cur-select
          :description="$t('pref.markdown.lists.indentation')"
          :value="listIndentation"
          :options="listIndentationOptions"
          :onChange="value => onSelectChange('listIndentation', value)"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.markdown.extensions.title') }}</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('pref.markdown.extensions.frontmatter')"
          :value="frontmatterType"
          :options="frontmatterTypeOptions"
          :onChange="value => onSelectChange('frontmatterType', value)"
        ></cur-select>
        <bool
          :description="$t('pref.markdown.extensions.superSub')"
          :bool="superSubScript"
          :onChange="value => onSelectChange('superSubScript', value)"
          more="https://pandoc.org/MANUAL.html#superscripts-and-subscripts"
        ></bool>
        <bool
          :description="$t('pref.markdown.extensions.footnote')"
          :notes="$t('pref.markdown.extensions.footnoteNote')"
          :bool="footnote"
          :onChange="value => onSelectChange('footnote', value)"
          more="https://pandoc.org/MANUAL.html#footnotes"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.markdown.compatibility.title') }}</h6>
      </template>
      <template #children>
        <bool
          :description="$t('pref.markdown.compatibility.html')"
          :bool="isHtmlEnabled"
          :onChange="value => onSelectChange('isHtmlEnabled', value)"
        ></bool>
        <bool
          :description="$t('pref.markdown.compatibility.gitlab')"
          :bool="isGitlabCompatibilityEnabled"
          :onChange="value => onSelectChange('isGitlabCompatibilityEnabled', value)"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.markdown.diagrams.title') }}</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('pref.markdown.diagrams.sequenceTheme')"
          :value="sequenceTheme"
          :options="sequenceThemeOptions"
          :onChange="value => onSelectChange('sequenceTheme', value)"
          more="https://bramp.github.io/js-sequence-diagrams/"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('pref.markdown.misc.title') }}</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('pref.markdown.misc.headingStyle')"
          :value="preferHeadingStyle"
          :options="preferHeadingStyleOptions"
          :onChange="value => onSelectChange('preferHeadingStyle', value)"
          :disable="true"
        ></cur-select>
      </template>
    </compound>
  </div>
</template>

<script>
import Compound from '../common/compound'
import Separator from '../common/separator'
import { mapState } from 'vuex'
import Bool from '../common/bool'
import CurSelect from '../common/select'
import {
  bulletListMarkerOptions,
  orderListDelimiterOptions,
  preferHeadingStyleOptions,
  listIndentationOptions,
  frontmatterTypeOptions,
  sequenceThemeOptions
} from './config'

export default {
  components: {
    Compound,
    Separator,
    Bool,
    CurSelect
  },
  data () {
    return {}
  },
  computed: {
    ...mapState({
      preferLooseListItem: state => state.preferences.preferLooseListItem,
      bulletListMarker: state => state.preferences.bulletListMarker,
      orderListDelimiter: state => state.preferences.orderListDelimiter,
      preferHeadingStyle: state => state.preferences.preferHeadingStyle,
      listIndentation: state => state.preferences.listIndentation,
      frontmatterType: state => state.preferences.frontmatterType,
      superSubScript: state => state.preferences.superSubScript,
      footnote: state => state.preferences.footnote,
      isHtmlEnabled: state => state.preferences.isHtmlEnabled,
      isGitlabCompatibilityEnabled: state => state.preferences.isGitlabCompatibilityEnabled,
      sequenceTheme: state => state.preferences.sequenceTheme
    }),
    bulletListMarkerOptions () {
      return bulletListMarkerOptions
    },
    orderListDelimiterOptions () {
      return orderListDelimiterOptions
    },
    preferHeadingStyleOptions () {
      return preferHeadingStyleOptions.map(option => ({
        ...option,
        label: this.$t(`pref.markdown.options.heading.${option.value}`)
      }))
    },
    listIndentationOptions () {
      return listIndentationOptions.map(option => {
        const value = option.value
        const key = value === 'dfm'
          ? 'dfm'
          : value === 'tab'
            ? 'tab'
            : `space${value}`
        return {
          ...option,
          label: this.$t(`pref.markdown.options.listIndentation.${key}`)
        }
      })
    },
    frontmatterTypeOptions () {
      const valueToKey = {
        '-': 'yaml',
        '+': 'toml',
        ';': 'jsonSemi',
        '{': 'jsonCurly'
      }
      return frontmatterTypeOptions.map(option => ({
        ...option,
        label: this.$t(`pref.markdown.options.frontmatter.${valueToKey[option.value]}`)
      }))
    },
    sequenceThemeOptions () {
      return sequenceThemeOptions.map(option => ({
        ...option,
        label: this.$t(`pref.markdown.options.sequenceTheme.${option.value}`)
      }))
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
  .pref-markdown {
  }
</style>
