<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from './composables/useI18n.js'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

const { t } = useI18n()

// 配图引用
import imgInstallRepo from './assets/docs/doc-install-repo.webp'
import imgInstallRelease from './assets/docs/doc-install-release.webp'
import imgBrushImport from './assets/docs/doc-brush-import.webp'
import imgBrushQq from './assets/docs/doc-brush-qq.webp'
import imgUiSettings from './assets/docs/doc-ui-settings.webp'
import imgUiMain from './assets/docs/doc-ui-main.webp'
import imgUiLeftbar from './assets/docs/doc-ui-leftbar.webp'
import imgLayersPresets from './assets/docs/doc-layers-presets.webp'
import imgFeedbackIssue from './assets/docs/doc-feedback-issue.webp'

// 五大核心章节导航（精简清晰版）
const navSections = [
  {
    index: '01',
    group: '入门与手势',
    items: [
      { id: 'intro-install', label: '软件架构与安装授权' },
      { id: 'canvas-ui', label: '画布总览与工具定制' },
      { id: 'gestures-touch', label: '触控手势与快捷操作' }
    ]
  },
  {
    index: '02',
    group: '图层与核心机制',
    items: [
      { id: 'inherit-alpha', label: '继承透明度（剪贴蒙版）' },
      { id: 'layer-system', label: '图层体系与混合模式' }
    ]
  },
  {
    index: '03',
    group: '手写笔与工坊',
    items: [
      { id: 'stylus-hardware', label: '多品牌手写笔适配' },
      { id: 'stylus-experience', label: '压感曲线与纸感声学' },
      { id: 'brush-studio', label: '笔刷工坊与平滑算法' }
    ]
  },
  {
    index: '04',
    group: '创作与进阶工具',
    items: [
      { id: 'color-tools', label: '色彩面板与 3D 光影球' },
      { id: 'shapes-guides', label: '几何形状与绘图辅助' },
      { id: 'selection-transform', label: '选区运算与液化变换' },
      { id: 'filters-suite', label: '35 种滤镜与线稿提取' },
      { id: 'animation-workflow', label: '逐帧动画与洋葱皮' }
    ]
  },
  {
    index: '05',
    group: '工程与社群',
    items: [
      { id: 'project-timelapse', label: '工程规范与延时摄影' },
      { id: 'community-feedback', label: '问题反馈与交流群' }
    ]
  }
]

const searchQuery = ref('')
const activeSectionId = ref('intro-install')
const mobileMenuOpen = ref(false)
const showBackToTop = ref(false)
const scrollProgress = ref(0)
const copiedMap = ref({})
const lightboxImg = ref(null)

const allItems = computed(() => navSections.flatMap((g) => g.items))

const currentItem = computed(() => {
  return allItems.value.find((item) => item.id === activeSectionId.value) || allItems.value[0]
})

const currentGroup = computed(() => {
  for (const g of navSections) {
    if (g.items.some((item) => item.id === activeSectionId.value)) {
      return g
    }
  }
  return navSections[0]
})

const currentGroupTitle = computed(() => currentGroup.value ? `${currentGroup.value.index} ${currentGroup.value.group}` : '')
const currentItemTitle = computed(() => currentItem.value ? currentItem.value.label : '')

let isProgrammaticScroll = false
let scrollTimer = null

function updateActiveSection() {
  if (isProgrammaticScroll) return

  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - window.innerHeight

  // 1. 顶部位置优先激活第一项
  if (scrollY < 120) {
    if (allItems.value.length > 0) {
      activeSectionId.value = allItems.value[0].id
    }
    return
  }

  // 2. 滚动触底时激活最后一项
  if (docHeight > 0 && scrollY >= docHeight - 70) {
    if (allItems.value.length > 0) {
      activeSectionId.value = allItems.value[allItems.value.length - 1].id
    }
    return
  }

  // 3. 动态寻找阅读中线（移动端 160px / 桌面端 180px）所在的章节
  const isMobile = window.innerWidth <= 960
  const readingLine = isMobile ? 160 : 180
  let matchedId = null

  for (let i = allItems.value.length - 1; i >= 0; i--) {
    const item = allItems.value[i]
    const el = document.getElementById(item.id)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= readingLine) {
        matchedId = item.id
        break
      }
    }
  }

  if (matchedId) {
    activeSectionId.value = matchedId
  } else if (allItems.value.length > 0) {
    activeSectionId.value = allItems.value[0].id
  }
}

function copyText(key, text) {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
    copiedMap.value[key] = true
    setTimeout(() => {
      copiedMap.value[key] = false
    }, 2000)
  }
}

function openLightbox(src, caption) {
  lightboxImg.value = { src, caption }
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxImg.value = null
  document.body.style.overflow = ''
}

function handleKeydown(e) {
  if (e.key === 'Escape' && lightboxImg.value) {
    closeLightbox()
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    document.querySelector('.search-input')?.focus()
  }
}

function scrollToAnchor(id) {
  mobileMenuOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    isProgrammaticScroll = true
    activeSectionId.value = id

    const isMobile = window.innerWidth <= 960
    const yOffset = isMobile ? -108 : -76
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset

    window.scrollTo({ top: y, behavior: 'smooth' })

    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      isProgrammaticScroll = false
      updateActiveSection()
    }, 700)
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (mobileMenuOpen.value) {
    setTimeout(() => {
      const activeEl = document.querySelector('.docs-sidebar .nav-item.active')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }, 120)
  }
}

function onScroll() {
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0
  showBackToTop.value = scrollY > 400

  updateActiveSection()
}

const filteredNav = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return navSections
  return navSections
    .map((group) => {
      const matched = group.items.filter(
        (item) => item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
      )
      return { ...group, items: matched }
    })
    .filter((g) => g.items.length > 0)
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateActiveSection, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  if (window.location.hash) {
    const id = window.location.hash.replace('#', '')
    setTimeout(() => scrollToAnchor(id), 120)
  } else {
    updateActiveSection()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateActiveSection)
  window.removeEventListener('keydown', handleKeydown)
  clearTimeout(scrollTimer)
})
</script>

