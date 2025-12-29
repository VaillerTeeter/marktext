<template>
  <div class="pref-sidebar">
    <h3 class="title">{{ $t('pref.sidebar.title') }}</h3>
    <section class="category">
      <div v-for="c of localizedCategory" :key="c.label" class="item"
        @click="handleCategoryItemClick(c)"
        :class="{active: c.label === currentCategory}"
      >
        <svg :viewBox="c.icon.viewBox">
          <use :xlink:href="c.icon.url"></use>
        </svg>
        <span>{{ c.displayName }}</span>
      </div>
    </section>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron'
import { category } from './config'

export default {
  data () {
    this.category = category
    return {
      currentCategory: 'general'
    }
  },
  watch: {
    '$route' (to, from) {
      if (to.name !== from.name) {
        this.currentCategory = to.name
      }
    }
  },
  computed: {
    localizedCategory () {
      return this.category.map(c => ({
        ...c,
        displayName: this.localizedCategoryName(c.label)
      }))
    }
  },
  methods: {
    localizedCategoryName (categoryName) {
      const key = categoryName && categoryName.toLowerCase().replace(/\s+/g, '')
      const translated = key ? this.$t(`pref.sidebar.categories.${key}`) : categoryName
      return translated || categoryName
    },
    handleCategoryItemClick (item) {
      const { currentCategory } = this
      if (item.name.toLowerCase() !== currentCategory) {
        this.$router.push({
          path: item.path
        })
      }
    },
    onIpcCategoryChange (event, category) {
      const validRoute = category && this.$router.getRoutes().findIndex(route => route.path.endsWith(`/${category}`)) !== -1
      if (validRoute) {
        this.$router.push({
          path: `/preference/${category}`
        })
      }
    }
  },

  mounted () {
    if (this.$route && this.$route.name) {
      this.currentCategory = this.$route.name
    }
    ipcRenderer.on('settings::change-tab', this.onIpcCategoryChange)
  },
  unmounted () {
    ipcRenderer.removeAllListener('settings::change-tab', this.onIpcCategoryChange)
  }
}
</script>

<style>
  .pref-sidebar {
    -webkit-app-region: drag;
    display: flex;
    flex-direction: column;
    background: var(--sideBarBgColor);
    width: var(--prefSideBarWidth);
    height: 100vh;
    padding-top: 30px;
    box-sizing: border-box;
    & h3 {
      margin: 0;
      font-weight: normal;
      text-align: center;
      color: var(--sideBarColor);
    }
  }
  .category {
    -webkit-app-region: no-drag;
    overflow-y: auto;
    & .item {
      width: 100%;
      height: 50px;
      font-size: 18px;
      color: var(--sideBarColor);
      padding-left: 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      position: relative;
      user-select: none;
      & > svg {
        width: 28px;
        height: 28px;
        fill: var(--iconColor);
        margin-right: 15px;
      }
      &:hover {
        background: var(--sideBarItemHoverBgColor);
      }
      &::before {
        content: '';
        width: 4px;
        height: 0;
        background: var(--highlightThemeColor);
        position: absolute;
        left: 0;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
        transition: height .25s ease-in-out;
        top: 50%;
        transform: translateY(-50%);
      }
      &.active {
        color: var(--sideBarTitleColor);
      }
      &.active::before {
        height: 100%;
      }
    }
  }
</style>
