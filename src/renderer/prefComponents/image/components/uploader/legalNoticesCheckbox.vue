<template>
  <div class="pref-cb-legal-notices">
    <el-checkbox v-model="uploaderService.agreedToLegalNotices"></el-checkbox>
    <span>
      {{ $t('pref.image.uploader.legal.prefix', { name: uploaderService.name }) }}
      <span class="link" @click="openUrl(uploaderService.privacyUrl || $t('pref.image.uploader.legal.privacyUrl'))">{{ $t('pref.image.uploader.legal.privacy') }}</span>
      {{ $t('pref.image.uploader.legal.connector') }}
      <span class="link" @click="openUrl(uploaderService.tosUrl || $t('pref.image.uploader.legal.tosUrl'))">{{ $t('pref.image.uploader.legal.tos') }}</span>{{ $t('pref.image.uploader.legal.suffix') }}
      <span v-if="!uploaderService.isGdprCompliant">{{ $t('pref.image.uploader.legal.gdpr') }}</span>
    </span>
  </div>
</template>

<script>
import { shell } from 'electron'

export default {
  data () {
    return {}
  },
  props: {
    uploaderService: Object
  },
  methods: {
    openUrl (link) {
      if (link) {
        shell.openExternal(link)
      }
    }
  }
}
</script>

<style>
.pref-cb-legal-notices {
  border: 1px solid transparent;
  padding: 3px 5px;
  & .el-checkbox {
    margin-right: 0;
  }
}
</style>