<template>
  <div class="docs-layout">
    <!-- 顶部阅读进度指示条 -->
    <div class="scroll-progress-line" :style="{ width: `${scrollProgress}%` }"></div>

    <!-- 顶部常驻导航栏 -->
    <header class="docs-header">
      <div class="header-inner">
        <div class="header-brand">
          <a href="/" class="brand-link" title="返回官网首页">
            <span class="brand-text">ReveriePaint</span>
          </a>
          <span class="brand-divider">/</span>
          <span class="brand-doc-tag">{{ t('docsNav.brandTag') }}</span>
        </div>

        <div class="header-search">
          <div class="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('docsNav.searchPlaceholder')"
              class="search-input"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="search-clear"
              @click="searchQuery = ''"
            >
              ×
            </button>
          </div>
        </div>

        <div class="header-nav">
          <LanguageSwitcher compact />
          <a href="/" class="header-link desktop-only">{{ t('docsNav.home') }}</a>
          <a
            href="https://github.com/LanRhyme/ReveriePaint"
            target="_blank"
            rel="noopener"
            class="header-link desktop-only"
          >
            GitHub
          </a>
          <button
            type="button"
            class="header-copy-btn desktop-only"
            @click="copyText('qqHeader', '729283213')"
          >
            {{ copiedMap['qqHeader'] ? t('docsNav.copiedGroup') : t('docsNav.qqGroup') }}
          </button>
          <button
            type="button"
            class="mobile-menu-btn"
            aria-label="目录"
            @click="toggleMobileMenu"
          >
            {{ mobileMenuOpen ? t('docsNav.collapse') : t('docsNav.toc') }}
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端吸顶章节指示条（实时随滚动同步章节，点击展开目录） -->
    <div class="mobile-subbar" @click="toggleMobileMenu">
      <div class="mobile-subbar-inner">
        <div class="mobile-subbar-title">
          <span class="subbar-group">{{ currentGroupTitle }}</span>
          <span class="subbar-sep">/</span>
          <span class="subbar-item">{{ currentItemTitle }}</span>
        </div>
        <div :class="['mobile-subbar-btn', { 'is-open': mobileMenuOpen }]">
          <span>{{ mobileMenuOpen ? t('docsNav.collapse') : t('docsNav.toc') }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 核心视图区域（居中平衡双栏布局） -->
    <div class="docs-viewport">
      <!-- 左侧大纲导航栏（5 大章节清晰流） -->
      <aside :class="['docs-sidebar', { 'is-open': mobileMenuOpen }]">
        <nav class="sidebar-nav">
          <div v-for="group in filteredNav" :key="group.group" class="nav-group">
            <div class="group-title">
              <span class="group-num">{{ group.index }}</span>
              <span class="group-text">{{ group.group }}</span>
            </div>
            <ul class="group-list">
              <li v-for="item in group.items" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  :class="['nav-item', { active: activeSectionId === item.id }]"
                  @click.prevent="scrollToAnchor(item.id)"
                >
                  <span class="item-text">{{ item.label }}</span>
                </a>
              </li>
            </ul>
          </div>
          <div v-if="filteredNav.length === 0" class="search-empty">
            无匹配章节内容
          </div>

          <!-- 移动端侧边抽屉底部快捷外链 -->
          <div class="sidebar-mobile-footer">
            <div class="mobile-footer-divider"></div>
            <div class="mobile-footer-links">
              <a href="/" class="mobile-footer-link">官网首页</a>
              <a href="https://github.com/LanRhyme/ReveriePaint/releases" target="_blank" rel="noopener" class="mobile-footer-link">Releases</a>
              <a href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android" target="_blank" rel="noopener" class="mobile-footer-link">Mirror酱</a>
              <a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener" class="mobile-footer-link">GitHub</a>
              <a href="https://qm.qq.com/q/729283213" target="_blank" rel="noopener" class="mobile-footer-link">QQ 交流群</a>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 遮罩（移动端侧边栏展开时） -->
      <div
        v-if="mobileMenuOpen"
        class="sidebar-backdrop"
        @click="mobileMenuOpen = false"
      ></div>

      <!-- 右侧主体内容流 -->
      <main class="docs-main">
        <!-- 篇首标题 -->
        <header class="doc-lead-header">
          <p class="doc-badge">官方技术手册 · 完整特性指南</p>
          <h1 class="doc-title">ReveriePaint 使用文档</h1>
          <p class="doc-desc">
            基于 Krita 核心渲染架构的 Android 原生数字绘画系统，涵盖手势控制、图层继承不透明度、手写笔微震声学与全量工具调校
          </p>
        </header>

        <!-- 01 入门与手势 -->
        <section id="intro-install" class="doc-section">
          <h2>
            <a href="#intro-install" class="anchor">#</a>
            软件架构与安装授权
          </h2>
          <p>
            ReveriePaint 深度整合 Krita 核心图形内核，专为 Android 触控与平板设备优化打造，提供流畅跟手的原生绘画体验
          </p>
          <div class="feature-bullets">
            <div class="bullet-card">
              <strong>系统基准：</strong>适用于 Android 7.0 及以上版本（API Level 24+），推荐 64 位 ARM64 架构芯片
            </div>
            <div class="bullet-card">
              <strong>内存调度：</strong>无硬编码图层上限，系统依照设备当前可用内存动态评估最大安全图层深度
            </div>
            <div class="bullet-card">
              <strong>系统兼容提示：</strong>由于图形驱动差异，HarmonyOS NEXT 纯血架构兼容性较弱，推荐在标准 Android 设备上使用
            </div>
          </div>

          <h3 class="doc-h3">获取 APK 安装包通道</h3>
          <p>
            ReveriePaint 遵循 GPL-3.0 协议开源，官方优先推荐通过 GitHub Releases 获取正版构建，国内网络环境亦可通过 Mirror酱 下载：
          </p>
          <figure class="clean-figure" @click="openLightbox(imgInstallRepo, 'GitHub Releases 下载入口')">
            <img :src="imgInstallRepo" alt="GitHub Releases 下载入口" loading="lazy" />
            <figcaption>前往官方仓库右侧 Releases 查看最新版本与构建产物</figcaption>
          </figure>
          <figure class="clean-figure" @click="openLightbox(imgInstallRelease, '选择对应架构 APK 安装')">
            <img :src="imgInstallRelease" alt="选择对应架构 APK 安装" loading="lazy" />
            <figcaption>一般平板与手机下载 arm64-v8a 版本即可获得最高渲染效能</figcaption>
          </figure>
          <div class="link-pills">
            <a
              href="https://github.com/LanRhyme/ReveriePaint/releases"
              target="_blank"
              rel="noopener"
              class="download-pill primary"
            >
              GitHub Releases 官方发布页（主要渠道） →
            </a>
            <a
              href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android"
              target="_blank"
              rel="noopener"
              class="download-pill"
            >
              Mirror酱镜像下载（第三方付费高速下载服务） →
            </a>
          </div>
          <ul class="bullet-list">
            <li>在系统浏览器或文件管理器中点击下载的 APK 文件，允许「安装未知来源应用」</li>
            <li>首次启动提示授予存储空间权限，用于工程读写与笔刷资源加载</li>
            <li>支持蓝牙与外设连接授权，用于获取手写笔电量、侧键动作与星闪超采样数据</li>
          </ul>

          <h3 class="doc-h3">已知待优化与路线图</h3>
          <ul class="bullet-list">
            <li><strong>Photoshop ABR 格式：</strong>后续版本将实现直接解析 <code>.abr</code> 二进制笔刷包（当前支持提取 PNG 笔尖导入工坊）</li>
            <li><strong>矢量文字编辑：</strong>更丰富的排版对齐与外置字体加载正在排期适配</li>
          </ul>
        </section>

        <section id="canvas-ui" class="doc-section">
          <h2>
            <a href="#canvas-ui" class="anchor">#</a>
            画布总览与工具定制
          </h2>
          <p>
            画布界面针对触控与大屏平板深度优化，提供可伸缩、可定制的沉浸创作视界：
          </p>
          <figure class="clean-figure" @click="openLightbox(imgUiMain, 'ReveriePaint 平板主画布界面总览')">
            <img :src="imgUiMain" alt="ReveriePaint 平板主画布界面总览" loading="lazy" />
            <figcaption>各功能分区：左侧工具栏、快捷滑块、图层面板、色轮与浮动视窗</figcaption>
          </figure>
          <figure class="clean-figure" style="max-width: 580px;" @click="openLightbox(imgUiLeftbar, '左侧菜单栏使用说明')">
            <img :src="imgUiLeftbar" alt="左侧菜单栏使用说明" loading="lazy" />
            <figcaption>工具栏支持上下滑动浏览，点击底部展开按钮可自由编辑常用工具排布</figcaption>
          </figure>
          <figure class="clean-figure" style="max-width: 580px;" @click="openLightbox(imgUiSettings, '主题设置界面')">
            <img :src="imgUiSettings" alt="主题设置界面" loading="lazy" />
            <figcaption>设置 ＞ 偏好与硬件 ＞ 主题设置，可调整界面尺寸与侧边滑块板长短</figcaption>
          </figure>

          <h3 class="doc-h3">画布手势裁切扩展与重采样</h3>
          <p>
            点击顶栏画布调整入口可随时重塑画幅边界与分辨率，手势下沉穿透且支持完整撤销与重做：
          </p>
          <ul class="bullet-list">
            <li><strong>裁切与扩展（Crop & Expand）：</strong>支持双指直接捏合选框或向外扩展画布边界，配合九宫格锚点对齐锁定基准方向，改动尺寸不拉伸画面原有像素</li>
            <li><strong>全图重采样（Resample & Scale）：</strong>支持自由比例与原始比例锁定，对全画布所有图层像素执行高质量重采样插值缩放</li>
            <li><strong>实时安全看板：</strong>调整尺寸时面板动态推算并展示当前设备内存下的最大安全推荐图层数</li>
            <li><strong>悬浮折叠面板：</strong>面板宽度缩减至 352dp 紧凑布局，标题栏全行支持自由拖拽悬浮与避让边缘贴合，支持快速折叠收起</li>
          </ul>

          <h3 class="doc-h3">左手模式与防误触</h3>
          <ul class="bullet-list">
            <li><strong>全界面镜像停靠：</strong>在偏好设置中开启左手模式后，工具栏、快捷滑块、顶栏以及全部浮动面板自适应镜像至屏幕右侧</li>
            <li><strong>动态边缘返回手势排除：</strong>基于 Android 10+ 动态全高度排除左右边缘返回手势，彻底避免在画布边缘运笔起笔时误触发系统返回</li>
          </ul>

          <h3 class="doc-h3">画布视图辅助设置</h3>
          <ul class="bullet-list">
            <li><strong>像素网格（Pixel Grid）：</strong>超微距放大画布超过 1600% 时自动显现单像素网格分界线，精准绘制像素画</li>
            <li><strong>放大插值平滑（Magnification Interpolation）：</strong>开启时放大视口采用双线性平滑滤波，关闭时呈现清晰马赛克锐利边缘</li>
            <li><strong>快捷侧滑块（Quick Sliders）：</strong>常驻控制笔刷尺寸与不透明度，可配置单滑块或双滑块展开</li>
            <li><strong>画布自由旋转（Canvas Rotation）：</strong>可开启或锁定画布旋转手势，防止双指缩放漫游时误触倾斜</li>
          </ul>
        </section>

        <section id="gestures-touch" class="doc-section">
          <h2>
            <a href="#gestures-touch" class="anchor">#</a>
            触控手势与快捷操作
          </h2>
          <p>
            画布内置原生硬件级多点手势识别引擎，精准区分单指取色、双指漫游与多指快捷回退：
          </p>
          <div class="table-container">
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 28%;">手势动作</th>
                  <th style="width: 32%;">触发效果</th>
                  <th>详细说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>双指捏合 / 旋转 / 移动</code></td>
                  <td>画布缩放、旋转与平移</td>
                  <td>围绕双指中心平滑缩放、旋转与拖拽平移，松手后保持当前视角</td>
                </tr>
                <tr>
                  <td><code>双指同时轻点</code></td>
                  <td>撤销（Undo）</td>
                  <td>轻触屏幕瞬时回退上一笔或上一次图层修改</td>
                </tr>
                <tr>
                  <td><code>双指按住不放</code></td>
                  <td>连续高速撤销</td>
                  <td>双指按在屏幕上不放即可持续向前快速回退历史记录</td>
                </tr>
                <tr>
                  <td><code>三指同时轻点</code></td>
                  <td>重做（Redo）</td>
                  <td>轻触屏幕瞬时恢复刚刚撤销的操作步数</td>
                </tr>
                <tr>
                  <td><code>三指按住不放</code></td>
                  <td>连续高速重做</td>
                  <td>三指按在屏幕上不放即可持续向后快速恢复操作</td>
                </tr>
                <tr>
                  <td><code>双指快速向内捏合</code></td>
                  <td>适应屏幕（Quick-Pinch to Fit）</td>
                  <td>瞬时将画布居中并缩放至满屏可视范围，附带平滑阻尼过渡动画</td>
                </tr>
                <tr>
                  <td><code>单指长按屏幕不放</code></td>
                  <td>悬浮取色（Eyedropper）</td>
                  <td>呼出双环动态取色盘，垂直防遮挡偏移显示在手指上方</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h3">长按取色与触控隔离</h3>
          <ul class="bullet-list">
            <li><strong>悬浮动态取色环：</strong>内环显示当前画笔原色，外环显示触点下方最新采样色，便于对比明度与冷暖差异</li>
            <li><strong>防遮挡垂直偏移：</strong>取色圆环自动向上偏移显示在手指或笔尖上方，解决指尖遮挡视线问题</li>
            <li><strong>仅手写笔模式：</strong>开启后画布仅接收主动手写笔绘制输入，手指仅用于缩放漫游，手掌自然贴靠不误触</li>
            <li><strong>长按空格抓手平移：</strong>外接键盘长按 Space 键临时切换抓手平移（Hold-to-Pan），拖拽平移画布，松手自动恢复原有工具</li>
          </ul>

          <h3 class="doc-h3">外接实体键盘快捷键全集</h3>
          <p>连接蓝牙或平板外接键盘时，支持完整桌面级快捷键指令：</p>
          <div class="table-container">
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 25%;">分类</th>
                  <th style="width: 35%;">功能</th>
                  <th>快捷键组合</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>绘画工具</td>
                  <td>画笔 / 橡皮 / 涂抹</td>
                  <td><code>B</code> / <code>E</code> / <code>S</code></td>
                </tr>
                <tr>
                  <td>笔刷调整</td>
                  <td>增大 / 缩小尺寸</td>
                  <td><code>]</code> / <code>[</code></td>
                </tr>
                <tr>
                  <td>浓度控制</td>
                  <td>增大 / 缩小不透明度</td>
                  <td><code>Ctrl + ]</code> / <code>Ctrl + [</code></td>
                </tr>
                <tr>
                  <td>颜色操作</td>
                  <td>调色面板 / 交换主副颜色</td>
                  <td><code>PageUp</code> / <code>X</code></td>
                </tr>
                <tr>
                  <td>工具快切</td>
                  <td>当前工具与橡皮快速切换</td>
                  <td><code>PageDown</code></td>
                </tr>
                <tr>
                  <td>画布漫游</td>
                  <td>平移画布（长按） / 水平翻转 / 旋转</td>
                  <td><code>Space</code> / <code>H</code> / <code>R</code></td>
                </tr>
                <tr>
                  <td>视口缩放</td>
                  <td>放大画布 / 缩小画布</td>
                  <td><code>Ctrl + =</code> / <code>Ctrl + -</code></td>
                </tr>
                <tr>
                  <td>历史与工程</td>
                  <td>保存 / 撤销 / 重做 / 取消选区</td>
                  <td><code>Ctrl + S</code> / <code>Ctrl + Z</code> / <code>Ctrl + Shift + Z</code> / <code>Ctrl + D</code></td>
                </tr>
                <tr>
                  <td>选区与吸管</td>
                  <td>矩形选区 / 套索 / 魔棒 / 吸管</td>
                  <td><code>M</code> / <code>L</code> / <code>W</code> / <code>I</code></td>
                </tr>
                <tr>
                  <td>填充与变换</td>
                  <td>油漆桶 / 渐变 / 裁剪 / 自由变换 / 移动</td>
                  <td><code>G</code> / <code>Shift + G</code> / <code>C</code> / <code>Ctrl + T</code> / <code>V</code></td>
                </tr>
                <tr>
                  <td>图层管理</td>
                  <td>新建图层 / 复制 / 向下合并 / 显隐 / 删除</td>
                  <td><code>Ctrl + Shift + N</code> / <code>Ctrl + J</code> / <code>Ctrl + E</code> / <code>Ctrl + H</code> / <code>Delete</code></td>
                </tr>
                <tr>
                  <td>色彩滤镜</td>
                  <td>色相饱和度 / 色彩曲线</td>
                  <td><code>Ctrl + U</code> / <code>Ctrl + M</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 02 图层与核心机制 -->
        <section id="inherit-alpha" class="doc-section">
          <h2>
            <a href="#inherit-alpha" class="anchor">#</a>
            继承透明度（Inherit Alpha）替代传统剪贴蒙版
          </h2>
          <p>
            许多从 Photoshop、Procreate 或 SAI 转入的画师会寻找独立的「剪贴蒙版」按钮，在 ReveriePaint 中，由于采用与 Krita 完全同源的通道渲染架构，剪切操作由<strong>「继承透明度（Inherit Alpha）」结合「图层组（Group）」</strong>完美实现
          </p>

          <div class="note-box">
            <p><strong>底层机制说明：</strong>传统剪切蒙版是将上层强制绑定到底层，而 Krita / ReveriePaint 基于图层通道的累积合成机制，开启「继承透明度」后，图层不会扩展 Alpha 边界，其色彩只会在下方已有像素的区域内成像</p>
          </div>

          <h3 class="doc-h3">等效剪贴蒙版的标准实操四步法</h3>
          <div class="layer-steps">
            <div class="step-card">
              <span class="step-num">01</span>
              <div>
                <strong>创建图层组</strong>
                <p>点击图层面板底部的文件夹图标，新建一个图层组作为剪切容器</p>
              </div>
            </div>
            <div class="step-card">
              <span class="step-num">02</span>
              <div>
                <strong>放置剪切基底（底色）</strong>
                <p>将定义形状的基底图层（如人物平涂底色）拖入该组的最底部，保持普通状态，不要开启继承透明度</p>
              </div>
            </div>
            <div class="step-card">
              <span class="step-num">03</span>
              <div>
                <strong>新建细节与阴影层</strong>
                <p>在基底图层上方创建新的绘画图层，用于绘制阴影、腮红、高光或纹理</p>
              </div>
            </div>
            <div class="step-card">
              <span class="step-num">04</span>
              <div>
                <strong>开启继承透明度</strong>
                <p>点击新图层右侧的回形针剪切图标（或在图层操作面板中勾选「继承透明度」）即可立即完成剪切</p>
              </div>
            </div>
          </div>

          <h3 class="doc-h3">图层层级组织示意图</h3>
          <div class="layer-tree-card">
            <div class="tree-line group-root">
              <span class="tree-badge">组</span>
              <span class="tree-name">图层组：角色上色（Group Layer · 隔离外部）</span>
            </div>
            <div class="tree-line tree-child">
              <span class="tree-branch">├─</span>
              <span class="tree-item active-clip">
                图层 3: 边缘泛光 · [开启: 继承透明度] ──> 仅投影在图层 1 轮廓内
              </span>
            </div>
            <div class="tree-line tree-child">
              <span class="tree-branch">├─</span>
              <span class="tree-item active-clip">
                图层 2: 阴影刻画 · [开启: 继承透明度] ──> 仅投影在图层 1 轮廓内
              </span>
            </div>
            <div class="tree-line tree-child">
              <span class="tree-branch">└─</span>
              <span class="tree-item base-layer">
                图层 1: 角色平涂底色 · [关闭: 继承透明度] ──> 剪切基底（决定整体 Alpha）
              </span>
            </div>
            <div class="tree-line tree-outer">
              <span class="tree-badge outer">层</span>
              <span class="tree-name">图层 0: 背景场景（位于组外 · 完全不受上方继承透明度影响）</span>
            </div>
          </div>

          <div class="note-box warning">
            <p><strong>图层组穿透（Pass-through）说明：</strong>图层组默认处于隔离状态，组内继承透明度仅在组内有效，绝不渗漏到组外，若在图层组菜单中打开「穿透」，组内内容将向下继承外部整个画布的透明度</p>
          </div>

          <h3 class="doc-h3">锁定透明度与继承透明度对比</h3>
          <div class="table-container">
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 24%;">特性项目</th>
                  <th style="width: 38%;">锁定透明度（Alpha Lock）</th>
                  <th style="width: 38%;">继承透明度（Inherit Alpha）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>作用范围</strong></td>
                  <td>仅作用于当前单个图层自身</td>
                  <td>向下继承组内所有图层的合并 Alpha 轮廓</td>
                </tr>
                <tr>
                  <td><strong>绘制方式</strong></td>
                  <td>直接在原图层上覆盖改色（破坏性操作）</td>
                  <td>独立新建多层绘制（非破坏性分层操作）</td>
                </tr>
                <tr>
                  <td><strong>后期修改</strong></td>
                  <td>原色与新色混合在一起，无法独立调整不透明度</td>
                  <td>随时可以隐藏、删除、调整各层不透明度与混合模式</td>
                </tr>
                <tr>
                  <td><strong>多层剪切</strong></td>
                  <td>不支持，仅限单层</td>
                  <td>支持在同一图层组内任意堆叠数十个继承透明层</td>
                </tr>
                <tr>
                  <td><strong>适用场景</strong></td>
                  <td>快速给单条线稿换色、简单色块微调</td>
                  <td>赛璐璐阴影、二分光影、复杂材质贴图与多重高光</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="layer-system" class="doc-section">
          <h2>
            <a href="#layer-system" class="anchor">#</a>
            图层体系与混合模式
          </h2>
          <p>
            ReveriePaint 具备完整的图层堆栈架构，支持以下原生图层形式：
          </p>
          <ul class="bullet-list">
            <li><strong>绘画图层（Paint Layer）：</strong>标准栅格位图层，承载水彩、油画、勾线等笔刷渲染像素</li>
            <li><strong>描边图层（Stroke Layer）：</strong>专为轮廓勾线设计的图层，在上面作画会自动实时生成描边，可随时调整粗细、颜色、位置（外侧/居中/内侧）或转为普通图层</li>
            <li><strong>图层组（Group Layer）：</strong>容器层，用于组织多个相关图层，具备独立的合成通道与混合隔离模式</li>
            <li><strong>滤镜图层（Filter Layer）：</strong>非破坏性动态滤镜，实时对下方内容应用模糊、调色或特效，可随时双击调整参数或栅格化</li>
            <li><strong>填充图层（Fill Layer）：</strong>纯色或图案平铺背景图层</li>
          </ul>

          <h3 class="doc-h3">进阶图层操作</h3>
          <ul class="bullet-list">
            <li><strong>独奏模式（Solo）：</strong>瞬时仅展示当前图层内容，便于检查局部杂线或细微漏色</li>
            <li><strong>向下合并（Merge Down）：</strong>将当前图层合并至下方相邻图层</li>
            <li><strong>合并图层组（Flatten Group）：</strong>将整个图层组及其所有子图层烘焙为单个平片图层</li>
            <li><strong>从图层载入选区：</strong>根据当前图层的不透明度像素一键生成精确选区</li>
            <li><strong>栅格化（Rasterize）：</strong>将滤镜图层、渐变图层或文字图层转为标准可绘图像素</li>
          </ul>

          <h3 class="doc-h3">25 种图层混合模式参考</h3>
          <div class="tool-list-clean">
            <div class="tool-row">
              <span class="tool-head">基础常规</span>
              <span>正常（Normal）、溶解（Dissolve）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">变暗压暗</span>
              <span>正片叠底（Multiply · 阴影首选）、变暗（Darken）、颜色加深（Color Burn）、线性加深（Linear Burn）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">变亮提亮</span>
              <span>滤色（Screen · 空气感泛光）、变亮（Lighten）、颜色减淡（Color Dodge · 魔法高光发光）、添加 / 线性减淡（Add）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">对比增强</span>
              <span>叠加（Overlay · 增强明暗质感）、柔光（Soft Light · 氛围调色）、强光（Hard Light）、亮光（Vivid Light）、线性光（Linear Light）、点光（Pin Light）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">差值排除</span>
              <span>差值（Difference）、排除（Exclusion）、减去（Subtract）、划分（Divide）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">色彩构成</span>
              <span>色相（Hue）、饱和度（Saturation）、颜色（Color · 黑白灰上色）、明度（Luminosity）</span>
            </div>
          </div>

          <h3 class="doc-h3">图层数量与推荐规格</h3>
          <p>系统根据设备当前运行内存自动评估安全层数，创建画布时右下角会实时预估：</p>
          <figure class="clean-figure" style="max-width: 540px;" @click="openLightbox(imgLayersPresets, '画布图层规格')">
            <img :src="imgLayersPresets" alt="画布图层规格" loading="lazy" />
            <figcaption>不同分辨率预设在典型设备上的安全推荐图层数</figcaption>
          </figure>
          <ul class="bullet-list">
            <li><strong>屏幕全屏（1440 × 3200）：</strong>300 DPI · 约 235 层安全深度</li>
            <li><strong>正方形 2K（2048 × 2048）：</strong>300 DPI · 约 258 层安全深度</li>
            <li><strong>正方形 4K（4096 × 4096）：</strong>300 DPI · 约 64 层安全深度</li>
          </ul>
        </section>

        <!-- 03 手写笔与工坊 -->
        <section id="stylus-hardware" class="doc-section">
          <h2>
            <a href="#stylus-hardware" class="anchor">#</a>
            多品牌手写笔适配
          </h2>
          <p>
            内置多品牌专用驱动适配层，充分释放高端手写笔专属硬件特性：
          </p>
          <div class="table-container">
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 25%;">手写笔品牌 / 协议</th>
                  <th style="width: 35%;">硬件专属特性</th>
                  <th>支持功能与交互</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>华为星闪（NearLink）</strong><br>M-Pencil 第三代</td>
                  <td>16384（16K）级微压感响应 · 超低无线传输时延</td>
                  <td>双击笔身切换画笔与橡皮擦、落笔极速感应、微压线宽精细线性化</td>
                </tr>
                <tr>
                  <td><strong>OPPO / OnePlus</strong><br>OPPO Pencil / Stylo 2</td>
                  <td>OCS 硬件套件 · 笔身线性马达微震反馈</td>
                  <td>笔身双击快捷切换工具、压感平滑校准、落笔触觉机械震动强度调节</td>
                </tr>
                <tr>
                  <td><strong>三星 S-Pen</strong><br>Galaxy Tab S 系列</td>
                  <td>Wacom EMR 电磁压感 · 悬浮感应 Air Actions</td>
                  <td>侧键单击切换取色/橡皮擦、悬浮光标预览笔刷尺寸与外形</td>
                </tr>
                <tr>
                  <td><strong>通用手写笔</strong><br>USI / 小米灵感笔 / 微软 MPP</td>
                  <td>标准 Android HID 触控协议</td>
                  <td>4096 级压感与倾斜角感应、掌托防误触隔离</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            支持悬浮光标样式定制：包含笔刷真实外轮廓、十字精细准星、居中圆点或系统原生光标；配合落笔笔迹预测引擎，高刷屏幕跟手感更强
          </p>
        </section>

        <section id="stylus-experience" class="doc-section">
          <h2>
            <a href="#stylus-experience" class="anchor">#</a>
            压感曲线与纸感声学
          </h2>
          <p>
            在「设置 ＞ 手写笔」中提供基于贝塞尔样条的全局压力映射编辑器，画师可根据个人下笔轻重习惯调整控制点：
          </p>
          <ul class="bullet-list">
            <li><strong>线性（Linear）：</strong>输入压感与输出线宽 1:1 真实映射</li>
            <li><strong>轻柔（Soft）：</strong>轻压即可出浓墨，适合手劲较轻、喜欢轻快排线的画师</li>
            <li><strong>硬实（Hard）：</strong>需用力才能画出最大笔触，适合重力度勾线与雕刻细节</li>
            <li><strong>S 形对比（S-Curve）：</strong>两头平缓中间灵敏，增强轻重笔触的对比反差</li>
          </ul>

          <h3 class="doc-h3">纸感微震与声学引擎</h3>
          <p>
            ReveriePaint 独家研发 PaperSoundEngine，通过分析运笔速度、即时压力与加速度，在设备扬声器与震动马达上实时合成真实纸张摩擦声效：
          </p>
          <ul class="bullet-list">
            <li><strong>铅笔纸质（Pencil）：</strong>具有真实微粒摩擦感的颗粒感声效，低速轻柔，高速清脆</li>
            <li><strong>钢笔墨水（Ink）：</strong>顺滑沉稳的湿墨流动阻尼感声效</li>
            <li><strong>机械轻嗒（Tick）：</strong>富有节奏感的微触觉确认音</li>
            <li><strong>动态低通滤波：</strong>运笔速度越快高频泛音越饱满，还原纸上沙沙作画的沉浸感</li>
          </ul>
        </section>

        <section id="brush-studio" class="doc-section">
          <h2>
            <a href="#brush-studio" class="anchor">#</a>
            笔刷工坊与平滑算法
          </h2>
          <p>
            支持导入多种行业标准笔刷格式，并提供系统分享一键快速导入：
          </p>
          <figure class="clean-figure" @click="openLightbox(imgBrushImport, '笔刷面板导入界面')">
            <img :src="imgBrushImport" alt="笔刷面板导入界面" loading="lazy" />
            <figcaption>左侧画笔面板顶部导入按钮，支持直接加载本地笔刷资源文件</figcaption>
          </figure>
          <ul class="bullet-list">
            <li><strong>系统分享导入（首选）：</strong>在 QQ、微信、网盘或文件管理器中直接点击笔刷文件（<code>.kpp</code> / <code>.bundle</code>），选择「用其他应用打开」或「分享」，点选 <strong>ReveriePaint</strong> 即可秒级导入</li>
            <li><strong>支持格式：</strong>Krita 原生 <code>.kpp</code> 预设、<code>.bundle</code> 资源包以及 MyPaint <code>.myb</code> 引擎笔刷</li>
            <li><strong>整组与自定义笔尖打包导出：</strong>支持将整组笔刷或包含自定义笔尖图的单笔刷完整打包导出为标准 <code>.bundle</code> 文件，内嵌分类标签与 manifest 元数据，方便跨设备分发</li>
            <li><strong>PS ABR 技巧：</strong>将 <code>.abr</code> 中的笔尖图案导出为透明背景 <code>.png</code> 后，在笔刷工坊中点击「导入自定义」即可直接收录使用</li>
          </ul>
          <figure class="clean-figure" style="max-width: 520px;" @click="openLightbox(imgBrushQq, 'QQ 接收文件打开方式')">
            <img :src="imgBrushQq" alt="QQ 接收文件打开方式" loading="lazy" />
            <figcaption>QQ 内接收文件后点击右上角三个点，选择用其他应用打开</figcaption>
          </figure>

          <h3 class="doc-h3">笔刷工坊八大调校维度</h3>
          <div class="tool-list-clean">
            <div class="tool-row">
              <span class="tool-head">笔尖与遮罩</span>
              <span>Tip & Mask：尺寸、圆度、角度、间距（Spacing）、多笔尖循环采样</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">笔触动力学</span>
              <span>Dynamics：运笔速度对尺寸与流量的映射比率、抖动与随机离散度</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">混色与涂抹</span>
              <span>Color & Smudge：取色率（Color Rate）、涂抹强度（Smudge）、双色混合模式</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">空间几何</span>
              <span>Geometry：笔触方向跟随、手写笔倾斜角（Tilt）与方位角（Azimuth）感应</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">材质与纸纹</span>
              <span>Texture：纸纹、布纹深度调制、双重纹理叠加模式与纹理对比度</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">压感传感器</span>
              <span>Pressure：单笔刷独立压力响应曲线，微调软硬触感</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">引擎与底层</span>
              <span>Engine：像素画笔引擎、颜色涂抹引擎、曲线画笔引擎与备份重置</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">笔刷元数据</span>
              <span>Properties：笔刷命名、作者署名与自定义手绘缩略图标</span>
            </div>
          </div>

          <h3 class="doc-h3">笔画防抖与平滑流线</h3>
          <ul class="bullet-list">
            <li><strong>全局防抖平滑滑块（Stroke Stabilizer）：</strong>在视图设置中提供 0%~100% 连续阻尼调节，高阻尼下可彻底消除手部微小生理抖动</li>
            <li><strong>笔刷工坊流线（Streamline）：</strong>单笔刷独立的流线平滑度参数，自动对采样轨迹进行自适应三次样条平滑</li>
            <li><strong>运笔延迟消除：</strong>优化笔尖资源单次解析与元数据缓存，首笔落墨即刻响应，消除冗余解析导致的起笔延迟</li>
          </ul>
        </section>

        <!-- 04 创作与进阶工具 -->
        <section id="color-tools" class="doc-section">
          <h2>
            <a href="#color-tools" class="anchor">#</a>
            色彩面板与 3D 光影球
          </h2>
          <ul class="bullet-list">
            <li><strong>悬浮取色面板：</strong>可拖拽至屏幕任意位置，点击左上角图钉图标置顶常驻，边画边取色</li>
            <li><strong>外环双击极轴吸附：</strong>双击色轮外环可在纯红（0°）、纯黄（60°）、纯绿（120°）、纯青（180°）、纯蓝（240°）、纯洋红（300°）之间瞬时精准定位</li>
            <li><strong>内置多色彩立体模型：</strong>正方形（HSV）、三角形（Triangle）、圆形（Circle）三种内嵌选色形态随心切换</li>
            <li><strong>六合一取色模式：</strong>HSV 色轮、饱和度方块、RGB/HSB 滑块、预设色卡、色彩和谐环与 3D 光影球一键切换</li>
          </ul>

          <h3 class="doc-h3">3D 光影球调色系统（Shading Sphere）</h3>
          <p>
            专为插画二分与厚涂上色设计的 3D 光影取色工具，通过直观的立体球体模拟光源与阴影明暗变化：
          </p>
          <ul class="bullet-list">
            <li><strong>三大光影锚点：</strong>分别设定固有色（Base/Local）、主光源受光色（Key Light）与环境反光/阴影色（Shadow/Ambient）</li>
            <li><strong>冷暖色温光影推导：</strong>系统根据色温互补规律自动计算受光与背光暗部的色相推移，长按色块即可一键重置推导</li>
            <li><strong>120 FPS 准星取色：</strong>球体表面任意拖拽十字准星，流畅拾取明暗交界线与环境反光过渡带的精确渐变色</li>
            <li><strong>明暗过渡柔和度滑块：</strong>调节球体受光面到背光面的渐变边缘虚实对比</li>
            <li><strong>一键存入色卡：</strong>轻触即可将光影三联色组直接保存至当前活动调色板</li>
          </ul>

          <h3 class="doc-h3">色彩和谐算法在插画中的应用</h3>
          <ul class="bullet-list">
            <li><strong>互补色（Complementary）：</strong>色环 180 度正相对立颜色，制造最强烈的视觉冲击感与张力</li>
            <li><strong>分裂互补色（Split-Complementary）：</strong>由互补色两翼展开的次级对比色，既丰富又比直接互补更为柔和雅致</li>
            <li><strong>类似色（Analogous）：</strong>色环相邻 30-60 度同色调搭配，营造自然统一的光影氛围感</li>
            <li><strong>三色组（Triadic）：</strong>色轮 120 度等边三角形分布，适合动漫画风的生动多色表达</li>
          </ul>

          <h3 class="doc-h3">多图悬浮参考视窗（Reference Window）</h3>
          <ul class="bullet-list">
            <li><strong>支持多达 50 张参考图：</strong>相册多选一次性载入，相册网格自动置顶已选图片，顶部指示条快速翻看切换</li>
            <li><strong>独立双指漫游与取色：</strong>窗口内支持双指独立平移缩放，轻触画面即可直接将色彩采样至当前画笔</li>
            <li><strong>水平与垂直翻转：</strong>提供快捷镜像翻转按钮，方便构图比对与透视检查</li>
            <li><strong>黑白灰度模式：</strong>一键切换去色灰阶显示，便于快速检查画面素描明度关系</li>
          </ul>
        </section>

        <section id="shapes-guides" class="doc-section">
          <h2>
            <a href="#shapes-guides" class="anchor">#</a>
            几何形状与绘图辅助
          </h2>
          <p>
            ReveriePaint 提供强大的矢量化几何图元绘制工具与多种透视对称辅助体系：
          </p>

          <h3 class="doc-h3">9 种几何图元工具</h3>
          <div class="tool-list-clean">
            <div class="tool-row">
              <span class="tool-head">基础几何</span>
              <span>直线（Line）、矩形（Rect）、圆角矩形（Rounded Rect）、椭圆（Ellipse）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">多边形与星形</span>
              <span>正多边形（Regular Polygon · 3~12 边可调）、星形（Star · 3~16 角数与内外径比例可调）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">自由路径</span>
              <span>多段折线（Polyline）、闭合多边形（Polygon）、贝塞尔曲线（Bezier · 支持进出控制手柄调节曲率）</span>
            </div>
          </div>
          <ul class="bullet-list">
            <li><strong>样式填充模式：</strong>支持仅描边（Stroke）、仅填充（Fill）以及描边与填充（Stroke & Fill）</li>
            <li><strong>交互手柄精细调整：</strong>绘制后激活包围盒手柄，支持整体平移、旋转手柄、圆角矩形专有圆角拖拽手柄、正圆与正方形等比约束</li>
            <li><strong>确认提交与放弃：</strong>在浮动属性栏点击确认图标将图形栅格化写入图层，点击放弃即撤销草稿</li>
          </ul>

          <h3 class="doc-h3">绘图参考线与透视尺</h3>
          <ul class="bullet-list">
            <li><strong>2D 正交网格：</strong>均匀像素坐标网格，可调节格子间距尺寸与参考线透明度</li>
            <li><strong>等距轴测网格（Isometric）：</strong>2.5D 轴测透视网格，适用于像素场景、微缩模型与游戏地图原画</li>
            <li><strong>透视参考（Perspective）：</strong>支持 1 点透视、2 点透视与 3 点透视，画面灭点（Vanishing Points）支持自由拖拽重新定位</li>
            <li><strong>辅助吸附（Drawing Assist）：</strong>开启后运笔笔画自动贴合对齐参考线方向，下笔笔直顺滑</li>
          </ul>

          <h3 class="doc-h3">对称绘画系统（Symmetry）</h3>
          <ul class="bullet-list">
            <li><strong>4 种对称模式：</strong>垂直对称（左右镜像）、水平对称（上下镜像）、四分象限对称、径向 8 瓣对称（曼陀罗花纹）</li>
            <li><strong>实时压感对称响应：</strong>镜像笔画与触控笔压感保持一致，两侧下笔线条粗细与浓淡完全同步</li>
            <li><strong>防误触加固：</strong>移除高敏感全屏拖拽，仅中心圆柄可拖动定位，垂直与水平限制单轴移动，避免作画误拖镜像轴</li>
            <li><strong>一键居中复位：</strong>辅助面板提供「重置居中」快捷按钮，瞬时恢复轴线居中对齐</li>
          </ul>
        </section>

        <section id="selection-transform" class="doc-section">
          <h2>
            <a href="#selection-transform" class="anchor">#</a>
            选区运算与液化变换
          </h2>
          <p>
            选区面板提供自由套索、几何矩形/椭圆、多边形以及魔棒连续选择，并支持完整存储选区与布尔运算：
          </p>
          <ul class="bullet-list">
            <li><strong>存储选区（Stored Selections）：</strong>支持将当前活动选区保存在独立槽位，随工程文件持久化，支持随时载入</li>
            <li><strong>布尔运算：</strong>支持新建选区、添加模式（+）、减去模式（-）、相交模式（∩）</li>
            <li><strong>边缘处理与遮罩：</strong>支持一键反选、羽化、像素级扩展与收缩，支持自定义选区遮罩色彩与不透明度</li>
            <li><strong>提取命令：</strong>支持「剪切到新图层」、「复制到新图层」与直接清空选区内容</li>
            <li><strong>自由变换（Transform）：</strong>支持八控制手柄自由拉伸、锁定等比缩放、自由旋转、水平/垂直翻转与透视/网格扭曲</li>
          </ul>

          <h3 class="doc-h3">专业级液化形变工具（Liquify）</h3>
          <p>
            ReveriePaint 搭载全新重构的高性能液化变形引擎，提供 5 种推拉扭曲模式与高精度抗锯齿网格：
          </p>
          <ul class="bullet-list">
            <li><strong>5 种形变模式：</strong>推移（Push · 顺应运笔推挤像素）、膨胀（Bloat · 中心放大）、收缩（Pucker · 聚拢变小）、顺时针旋转（Rotate CW）与逆时针旋转（Rotate CCW）</li>
            <li><strong>沿路径自适应补点：</strong>消费多点触摸高频采样，沿拖动路径按笔刷尺寸自适应细分插值补点，彻底消除快速推拉时的笔迹断线与断口</li>
            <li><strong>严格约束活动选区：</strong>液化回写像素严格受当前选区限制，选区外区域完全不受形变拉扯影响</li>
            <li><strong>尊重图层透明度锁定：</strong>开启 Alpha 锁定的图层仅对颜色通道进行形变位移，严格保持原有透明度轮廓不外扩</li>
            <li><strong>网格精度自适应：</strong>形变网格单元尺寸根据画笔大小动态细分，彻底消除中小笔刷推拉时的锯齿边缘</li>
          </ul>
        </section>

        <section id="filters-suite" class="doc-section">
          <h2>
            <a href="#filters-suite" class="anchor">#</a>
            35 种滤镜与线稿提取
          </h2>
          <p>
            ReveriePaint 内置完整的 GPU 加速滤镜矩阵，可作用于当前图层或创建动态滤镜图层：
          </p>
          <div class="table-container">
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 26%;">分类维度</th>
                  <th>包含滤镜与算法</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>色彩调校（Color）</strong></td>
                  <td>HSV 色相/饱和度/明度、RGB/CMYK 曲线（Curves）、色阶（Levels）、自然饱和度（Vibrance）、色彩平衡、色温与色调、阴影与高光、曝光度、去色、反相、二值化阈值</td>
                </tr>
                <tr>
                  <td><strong>模糊平滑（Blur）</strong></td>
                  <td>高斯模糊（Gaussian Blur）、运动模糊（Motion Blur）、径向变焦模糊（Radial Blur）、表面平滑保边模糊（Surface Blur）、散焦镜头景深（Defocus）</td>
                </tr>
                <tr>
                  <td><strong>增强光效（Enhance）</strong></td>
                  <td>泛光辉光（Bloom）、智能锐化（Sharpen）、自适应投影（Drop Shadow）、边缘霓虹发光（Edge Glow）、Sobel 边缘检测、浮雕质感（Emboss）</td>
                </tr>
                <tr>
                  <td><strong>通道映射（Map）</strong></td>
                  <td>渐变映射（Gradient Map）、亮度转 Alpha（提取线稿）、颜色转 Alpha（一键抠底）、亮度转不透明度</td>
                </tr>
                <tr>
                  <td><strong>艺术与扭曲（Art & Distort）</strong></td>
                  <td>半色调印刷网点（Halftone）、马赛克（Mosaic）、数字油画（Oil）、高斯噪点（Noise）、扫描线（Scanline）、故障艺术（Glitch）、水波纹（Ripple）、旋涡（Swirl）</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h3">高频核心通道滤镜实战</h3>
          <ul class="bullet-list">
            <li><strong>亮度转 Alpha（Luminance to Alpha）：</strong>纸上手绘草稿拍照导入后，一键将白纸完全转为透明，保留纯净的黑色铅笔线条，免去繁琐抠图</li>
            <li><strong>渐变映射（Gradient Map）：</strong>黑白灰阶二分素描一键上色神器，通过自定义色带将图像由暗到明的灰度精准映射为丰富色彩</li>
            <li><strong>泛光辉光（Bloom）：</strong>为画面高亮区域赋予日系插画特有的空气漫反射柔和发光感</li>
          </ul>
        </section>

        <section id="animation-workflow" class="doc-section">
          <h2>
            <a href="#animation-workflow" class="anchor">#</a>
            逐帧动画与洋葱皮
          </h2>
          <p>
            展开动画时间轴后，画作即刻进入逐帧原画工作流：
          </p>
          <ul class="bullet-list">
            <li><strong>时间轴控制：</strong>自由插入空白关键帧或复制现有帧，调节单帧驻留时间适配一拍一、一拍二节奏，支持多帧框选与连续点选批量操作</li>
            <li><strong>边缘曝光手柄拉伸：</strong>帧块右侧引入曝光长度直接拖拽拉伸手柄，支持弹性连续形变调节曝光时长</li>
            <li><strong>推挤重排（Ripple Reorder）：</strong>长按关键帧支持全局实时推挤换位，附带弹性阻尼避让动效</li>
            <li><strong>极速翻帧比对（Flip Peek）：</strong>长按上一帧按钮 110ms 即可直接调度渲染进入快速比对，抬手即时恢复</li>
          </ul>

          <h3 class="doc-h3">透光台临时位移对比（Shift & Trace）</h3>
          <p>
            引入专业动画行业标准 Shift & Trace 临时对位能力，解决复杂动画运动轨迹校对难题：
          </p>
          <ul class="bullet-list">
            <li><strong>手笔职责分流：</strong>手写笔落笔 100% 保持在当前活动帧绘制，双指手势（捏合/旋转/平移）自由微调参考帧位移对位</li>
            <li><strong>洋葱皮透光台：</strong>前续帧默认为朱红色标，后续帧默认为青绿色标，支持线性（Linear）、指数平滑（Smooth）与恒定不透明度（Constant）三档衰减曲线</li>
            <li><strong>仅关键帧透光过滤：</strong>自动跳过一拍多重复保持帧，仅透光穿透真实关键帧</li>
            <li><strong>多格式动效导出：</strong>支持一键导出为 GIF 动图、MP4 高清动画视频或连续 PNG 序列帧压缩包，支持导入音频并联动显示波形</li>
          </ul>
        </section>

        <!-- 05 工程与社群 -->
        <section id="project-timelapse" class="doc-section">
          <h2>
            <a href="#project-timelapse" class="anchor">#</a>
            工程规范与延时摄影
          </h2>
          <p>
            <code>.revp</code> 是 ReveriePaint 自研的原生高性能工程归档格式，采用标准 ZIP 封装协议：
          </p>
          <ul class="bullet-list">
            <li><strong>manifest.json：</strong>记录画布分辨率、色彩空间、图层组织层级树与混合模式元数据</li>
            <li><strong>快速并行保存：</strong>采用多线程快速存盘技术，保存大文件更流畅，显著减少等待时间</li>
            <li><strong>timelapse.bin：</strong>内嵌笔画事件流二进制记录，无损保留作画过程全轨迹</li>
          </ul>

          <h3 class="doc-h3">无损笔迹延时摄影回放</h3>
          <div class="feature-bullets">
            <div class="bullet-card">
              <strong>事件流记录：</strong>后台仅记录笔尖坐标、压力传感器数据与工具切换事件，几乎零 CPU/GPU 功耗占用，工程体积仅增加数兆字节
            </div>
            <div class="bullet-card">
              <strong>无损 4K 生成：</strong>导出延时摄影时，由后台渲染内核以原始分辨率重新仿真回放画画过程，输出清晰度极高的 4K MP4 视频，无任何界面遮挡
            </div>
          </div>

          <h3 class="doc-h3">跨软件文件互通与导出</h3>
          <ul class="bullet-list">
            <li><strong>.kra：</strong>Krita 原生标准规范，100% 完整保留正片叠底与继承透明度设置</li>
            <li><strong>.psd：</strong>Photoshop 分层文档，便于导入桌面端继续排版修图</li>
            <li><strong>TIFF / PNG / WebP / JPG：</strong>适合印刷出版与网络社交平台发布的通用格式</li>
          </ul>
        </section>

        <section id="community-feedback" class="doc-section">
          <h2>
            <a href="#community-feedback" class="anchor">#</a>
            问题反馈与创作者群
          </h2>
          <p>
            遇到程序异常或可复现的缺陷，建议优先在 GitHub Issues 提交反馈以追踪修复进展：
          </p>
          <figure class="clean-figure" style="max-width: 440px;" @click="openLightbox(imgFeedbackIssue, '开发者关于反馈的说明')">
            <img :src="imgFeedbackIssue" alt="开发者关于反馈的说明" loading="lazy" />
            <figcaption>通过 GitHub Issue 记录能更系统地排查修复复杂问题</figcaption>
          </figure>
          <div class="note-box">
            <p><strong>反馈要素：</strong>请注明<strong>设备具体型号 + Android 系统版本 + 触发时的具体步骤</strong>，必要时可上传录屏或工程样本</p>
          </div>
          <div class="link-pills">
            <a
              href="https://github.com/LanRhyme/ReveriePaint/issues"
              target="_blank"
              rel="noopener"
              class="download-pill primary"
            >
              前往 GitHub Issues 提交反馈 →
            </a>
          </div>

          <h3 class="doc-h3">交流群</h3>
          <p>欢迎加入画师社群交流作画技巧、反馈建议或抢先体验测试安装包：</p>
          <div class="qq-clean-box">
            <div>
              <strong>ReveriePaint 创作者交流群</strong>
              <span class="qq-num">QQ 群号：729283213</span>
            </div>
            <div class="qq-btn-group">
              <button
                type="button"
                class="btn-copy-path"
                @click="copyText('group', '729283213')"
              >
                {{ copiedMap['group'] ? '已复制群号' : '复制群号' }}
              </button>
              <a
                href="https://qm.qq.com/q/729283213"
                target="_blank"
                rel="noopener"
                class="btn-copy-path primary"
              >
                唤起 QQ 加群
              </a>
            </div>
          </div>
        </section>

        <!-- 页脚 -->
        <footer class="doc-footer">
          <p>© {{ new Date().getFullYear() }} LanRhyme · 基于 GPL-3.0 协议开源</p>
          <div class="doc-footer-links">
            <a href="/">返回官网首页</a>
            <a href="https://github.com/LanRhyme/ReveriePaint/releases" target="_blank" rel="noopener">Releases</a>
            <a href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android" target="_blank" rel="noopener">Mirror酱</a>
            <a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener">GitHub</a>
            <a href="https://qm.qq.com/q/729283213" target="_blank" rel="noopener">QQ 交流群</a>
          </div>
        </footer>
      </main>
    </div>

    <!-- 回到顶部 -->
    <transition name="fade">
      <button
        v-if="showBackToTop"
        class="back-top"
        type="button"
        aria-label="回到顶部"
        @click="scrollToTop"
      >
        ↑
      </button>
    </transition>

    <!-- 灯箱 -->
    <transition name="fade">
      <div v-if="lightboxImg" class="lightbox" @click="closeLightbox">
        <div class="lightbox-content" @click.stop>
          <img :src="lightboxImg.src" :alt="lightboxImg.caption" />
          <p v-if="lightboxImg.caption">{{ lightboxImg.caption }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ══ 整体版式与基底 ═════════════════════════════ */
.docs-layout {
  min-height: 100vh;
  background-color: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
}

.scroll-progress-line {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--ink);
  z-index: 100;
  transition: width 0.1s linear;
}

/* ══ 顶部导航栏 ═════════════════════════════════ */
.docs-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(245, 242, 236, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line-faint);
  height: 58px;
}
.header-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
  font-weight: 600;
  font-size: 1rem;
}
.brand-divider {
  color: var(--ink-ghost);
  font-size: 0.8125rem;
}
.brand-doc-tag {
  font-size: 0.78125rem;
  color: var(--ink-soft-2);
}

