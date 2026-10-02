import DefaultTheme from 'vitepress/theme'
import { h, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import mediumZoom from 'medium-zoom'
import DocContribute from './DocContribute.vue'
import AsideActions from './AsideActions.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-after': () => h(DocContribute),
      'aside-outline-after': () => h(AsideActions)
    })
  },
  setup() {
    const route = useRoute()
    const initZoom = () => {
      mediumZoom('.vp-doc img', {
        background: 'rgba(20, 22, 26, 0.85)',
        margin: 24
      })
    }
    onMounted(() => {
      initZoom()
    })
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  }
}