.header-search {
  flex: 1;
  max-width: 320px;
}
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}
.search-box svg {
  position: absolute;
  left: 10px;
  color: var(--ink-soft-2);
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 32px;
  padding: 0 26px 0 30px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.6);
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--ink);
  outline: none;
  transition: background 0.2s, border-color 0.2s;
}
.search-input:focus {
  background: #fff;
  border-color: var(--ink);
}
.search-clear {
  position: absolute;
  right: 8px;
  background: transparent;
  border: 0;
  font-size: 14px;
  color: var(--ink-ghost);
  cursor: pointer;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-link {
  font-size: 0.8125rem;
  color: var(--ink-mid);
  transition: color 0.2s;
}
.header-link:hover {
  color: var(--ink);
}
.header-copy-btn {
  background: transparent;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  padding: 4px 10px;
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--ink);
  cursor: pointer;
}
.header-copy-btn:hover {
  background: #fff;
  color: var(--ink);
}

.mobile-menu-btn {
  display: none;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.8);
  font-family: inherit;
  font-size: 0.78125rem;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.2s;
}

/* ══ 移动端专属吸顶章节指示条 ═══════════════════ */
.mobile-subbar {
  display: none;
  position: sticky;
  top: 58px;
  z-index: 35;
  background: rgba(245, 242, 236, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line-faint);
  height: 42px;
  cursor: pointer;
  user-select: none;
}
.mobile-subbar-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 16px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.mobile-subbar-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78125rem;
  color: var(--ink);
  min-width: 0;
  overflow: hidden;
}
.subbar-group {
  font-size: 0.71875rem;
  font-family: var(--font-mono);
  color: var(--ink-soft-2);
  flex-shrink: 0;
}
.subbar-sep {
  color: var(--ink-ghost);
  font-size: 0.6875rem;
  flex-shrink: 0;
}
.subbar-item {
  font-weight: 500;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mobile-subbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--ink-mid);
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(20, 22, 26, 0.05);
  transition: background 0.15s, color 0.15s;
}
.mobile-subbar-btn svg {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-subbar-btn.is-open svg {
  transform: rotate(180deg);
}

/* ══ 居中平衡双栏布局 ═══════════════════════════ */
.docs-viewport {
  max-width: 1160px;
  margin: 0 auto;
  padding: 36px 24px 100px;
  display: flex;
  align-items: flex-start;
  gap: 48px;
}

/* 侧边栏：左侧固定 */
.docs-sidebar {
  width: 230px;
  flex-shrink: 0;
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding-right: 18px;
  border-right: 1px solid var(--line-faint);
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.group-title {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 6px;
}
.group-num {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--ink-ghost);
  font-weight: 500;
}
.group-text {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ink-soft-2);
}
.group-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--ink-mid);
  padding: 6px 10px;
  border-radius: 6px;
  line-height: 1.4;
  border-left: 2px solid transparent;
  transition: all 0.15s ease;
}
.nav-item:hover {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.04);
}
.nav-item.active {
  color: var(--ink);
  font-weight: 500;
  background: rgba(20, 22, 26, 0.06);
  border-left-color: var(--ink);
}
.search-empty {
  font-size: 0.8125rem;
  color: var(--ink-ghost);
  padding: 10px 8px;
}

/* 侧边栏移动端底部快捷外链 */
.sidebar-mobile-footer {
  display: none;
  margin-top: 16px;
}
.mobile-footer-divider {
  height: 1px;
  background: var(--line-faint);
  margin-bottom: 12px;
}
.mobile-footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
}
.mobile-footer-link {
  font-size: 0.8125rem;
  color: var(--ink-mid);
  text-decoration: none;
}
.mobile-footer-link:hover {
  color: var(--ink);
}

/* 正文流 */
.docs-main {
  flex: 1;
  min-width: 0;
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.doc-lead-header {
  border-bottom: 1px solid var(--line-faint);
  padding-bottom: 24px;
}
.doc-badge {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-soft-2);
  margin-bottom: 8px;
}
.doc-title {
  font-size: clamp(1.85rem, 3.4vw, 2.25rem);
  line-height: 1.25;
  font-weight: 500;
  letter-spacing: -0.025em;
}
.doc-desc {
  margin-top: 12px;
  font-size: 0.96875rem;
  line-height: 1.8;
  color: var(--ink-mid);
}

.doc-section {
  scroll-margin-top: 80px;
}
.doc-section h2 {
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: -0.015em;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.doc-h3 {
  font-size: 1.05rem;
  font-weight: 500;
  margin: 22px 0 10px;
  color: var(--ink);
}
.anchor {
  color: var(--ink-ghost);
  font-family: var(--font-mono);
  font-size: 0.85em;
  opacity: 0.3;
  text-decoration: none;
}
.doc-section h2:hover .anchor {
  opacity: 1;
}

.doc-section p {
  font-size: 0.9375rem;
  line-height: 1.82;
  color: var(--ink-soft);
  margin-bottom: 14px;
}
.doc-section p:last-child {
  margin-bottom: 0;
}

/* 提示块 */
.note-box {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 2px solid var(--ink);
  background: rgba(20, 22, 26, 0.035);
  border-radius: 0 6px 6px 0;
  font-size: 0.875rem;
  line-height: 1.75;
}
.note-box.warning {
  border-left-color: #b05a4d;
  background: rgba(176, 90, 77, 0.06);
}
.note-box p {
  font-size: 0.875rem !important;
  line-height: 1.75 !important;
  margin: 0 !important;
}

/* 列表 */
.bullet-list {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 14px 0;
}
.bullet-list li {
  font-size: 0.9375rem;
  line-height: 1.78;
  color: var(--ink-soft);
}

.ordered-list {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0;
}
.ordered-list li {
  font-size: 0.9375rem;
  line-height: 1.78;
  color: var(--ink-soft);
}

/* 胶囊按钮 */
.link-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0;
}
.download-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.84375rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  color: var(--ink);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}
.download-pill:hover {
  background: #fff;
  border-color: var(--ink);
}
.download-pill.primary {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.download-pill.primary:hover {
  background: var(--ink-soft);
}

/* 截图容器 */
.clean-figure {
  margin: 18px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: #fff;
  cursor: zoom-in;
}
.clean-figure img {
  width: 100%;
  height: auto;
  display: block;
}
.clean-figure figcaption {
  padding: 8px 12px;
  font-size: 0.78125rem;
  color: var(--ink-mid);
  background: var(--card);
  border-top: 1px solid var(--line-faint);
  line-height: 1.5;
}

/* 工具清单 */
.tool-list-clean {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0;
  border-top: 1px solid var(--line-faint);
  padding-top: 10px;
}
.tool-row {
  display: flex;
  gap: 14px;
  font-size: 0.875rem;
  line-height: 1.7;
}
.tool-head {
  width: 90px;
  font-weight: 500;
  color: var(--ink);
  flex-shrink: 0;
}

/* 特性卡片与网格 */
.feature-bullets {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0;
}
.bullet-card {
  padding: 12px 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--line-faint);
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--ink-soft);
}

/* 表格排版 */
.table-container {
  margin: 16px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
}
.doc-table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  font-size: 0.84375rem;
  line-height: 1.6;
  text-align: left;
}
.doc-table th {
  background: var(--card);
  padding: 10px 14px;
  font-weight: 500;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
}
.doc-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--line-faint);
  color: var(--ink-soft);
}
.doc-table tr:last-child td {
  border-bottom: none;
}
.doc-table code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  background: rgba(20, 22, 26, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 剪切蒙版步骤卡 */
.layer-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin: 14px 0;
}
.step-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--line);
}
.step-num {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ink-mid);
  line-height: 1;
}
.step-card strong {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 4px;
  color: var(--ink);
}
.step-card p {
  font-size: 0.8125rem !important;
  line-height: 1.55 !important;
  color: var(--ink-soft-2) !important;
  margin: 0 !important;
}

/* 图层树可视化组件 */
.layer-tree-card {
  margin: 16px 0;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.tree-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
.group-root {
  font-weight: 600;
  color: var(--ink);
  padding-bottom: 4px;
  border-bottom: 1px dashed var(--line-faint);
}
.tree-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.2;
}
.tree-badge.outer {
  background: var(--ink-soft-2);
}
.tree-child {
  padding-left: 20px;
}
.tree-branch {
  color: var(--ink-ghost);
}
.tree-item {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(20, 22, 26, 0.03);
  color: var(--ink-soft);
  flex: 1;
}
.tree-item.active-clip {
  background: rgba(85, 110, 85, 0.08);
  color: #3b5f3b;
  border-left: 3px solid #4a754a;
}
.tree-item.base-layer {
  background: rgba(180, 140, 60, 0.08);
  color: #7a5a1f;
  border-left: 3px solid #b8860b;
}
.tree-outer {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--line-faint);
  color: var(--ink-mid);
}

/* QQ 群卡片 */
.qq-clean-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
  margin: 16px 0;
  flex-wrap: wrap;
}
.qq-num {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--ink-mid);
  margin-left: 10px;
}
.qq-btn-group {
  display: flex;
  gap: 8px;
}
.btn-copy-path {
  flex-shrink: 0;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.2s;
}
.btn-copy-path:hover {
  background: var(--ink);
  color: var(--paper);
}
.btn-copy-path.primary {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

/* 页脚 */
.doc-footer {
  border-top: 1px solid var(--line-faint);
  padding-top: 24px;
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  font-size: 0.8125rem;
  color: var(--ink-soft-2);
}
.doc-footer-links {
  display: flex;
  gap: 16px;
}
.doc-footer-links a {
  color: var(--ink-mid);
  transition: color 0.2s;
}
.doc-footer-links a:hover {
  color: var(--ink);
}

/* 回到顶部 */
.back-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--paper);
  border: none;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(20, 22, 26, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: opacity 0.2s, transform 0.2s;
}
.back-top:hover {
  transform: translateY(-2px);
}

/* 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(20, 22, 26, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.lightbox-content {
  max-width: 92vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.lightbox-content img {
  max-width: 100%;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.lightbox-content p {
  color: #fff;
  font-size: 0.8125rem;
  margin-top: 10px;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端与平板响应式适配 */
@media (max-width: 960px) {
  .mobile-subbar {
    display: block;
  }
  .desktop-only {
    display: none !important;
  }
  .docs-viewport {
    gap: 0;
    padding: 20px 16px 80px;
  }
  .docs-sidebar {
    position: fixed;
    top: 100px;
    left: 0;
    bottom: 0;
    width: min(320px, 86vw);
    background: var(--paper);
    z-index: 90;
    padding: 20px 18px 30px;
    border-right: 1px solid var(--line);
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.12);
  }
  .docs-sidebar.is-open {
    transform: translateX(0);
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    top: 58px;
    background: transparent;
    z-index: 85;
    pointer-events: auto;
  }
  .mobile-menu-btn {
    display: block;
  }
  .sidebar-mobile-footer {
    display: block;
  }
  .table-container {
    margin: 14px -6px;
    border-radius: 6px;
  }
  .doc-section {
    scroll-margin-top: 110px;
  }
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0 14px;
  }
  .header-search {
    display: none;
  }
  .brand-text {
    font-size: 0.9375rem;
  }
  .docs-viewport {
    padding: 16px 12px 80px;
  }
  .doc-lead-header {
    padding-bottom: 16px;
  }
  .doc-title {
    font-size: 1.5rem;
  }
  .doc-desc {
    font-size: 0.875rem;
    line-height: 1.68;
  }
  .doc-section h2 {
    font-size: 1.1875rem;
  }
  .doc-section p,
  .bullet-list li,
  .ordered-list li {
    font-size: 0.875rem;
    line-height: 1.72;
  }
  .layer-steps {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .step-card {
    padding: 12px;
  }
  .layer-tree-card {
    padding: 12px 14px;
    font-size: 0.75rem;
  }
  .tree-child {
    padding-left: 12px;
  }
  .tool-row {
    flex-direction: column;
    gap: 2px;
    font-size: 0.8125rem;
  }
  .tool-head {
    width: auto;
    font-weight: 600;
  }
  .qq-clean-box {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px;
  }
  .qq-num {
    margin-left: 0;
    margin-top: 4px;
    display: block;
  }
  .qq-btn-group {
    width: 100%;
  }
  .qq-btn-group button,
  .qq-btn-group a {
    flex: 1;
    text-align: center;
    justify-content: center;
  }
}
</style>
