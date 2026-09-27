<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 导入文档高精 WebP 配图
import imgInstallRepo from './assets/docs/doc-install-repo.webp'
import imgInstallRelease from './assets/docs/doc-install-release.webp'
import imgBrushImport from './assets/docs/doc-brush-import.webp'
import imgBrushQq from './assets/docs/doc-brush-qq.webp'
import imgUiSettings from './assets/docs/doc-ui-settings.webp'
import imgUiMain from './assets/docs/doc-ui-main.webp'
import imgUiLeftbar from './assets/docs/doc-ui-leftbar.webp'
import imgLayersPresets from './assets/docs/doc-layers-presets.webp'
import imgFeedbackIssue from './assets/docs/doc-feedback-issue.webp'

// 导航大纲结构
const navSections = [
  {
    group: '快速入门',
    icon: '⚡',
    items: [
      { id: 'intro', label: '软件简介与平台兼容' },
      { id: 'roadmap', label: '已知待修复与路线图' }
    ]
  },
  {
    group: '安装与部署',
    icon: '📦',
    items: [
      { id: 'install', label: '获取 APK 安装包' },
      { id: 'permissions', label: '安装步骤与系统权限' }
    ]
  },
  {
    group: '笔刷与资源格式',
    icon: '🎨',
    items: [
      { id: 'import-brush', label: '导入笔刷与 QQ 存储路径' },
      { id: 'brush-formats', label: 'Krita 笔刷格式原理' },
      { id: 'abr-tips', label: 'Photoshop ABR 转换技巧' },
      { id: 'brush-resources', label: '社区笔刷资源获取' },
      { id: 'file-formats', label: '支持的工程与图像格式' }
    ]
  },
  {
    group: '界面与核心工具',
    icon: '🖌️',
    items: [
      { id: 'ui-overview', label: '主画布界面全局总览' },
      { id: 'ui-toolbar', label: '工具栏滑动与排布定制' },
      { id: 'color-picker', label: '悬浮取色面板与固定' },
      { id: 'ui-scale', label: '界面尺寸与滑块适配' },
      { id: 'tools-list', label: '全量工具清单一览表' }
    ]
  },
  {
    group: '图层与画布规格',
    icon: '📑',
    items: [
      { id: 'layer-specs', label: '图层上限与推荐分辨率' }
    ]
  },
  {
    group: '问题反馈与社群',
    icon: '💬',
    items: [
      { id: 'feedback', label: 'Bug 反馈与 GitHub 规范' },
      { id: 'community', label: '交流社群与开发者联络' }
    ]
  }
]

// 交互状态
const searchQuery = ref('')
const activeSectionId = ref('intro')
const mobileMenuOpen = ref(false)
const showBackToTop = ref(false)
const scrollProgress = ref(0)
const copiedMap = ref({})
const lightboxImg = ref(null)

// 扁平化全部导航条目（用于右侧目录与监听）
const allItems = computed(() => navSections.flatMap((g) => g.items))

// 复制工具函数
function copyText(key, text) {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
    copiedMap.value[key] = true
    setTimeout(() => {
      copiedMap.value[key] = false
    }, 2200)
  }
}

// 灯箱预览
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

// 锚点平滑滚动
function scrollToAnchor(id) {
  mobileMenuOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    const yOffset = -76
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
    activeSectionId.value = id
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 滚动监听与阅读进度条
function onScroll() {
  const scrollY = window.pageYOffset
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0
  showBackToTop.value = scrollY > 400

  for (let i = allItems.value.length - 1; i >= 0; i--) {
    const item = allItems.value[i]
    const el = document.getElementById(item.id)
    if (el) {
      const top = el.getBoundingClientRect().top
      if (top <= 140) {
        activeSectionId.value = item.id
        break
      }
    }
  }
}

// 搜索过滤大纲
const filteredNav = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return navSections
  return navSections
    .map((group) => {
      const matched = group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
      )
      return { ...group, items: matched }
    })
    .filter((g) => g.items.length > 0)
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  if (window.location.hash) {
    const hash = window.location.hash.replace('#', '')
    setTimeout(() => scrollToAnchor(hash), 120)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="docs-layout">
    <!-- ── 顶部阅读进度条 ───────────────────────────── -->
    <div
      class="scroll-progress-bar"
      :style="{ width: `${scrollProgress}%` }"
      aria-hidden="true"
    ></div>

    <!-- ── 顶部玻璃拟态导航栏 ───────────────────────── -->
    <header class="docs-header">
      <div class="docs-header-inner shell">
        <div class="docs-header-brand">
          <a href="/" class="brand-link" title="返回 ReveriePaint 官网首页">
            <span class="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" width="20" height="20">
                <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="11" cy="13" r="1.5" fill="currentColor" />
              </svg>
            </span>
            <span class="brand-title">ReveriePaint</span>
          </a>
          <span class="brand-badge">
            <span class="status-pulse" aria-hidden="true"></span>
            官方文档
          </span>
        </div>

        <!-- 快速搜索栏 -->
        <div class="docs-search">
          <svg class="search-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4" />
            <path d="M10 10 L14.5 14.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            class="search-input"
            placeholder="搜索文档关键字与功能..."
            aria-label="搜索文档"
          />
          <kbd class="search-kbd">⌘K</kbd>
          <button
            v-if="searchQuery"
            type="button"
            class="search-clear"
            aria-label="清空搜索"
            @click="searchQuery = ''"
          >
            ×
          </button>
        </div>

        <!-- 快捷外部链接 -->
        <nav class="docs-header-links" aria-label="文档外链">
          <a href="/" class="header-link home-link">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path d="M2.5 7 L8 2.5 L13.5 7 V13.5 H9.5 V9.5 H6.5 V13.5 H2.5 Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            官网首页
          </a>
          <a
            href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android"
            target="_blank"
            rel="noopener"
            class="header-link link-pill"
          >
            Mirror酱 高速
          </a>
          <a
            href="https://github.com/LanRhyme/ReveriePaint"
            target="_blank"
            rel="noopener"
            class="header-link"
          >
            GitHub
          </a>
          <button
            type="button"
            class="header-link qq-btn"
            @click="copyText('headqq', '729283213')"
          >
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3" />
              <path d="M3 11 V3 h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
            </svg>
            {{ copiedMap['headqq'] ? '已复制群号' : 'QQ 交流群' }}
          </button>
        </nav>

        <!-- 移动端目录折叠按钮 -->
        <button
          class="mobile-menu-btn"
          type="button"
          :aria-expanded="mobileMenuOpen"
          aria-label="切换文档导航抽屉"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span class="bar-line" :class="{ open: mobileMenuOpen }"></span>
          <span class="bar-line" :class="{ open: mobileMenuOpen }"></span>
        </button>
      </div>
    </header>

    <!-- ── 页面主体布局 ───────────────────────────── -->
    <div class="docs-body shell">
      <!-- 移动端遮罩 -->
      <transition name="fade">
        <div
          v-if="mobileMenuOpen"
          class="sidebar-backdrop"
          @click="mobileMenuOpen = false"
        ></div>
      </transition>

      <!-- ── 左侧分类侧边栏 ───────────────────────── -->
      <aside class="docs-sidebar" :class="{ 'is-open': mobileMenuOpen }">
        <div class="sidebar-inner">
          <div class="sidebar-header">
            <span class="sidebar-title">文档大纲</span>
            <span v-if="searchQuery" class="sidebar-count">
              匹配中
            </span>
          </div>

          <div v-if="filteredNav.length === 0" class="sidebar-empty">
            无匹配条目，试着换个关键词
          </div>

          <nav class="sidebar-nav" aria-label="文档章节大纲">
            <div v-for="group in filteredNav" :key="group.group" class="nav-group">
              <div class="group-title">
                <span class="group-icon">{{ group.icon }}</span>
                <span>{{ group.group }}</span>
              </div>
              <ul class="group-list">
                <li v-for="item in group.items" :key="item.id">
                  <a
                    :href="`#${item.id}`"
                    class="nav-link"
                    :class="{ 'is-active': activeSectionId === item.id }"
                    @click.prevent="scrollToAnchor(item.id)"
                  >
                    <span class="link-bullet"></span>
                    <span class="link-text">{{ item.label }}</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div class="sidebar-bottom">
            <a href="https://github.com/LanRhyme/ReveriePaint/issues" target="_blank" rel="noopener" class="sidebar-help">
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M8 7 v4 M8 5 h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              遇到问题？前往 GitHub 提问
            </a>
          </div>
        </div>
      </aside>

      <!-- ── 中间正文区域 ─────────────────────────── -->
      <main class="docs-content">
        <!-- 面包屑与大标题 -->
        <header class="content-header">
          <div class="breadcrumbs">
            <a href="/">首页</a>
            <span class="sep">/</span>
            <span>官方文档</span>
            <span class="sep">/</span>
            <span class="current">使用指南</span>
          </div>

          <p class="doc-kicker">
            <span class="kicker-pill">v1.3.x 官方适用</span>
            Android 原生数字插画专业指南
          </p>

          <h1 class="h-display doc-main-title">
            ReveriePaint 使用指南
          </h1>

          <p class="lede doc-lede">
            深植 <strong>Krita 原生物理颜料与图像处理内核</strong>，专为平板大屏与压感手写笔触控深度定制，让专业创作在移动端彻底摆脱阉割与妥协。
          </p>

          <div class="doc-meta-strip">
            <div class="meta-pill">
              <span class="meta-label">内核引擎</span>
              <span class="meta-val">Krita C++ Core</span>
            </div>
            <div class="meta-pill">
              <span class="meta-label">最低系统</span>
              <span class="meta-val">Android 7.0+ (API 24)</span>
            </div>
            <div class="meta-pill">
              <span class="meta-label">开源协议</span>
              <span class="meta-val">GPL-3.0 开放源码</span>
            </div>
            <div class="meta-pill">
              <span class="meta-label">交流群号</span>
              <span class="meta-val">729283213</span>
            </div>
          </div>
        </header>

        <!-- ══ 1. 快速入门 ═══════════════════════════ -->
        <section id="intro" class="doc-section">
          <h2 class="section-title">
            <a href="#intro" class="anchor-link" aria-label="锚点链接">#</a>
            软件简介与平台兼容性
          </h2>
          <p>
            ReveriePaint 是一项完全开源的 Android 原生数字绘画工程。与常见的移动端简易涂鸦软件不同，它完整继承了专业级开源桌面绘图软件 Krita 的核心渲染系统，提供真实的物理颜料涂抹、笔尖印记动态计算、数以百计的官方预设以及硬件级手写笔阻尼调校。
          </p>

          <div class="callout callout-info">
            <div class="callout-badge">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <path d="M8 7v4M8 5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="callout-body">
              <strong>系统兼容要求</strong>
              <p>适用于 Android 7.0 及以上版本（API Level 24+）。为保证物理颜料笔刷与动态稀疏瓦片图层的计算效率，强烈推荐运行于 64 位（arm64-v8a）架构的平板设备。</p>
            </div>
          </div>

          <div class="callout callout-warning">
            <div class="callout-badge">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M8 2 L14 13 H2 Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                <path d="M8 6 v3.5 M8 11.5 h.01" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="callout-body">
              <strong>HarmonyOS 纯血鸿蒙支持说明</strong>
              <p>由于华为 4.2 及后续纯血鸿蒙（Next）系统底层运行环境发生重大变动，移除了原生 Android 运行时，当前支持较差。建议在标准 Android 或搭载兼容 Android 运行时的设备上使用。</p>
            </div>
          </div>
        </section>

        <!-- 路线图与已知问题 -->
        <section id="roadmap" class="doc-section">
          <h2 class="section-title">
            <a href="#roadmap" class="anchor-link" aria-label="锚点链接">#</a>
            已知待修复与近期路线图
          </h2>
          <p>
            项目处于高频迭代优化阶段，以下为开发者近期正在集中精力修复与攻坚的重点特性：
          </p>

          <div class="roadmap-grid">
            <div class="roadmap-card in-progress">
              <div class="roadmap-header">
                <span class="roadmap-badge">正在抢修</span>
                <span class="roadmap-tag">底层算法</span>
              </div>
              <h4 class="roadmap-title">液化工具与对称尺</h4>
              <p class="roadmap-desc">近期因画布双指视口旋转缩放与触控变换矩阵联动，部分机型出现了对称线飞出或工具栏关闭异常问题，目前正在底层重新校准闭环，敬请期待更新。</p>
            </div>

            <div class="roadmap-card planned">
              <div class="roadmap-header">
                <span class="roadmap-badge">重点规划</span>
                <span class="roadmap-tag">格式生态</span>
              </div>
              <h4 class="roadmap-title">Photoshop ABR 原生导入</h4>
              <p class="roadmap-desc">正在研制 .abr 二进制画笔预设解包与参数映射模块，未来将无需手动提取笔尖图片，直接一键拖入即可识别 PS 画笔预设。</p>
            </div>

            <div class="roadmap-card continuous">
              <div class="roadmap-header">
                <span class="roadmap-badge">持续调校</span>
                <span class="roadmap-tag">硬件体验</span>
              </div>
              <h4 class="roadmap-title">星闪与多品牌手写笔适配</h4>
              <p class="roadmap-desc">持续深化华为第三代 M-Pencil（16K 压感与侧键）、OPPO/一加触感微震、三星 S Pen 悬空光标等底层协议调校，彻底根除断触与延迟。</p>
            </div>
          </div>
        </section>

        <!-- ══ 2. 安装与部署 ═════════════════════════ -->
        <section id="install" class="doc-section">
          <h2 class="section-title">
            <a href="#install" class="anchor-link" aria-label="锚点链接">#</a>
            获取 APK 安装包
          </h2>
          <p>
            ReveriePaint 为纯粹免费开源软件，不设任何应用内付费或弹窗。请认准以下官方分发渠道下载最新安装包：
          </p>

          <div class="download-cards">
            <a
              href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android"
              target="_blank"
              rel="noopener"
              class="download-card highlight"
            >
              <div class="card-icon">⚡</div>
              <div class="card-meta">
                <div class="card-title-row">
                  <span class="card-title">Mirror酱 高速下载</span>
                  <span class="card-badge">国内免梯推荐</span>
                </div>
                <span class="card-desc">针对国内网络深度加速，CDN 全节点直达，极速下载无阻</span>
              </div>
              <div class="card-arrow" aria-hidden="true">→</div>
            </a>

            <a
              href="https://github.com/LanRhyme/ReveriePaint/releases"
              target="_blank"
              rel="noopener"
              class="download-card"
            >
              <div class="card-icon">🐙</div>
              <div class="card-meta">
                <div class="card-title-row">
                  <span class="card-title">GitHub Releases 官方归档</span>
                  <span class="card-badge neutral">官方发布</span>
                </div>
                <span class="card-desc">浏览完整的更新日志、历史版本构建归档与源代码 Release</span>
              </div>
              <div class="card-arrow" aria-hidden="true">→</div>
            </a>
          </div>

          <!-- 实机截图展示窗：GitHub Release 教程 -->
          <div class="figure-row">
            <figure class="mockup-frame" @click="openLightbox(imgInstallRepo, 'GitHub 仓库主页右侧 Releases 区域导航')">
              <div class="mockup-bar">
                <div class="mockup-dots" aria-hidden="true">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <span class="mockup-title">GitHub Releases 区域入口</span>
                <span class="mockup-zoom-tip">
                  <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  放大
                </span>
              </div>
              <div class="mockup-screen">
                <img :src="imgInstallRepo" alt="GitHub 仓库主页右侧 Releases 区域导航" loading="lazy" />
              </div>
              <figcaption class="mockup-caption">
                在 GitHub 仓库主页右侧侧边栏中点击 <strong>Releases</strong> 即可跳转最新版本
              </figcaption>
            </figure>

            <figure class="mockup-frame" @click="openLightbox(imgInstallRelease, 'Releases 页面底部的 Assets 文件下载列表')">
              <div class="mockup-bar">
                <div class="mockup-dots" aria-hidden="true">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <span class="mockup-title">Releases APK 下载文件列表</span>
                <span class="mockup-zoom-tip">
                  <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  放大
                </span>
              </div>
              <div class="mockup-screen">
                <img :src="imgInstallRelease" alt="Releases 页面底部的 Assets 文件下载列表" loading="lazy" />
              </div>
              <figcaption class="mockup-caption">
                在对应版本的 <strong>Assets</strong> 下拉列表中，点击以 <code>.apk</code> 结尾的文件下载
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="permissions" class="doc-section">
          <h2 class="section-title">
            <a href="#permissions" class="anchor-link" aria-label="锚点链接">#</a>
            安装步骤与系统权限
          </h2>

          <div class="styled-steps">
            <div class="step-card">
              <div class="step-badge">01</div>
              <div class="step-content">
                <h4 class="step-title">下载最新版本的 APK 构建包</h4>
                <p>通过 Mirror酱 或 GitHub Releases 下载最新安装包文件至平板设备存储中。</p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-badge">02</div>
              <div class="step-content">
                <h4 class="step-title">开启「允许安装来自此来源的应用」</h4>
                <p>在系统文件管理器中点击下载完毕的 APK，系统安全弹窗中勾选信任该来源并允许继续安装。</p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-badge">03</div>
              <div class="step-content">
                <h4 class="step-title">授予存储与外设交互权限</h4>
                <p>首次运行软件时，根据指引授予文件读写权限（用于读取笔刷与保存 <code>.revp</code> 工程）。若使用星闪或蓝牙触控笔，请授予蓝牙通信权限以启用压感与侧键手势。</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ══ 3. 笔刷与资源格式 ═════════════════════ -->
        <section id="import-brush" class="doc-section">
          <h2 class="section-title">
            <a href="#import-brush" class="anchor-link" aria-label="锚点链接">#</a>
            导入笔刷预设与 QQ 存储路径
          </h2>
          <p>
            ReveriePaint 具备专门的笔刷工作坊面板，支持从本地存储中加载预设：
          </p>

          <figure class="mockup-frame single-frame" @click="openLightbox(imgBrushImport, '笔刷库导入预设界面说明')">
            <div class="mockup-bar">
              <div class="mockup-dots" aria-hidden="true">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="mockup-title">笔刷工作坊 · 导入预设</span>
              <span class="mockup-zoom-tip">
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                放大
              </span>
            </div>
            <div class="mockup-screen">
              <img :src="imgBrushImport" alt="笔刷库导入预设界面说明" loading="lazy" />
            </div>
            <figcaption class="mockup-caption">
              ① 点击左侧工具栏画笔图标打开笔刷库 ＞ ② 点击底部的「导入」按钮，调起系统文件管理器即可导入
            </figcaption>
          </figure>

          <!-- QQ 接收路径解决方案 -->
          <div class="callout callout-tip">
            <div class="callout-badge">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M8 1.5 a 4.5 4.5 0 0 0 -4.5 4.5 c 0 2.2 1.5 3.8 2.5 5 h 4 c 1 -1.2 2.5 -2.8 2.5 -5 a 4.5 4.5 0 0 0 -4.5 -4.5 z" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <path d="M6 13.5 h4 M6.5 15 h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="callout-body">
              <strong>QQ 群内下载的笔刷文件导入技巧</strong>
              <p>
                由于 Android 11+ 系统沙盒安全机制，从 QQ 群接收的笔刷合辑默认存放在 QQ 私有数据目录下：
              </p>
              <div class="terminal-box">
                <div class="terminal-head">
                  <span class="terminal-label">QQ 默认文件下载路径</span>
                  <button
                    type="button"
                    class="btn-terminal-copy"
                    @click="copyText('qqpath', '/storage/emulated/0/Android/data/com.tencent.mobileqq/Tencent/QQfile_recv/')"
                  >
                    <svg v-if="copiedMap['qqpath']" viewBox="0 0 16 16" width="12" height="12"><path d="M3 8.5 l3.5 3.5 l6.5 -7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    <svg v-else viewBox="0 0 16 16" width="12" height="12"><rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3 11 V3 h8" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>
                    {{ copiedMap['qqpath'] ? '已复制路径' : '复制路径' }}
                  </button>
                </div>
                <code class="terminal-code">/storage/emulated/0/Android/data/com.tencent.mobileqq/Tencent/QQfile_recv/</code>
              </div>
              <p class="tip-alt">
                <strong>更加推荐的快捷方法：</strong>在手机或平板 QQ 聊天中，点击文件右侧的 <code>···</code> 菜单，直接选择「保存到手机」或「另存为」，转存至「下载 (Download)」等公共目录，导入时直接选取即可。
              </p>
            </div>
          </div>

          <figure class="mockup-frame single-frame small-frame" @click="openLightbox(imgBrushQq, 'QQ 文件卡片右侧另存为菜单')">
            <div class="mockup-bar">
              <div class="mockup-dots" aria-hidden="true">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="mockup-title">QQ 转存文件操作</span>
              <span class="mockup-zoom-tip">
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                放大
              </span>
            </div>
            <div class="mockup-screen">
              <img :src="imgBrushQq" alt="QQ 文件卡片右侧另存为菜单" loading="lazy" />
            </div>
            <figcaption class="mockup-caption">
              点击群文件右侧三个点，选择「保存到手机」另存为公共下载目录
            </figcaption>
          </figure>
        </section>

        <section id="brush-formats" class="doc-section">
          <h2 class="section-title">
            <a href="#brush-formats" class="anchor-link" aria-label="锚点链接">#</a>
            Krita 笔刷格式原理
          </h2>
          <p>
            因为底层运行着完整的 Krita 笔刷引擎内核，ReveriePaint 原生支持 Krita 官方规范所定义的所有笔刷资源：
          </p>

          <div class="table-card">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>格式后缀</th>
                  <th>类型名称</th>
                  <th>技术原理与内置数据</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="format-pill kpp">.kpp</span></td>
                  <td><strong>Krita 独立画笔预设</strong></td>
                  <td>记录笔尖形状印记、物理颜料动态阻尼、压感过渡曲线、颜色涂抹混合度及缩略图</td>
                </tr>
                <tr>
                  <td><span class="format-pill bundle">.bundle</span></td>
                  <td><strong>Krita 综合资源包合辑</strong></td>
                  <td>通过 ZIP 压缩归档的大型资源包，打包包含多套画笔、笔尖贴图（.gbr）、纸纹材质（.pat）及色板</td>
                </tr>
                <tr>
                  <td><span class="format-pill myb">.myb</span></td>
                  <td><strong>MyPaint 笔刷预设</strong></td>
                  <td>支持 MyPaint 经典轻量手绘引擎的画笔配置</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="abr-tips" class="doc-section">
          <h2 class="section-title">
            <a href="#abr-tips" class="anchor-link" aria-label="锚点链接">#</a>
            Photoshop ABR 格式说明与笔尖转换技巧
          </h2>
          <p>
            <code>.abr</code>（Adobe Photoshop Brush）是 PS 专属的二进制资源包，目前 ReveriePaint 尚在研制原生解析管线。若你想使用经典的 PS 笔刷，可以采用以下<strong>笔尖印记导入工作流</strong>：
          </p>

          <div class="workflow-card">
            <div class="workflow-header">
              <span class="workflow-tag">工作流转换技巧</span>
              <span class="workflow-sub">只需 4 步即可将任意 PS 画笔移至安卓平板</span>
            </div>
            <div class="workflow-steps">
              <div class="w-step">
                <span class="w-num">1</span>
                <div class="w-body">
                  <strong>导出笔尖 PNG</strong>
                  <p>在 PC 上使用 ABRViewer 或 Photoshop，将画笔笔尖图案另存为透明背景的 <code>.png</code> 图片文件。</p>
                </div>
              </div>
              <div class="w-step">
                <span class="w-num">2</span>
                <div class="w-body">
                  <strong>新建笔刷</strong>
                  <p>在 ReveriePaint 笔刷面板中，点击左下角「+ 新建笔刷」以创建空白预设。</p>
                </div>
              </div>
              <div class="w-step">
                <span class="w-num">3</span>
                <div class="w-body">
                  <strong>导入自定义笔尖</strong>
                  <p>进入 <strong>笔刷设置 ＞ 高级工坊 ＞ 笔尖形状 ＞ 导入自定义</strong>，选择刚刚导出的 <code>.png</code> 笔尖图案。</p>
                </div>
              </div>
              <div class="w-step">
                <span class="w-num">4</span>
                <div class="w-body">
                  <strong>微调动态参数</strong>
                  <p>设置间距（Spacing）、随机角度翻转与压感映射，点击右上角保存即可随时调用。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="brush-resources" class="doc-section">
          <h2 class="section-title">
            <a href="#brush-resources" class="anchor-link" aria-label="锚点链接">#</a>
            社区笔刷资源获取渠道
          </h2>
          <p>
            全球插画师为 Krita 创作了浩瀚的开源笔刷库，均可在平板上直接下载并一键载入：
          </p>

          <div class="resource-tiles">
            <a
              href="https://krita-artists.org/c/resources/brushes-and-bundles/32"
              target="_blank"
              rel="noopener"
              class="resource-tile"
            >
              <div class="tile-icon">🌐</div>
              <div class="tile-info">
                <h4>Krita Artists 官方论坛资源专区</h4>
                <p>汇集全球数字艺术家分享的上千套厚涂、水彩、复古颗粒素描与漫画勾线 Bundle，品质极高且免费开源。</p>
              </div>
              <div class="tile-ext" aria-hidden="true">↗</div>
            </a>

            <div class="resource-tile internal">
              <div class="tile-icon">💬</div>
              <div class="tile-info">
                <h4>ReveriePaint 创作者群精品归档</h4>
                <p>官方交流群内群友精选整理了适配平板绘画手感的开箱即用笔刷包，进入群文件即可下载（群号 <code>729283213</code>）。</p>
              </div>
              <button
                type="button"
                class="tile-action-btn"
                @click="copyText('tileqq', '729283213')"
              >
                {{ copiedMap['tileqq'] ? '已复制群号' : '复制群号' }}
              </button>
            </div>
          </div>
        </section>

        <section id="file-formats" class="doc-section">
          <h2 class="section-title">
            <a href="#file-formats" class="anchor-link" aria-label="锚点链接">#</a>
            支持的工程与图像格式
          </h2>
          <p>
            ReveriePaint 拒绝私有生态捆绑，坚持工程与图层数据完全开放：
          </p>

          <div class="formats-grid">
            <div class="format-card primary-revp">
              <div class="format-header">
                <span class="format-badge">自研核心</span>
                <span class="format-ext">.revp</span>
              </div>
              <h4 class="format-name">ReveriePaint 开放工程</h4>
              <p class="format-desc">不仅完整归档分层图层树、混合模式与透明度，更无损记录全流程<strong>笔迹延时事件流</strong>，支持随时无损拖动进度条重温创作过程。</p>
            </div>

            <div class="format-card">
              <div class="format-header">
                <span class="format-badge neutral">桌面互通</span>
                <span class="format-ext">.kra</span>
              </div>
              <h4 class="format-name">Krita 官方工程文件</h4>
              <p class="format-desc">完美兼容桌面版 Krita 项目工程，实现平板外出草稿与 PC 桌面精修之间的无缝文件互传。</p>
            </div>

            <div class="format-card">
              <div class="format-header">
                <span class="format-badge neutral">行业规范</span>
                <span class="format-ext">.psd</span>
              </div>
              <h4 class="format-name">Photoshop 分层文档</h4>
              <p class="format-desc">支持导入与导出标砖分层 PSD 文件，完好保留图层名称、分组嵌套及混合模式对应属性。</p>
            </div>

            <div class="format-card">
              <div class="format-header">
                <span class="format-badge neutral">平片输出</span>
                <span class="format-ext">PNG / JPG / WEBP</span>
              </div>
              <h4 class="format-name">高清图像平片导出</h4>
              <p class="format-desc">支持保留 Alpha 透明通道的无损 PNG，以及针对社交媒体优化的高压缩比 WebP 与高质量 JPG。</p>
            </div>
          </div>
        </section>

        <!-- ══ 4. 界面与核心工具 ═════════════════════ -->
        <section id="ui-overview" class="doc-section">
          <h2 class="section-title">
            <a href="#ui-overview" class="anchor-link" aria-label="锚点链接">#</a>
            主画布界面全局总览
          </h2>
          <p>
            ReveriePaint 主画布遵循「把注意力留给画作本身」的减法设计，浮动面板支持随手缩放收纳：
          </p>

          <figure class="mockup-frame" @click="openLightbox(imgUiMain, 'ReveriePaint 平板主画布界面全局总览')">
            <div class="mockup-bar">
              <div class="mockup-dots" aria-hidden="true">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="mockup-title">平板主界面全局导览</span>
              <span class="mockup-zoom-tip">
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                放大查看
              </span>
            </div>
            <div class="mockup-screen">
              <img :src="imgUiMain" alt="ReveriePaint 平板主画布界面全局总览" loading="lazy" />
            </div>
            <figcaption class="mockup-caption">
              主画布各功能分区：左侧定制工具栏、快捷画笔大小/不透明度滑块、顶部系统控制、图层与滤镜浮窗、悬浮色轮
            </figcaption>
          </figure>
        </section>

        <section id="ui-toolbar" class="doc-section">
          <h2 class="section-title">
            <a href="#ui-toolbar" class="anchor-link" aria-label="锚点链接">#</a>
            工具栏滑动与排布定制
          </h2>
          <p>
            针对双手握持平板的拇指操作习惯，左侧工具条支持上下滑动与常用位编排：
          </p>

          <div class="figure-row">
            <figure class="mockup-frame" @click="openLightbox(imgUiLeftbar, '左侧菜单栏操作秘笈')">
              <div class="mockup-bar">
                <div class="mockup-dots" aria-hidden="true">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <span class="mockup-title">工具栏手势与排布技巧</span>
                <span class="mockup-zoom-tip">
                  <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  放大
                </span>
              </div>
              <div class="mockup-screen">
                <img :src="imgUiLeftbar" alt="左侧菜单栏操作秘笈" loading="lazy" />
              </div>
              <figcaption class="mockup-caption">
                工具栏支持直接上下滑动浏览全部工具，点击底部展开按钮可按个人习惯自由排布
              </figcaption>
            </figure>

            <div class="feature-notes">
              <div class="note-item">
                <div class="note-bullet">1</div>
                <div>
                  <strong>上下流畅滑动手势</strong>
                  <p>左侧工具栏内置平滑虚拟滚动容器，无需折叠多级菜单，直接手指滑动即可触达任意绘图工具。</p>
                </div>
              </div>
              <div class="note-item">
                <div class="note-bullet">2</div>
                <div>
                  <strong>工具位自由拖曳重排</strong>
                  <p>点击工具栏最下方的编辑按钮，即可长按拖动常用工具位，定制属于你专属的操作布局。</p>
                </div>
              </div>
              <div class="note-item">
                <div class="note-bullet">3</div>
                <div>
                  <strong>画笔尺寸与不透明度滑块</strong>
                  <p>左侧常驻 Size 与 Opacity 快速调节轨道，支持单指拖曳与数值微调。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="color-picker" class="doc-section">
          <h2 class="section-title">
            <a href="#color-picker" class="anchor-link" aria-label="锚点链接">#</a>
            悬浮取色面板与固定技巧
          </h2>
          <p>
            ReveriePaint 彻底重构了移动端取色交互，告别粗糙全屏遮罩：
          </p>

          <ul class="styled-points">
            <li>
              <strong>自由拖动位置：</strong>按住取色面板顶部的抓手把手，可自由拖曳至画布任意无遮挡位置。
            </li>
            <li>
              <strong>图钉锁定状态（Pin）：</strong>点击取色面板左上角的「图钉」图标，面板将处于常驻置顶状态，点击外部画布不会自动关闭，实现边画边取色。
            </li>
            <li>
              <strong>五大取色引擎一键切换：</strong>底部支持即时切换 SAI 经典 V-HSV 色轮、色彩调和助手、3D 光影受光球、智能色卡与数值微调滑杆。
            </li>
          </ul>
        </section>

        <section id="ui-scale" class="doc-section">
          <h2 class="section-title">
            <a href="#ui-scale" class="anchor-link" aria-label="锚点链接">#</a>
            界面尺寸与滑块适配
          </h2>
          <p>
            无论你使用的是 8.8 英寸的小巧手持平板，还是 14.2 英寸的桌面级巨屏设备，均可在设置中找到最适合自己握持手感的缩放比：
          </p>

          <figure class="mockup-frame single-frame" @click="openLightbox(imgUiSettings, '主题设置与界面尺寸滑块长度调节')">
            <div class="mockup-bar">
              <div class="mockup-dots" aria-hidden="true">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="mockup-title">设置 ＞ 偏好与硬件 ＞ 主题设置</span>
              <span class="mockup-zoom-tip">
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                放大
              </span>
            </div>
            <div class="mockup-screen">
              <img :src="imgUiSettings" alt="主题设置与界面尺寸滑块长度调节" loading="lazy" />
            </div>
            <figcaption class="mockup-caption">
              进入设置 ＞ 偏好与硬件 ＞ 主题设置，可微调绘画界面整体缩放比例与侧边滑块长度
            </figcaption>
          </figure>
        </section>

        <section id="tools-list" class="doc-section">
          <h2 class="section-title">
            <a href="#tools-list" class="anchor-link" aria-label="锚点链接">#</a>
            全量工具清单一览表
          </h2>
          <p>
            ReveriePaint 具备覆盖专业数字插画全工作流的工具矩阵：
          </p>

          <div class="tool-tags-matrix">
            <div class="tool-cat-card paint-cat">
              <div class="cat-header">
                <span class="cat-icon">🖌️</span>
                <span class="cat-name">绘画与修饰</span>
              </div>
              <div class="chip-cluster">
                <span class="tool-chip">画笔</span>
                <span class="tool-chip">橡皮擦</span>
                <span class="tool-chip">物理混合涂抹</span>
                <span class="tool-chip">油漆桶填充</span>
                <span class="tool-chip">多点渐变</span>
              </div>
            </div>

            <div class="tool-cat-card select-cat">
              <div class="cat-header">
                <span class="cat-icon">✨</span>
                <span class="cat-name">精准选区体系</span>
              </div>
              <div class="chip-cluster">
                <span class="tool-chip">折线套索选择</span>
                <span class="tool-chip">矩形框选</span>
                <span class="tool-chip">椭圆选区</span>
                <span class="tool-chip">多边形选区</span>
                <span class="tool-chip">连续选择 (魔棒)</span>
                <span class="tool-chip">相似色选区</span>
              </div>
            </div>

            <div class="tool-cat-card shape-cat">
              <div class="cat-header">
                <span class="cat-icon">📐</span>
                <span class="cat-name">矢量几何与路径</span>
              </div>
              <div class="chip-cluster">
                <span class="tool-chip">直线标尺</span>
                <span class="tool-chip">矩形</span>
                <span class="tool-chip">椭圆</span>
                <span class="tool-chip">多边形</span>
                <span class="tool-chip">多段折线</span>
                <span class="tool-chip">贝塞尔矢量路径</span>
              </div>
            </div>

            <div class="tool-cat-card transform-cat">
              <div class="cat-header">
                <span class="cat-icon">🪟</span>
                <span class="cat-name">构图、变换与辅助</span>
              </div>
              <div class="chip-cluster">
                <span class="tool-chip">自由位移</span>
                <span class="tool-chip">无损裁剪</span>
                <span class="tool-chip">主画布镜像翻转</span>
                <span class="tool-chip">双模式悬浮参考窗</span>
                <span class="tool-chip">对称尺 (调校中)</span>
                <span class="tool-chip">透视辅助尺</span>
                <span class="tool-chip">液化 (优化中)</span>
                <span class="tool-chip">文字排版</span>
                <span class="tool-chip">像素标尺测量</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ══ 5. 图层与画布规格 ═════════════════════ -->
        <section id="layer-specs" class="doc-section">
          <h2 class="section-title">
            <a href="#layer-specs" class="anchor-link" aria-label="锚点链接">#</a>
            图层上限与推荐分辨率
          </h2>
          <p>
            ReveriePaint <strong>没有硬性设定最高图层数量上限</strong>，而是依托动态稀疏瓦片内存管理（Sparse Tile Memory System），根据设备当前的可用物理运行内存（RAM）动态分配：
          </p>

          <figure class="mockup-frame single-frame" @click="openLightbox(imgLayersPresets, '新建画布面板与推荐图层数')">
            <div class="mockup-bar">
              <div class="mockup-dots" aria-hidden="true">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="mockup-title">新建画布 · 设备内存安全层数提示</span>
              <span class="mockup-zoom-tip">
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                放大
              </span>
            </div>
            <div class="mockup-screen">
              <img :src="imgLayersPresets" alt="新建画布面板与推荐图层数" loading="lazy" />
            </div>
            <figcaption class="mockup-caption">
              创建画布时，系统会基于当前设备可用内存实时标出各分辨率推荐的最大安全图层数
            </figcaption>
          </figure>

          <div class="table-card">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>预设规格</th>
                  <th>分辨率与 PPI</th>
                  <th>典型设备支持图层数</th>
                  <th>适用场景</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>当前设备全屏</strong></td>
                  <td>1440 × 3200 · 300 PPI</td>
                  <td><span class="stat-highlight">230 ~ 260+ 层</span></td>
                  <td>完美贴合当前设备屏幕比例，零黑边沉浸心流</td>
                </tr>
                <tr>
                  <td><strong>正方形 2K</strong></td>
                  <td>2048 × 2048 · 300 PPI</td>
                  <td><span class="stat-highlight">250 ~ 280+ 层</span></td>
                  <td>社交网络头像、角色立绘、插画与社交贴图</td>
                </tr>
                <tr>
                  <td><strong>正方形 4K</strong></td>
                  <td>4096 × 4096 · 300 PPI</td>
                  <td><span class="stat-highlight">60 ~ 80+ 层</span></td>
                  <td>超高清印刷级精细绘制与大幅面商业细节输出</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ══ 6. 问题反馈与社群 ═════════════════════ -->
        <section id="feedback" class="doc-section">
          <h2 class="section-title">
            <a href="#feedback" class="anchor-link" aria-label="锚点链接">#</a>
            Bug 反馈与 GitHub 规范
          </h2>
          <p>
            由于开发者精力有限，为了确保偶遇的异常能够被长效跟踪与优先修复，强烈推荐优先前往 GitHub Issues 提交：
          </p>

          <figure class="mockup-frame single-frame small-frame" @click="openLightbox(imgFeedbackIssue, '开发者关于反馈的温馨提示')">
            <div class="mockup-bar">
              <div class="mockup-dots" aria-hidden="true">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="mockup-title">开发者反馈提示</span>
              <span class="mockup-zoom-tip">
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M10 10 L14 14 M6.5 10 a 3.5 3.5 0 1 0 0 -7 a 3.5 3.5 0 0 0 0 7 z M5 6.5 h3 M6.5 5 v3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                放大
              </span>
            </div>
            <div class="mockup-screen">
              <img :src="imgFeedbackIssue" alt="开发者关于反馈的温馨提示" loading="lazy" />
            </div>
            <figcaption class="mockup-caption">
              群聊消息容易被刷屏冲淡，在 GitHub Issues 提交问题能够长效跟踪并被优先修复
            </figcaption>
          </figure>

          <div class="feedback-spec-card">
            <div class="spec-head">
              <span class="spec-icon">📋</span>
              <span class="spec-title">Issue 反馈推荐格式模版</span>
            </div>
            <ul class="spec-list">
              <li><strong>设备具体型号：</strong>标注平板/手机品牌与型号（如：华为 MatePad Pro 13.2 / 小米平板 6 Max）。</li>
              <li><strong>系统与软件版本：</strong>标注 Android 系统版本及 ReveriePaint 具体版本号（如：v1.3.3）。</li>
              <li><strong>触发复现步骤：</strong>尽可能简要写出复现步骤（如：新建画布 ＞ 启用对称尺 ＞ 画第一笔时线条飞出）。</li>
              <li><strong>屏幕录制与截图：</strong>如有偶发复现情况，录制简短操作视频或截图可让问题以 10 倍速度被排查修复。</li>
            </ul>
          </div>

          <div class="action-btn-row">
            <a
              href="https://github.com/LanRhyme/ReveriePaint/issues"
              target="_blank"
              rel="noopener"
              class="btn-action primary"
            >
              前往 GitHub Issues 提交反馈
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
          </div>
        </section>

        <section id="community" class="doc-section">
          <h2 class="section-title">
            <a href="#community" class="anchor-link" aria-label="锚点链接">#</a>
            创作者交流社群
          </h2>
          <p>
            欢迎加入官方创作者群，与数千位画师交流手绘心得、分享笔刷资源并率先获取最新内测构建：
          </p>

          <div class="community-banner">
            <div class="community-left">
              <div class="community-badge">OFFICIAL COMMUNITY</div>
              <h3 class="community-name">ReveriePaint 创作者交流群</h3>
              <p class="community-desc">交流平板手绘体验、反馈功能建议与获取最新预构建 APK</p>
              <div class="community-code-row">
                <span class="code-label">官方群号</span>
                <code class="code-num">729283213</code>
              </div>
            </div>
            <div class="community-right">
              <button
                type="button"
                class="btn-banner-action"
                @click="copyText('bannerqq', '729283213')"
              >
                {{ copiedMap['bannerqq'] ? '已复制群号 729283213' : '复制群号: 729283213' }}
              </button>
              <a
                href="https://qm.qq.com/q/729283213"
                target="_blank"
                rel="noopener"
                class="btn-banner-action primary"
              >
                一键唤起 QQ 加入
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        <!-- 页面底部版权 -->
        <footer class="content-footer">
          <div class="footer-meta">
            <p>© {{ new Date().getFullYear() }} LanRhyme · 基于 GPL-3.0 协议全量开源</p>
            <p class="footer-sub">Krita 为其各自所有者的商标，本项目由社区独立维护</p>
          </div>
          <div class="footer-links">
            <a href="/">官网首页</a>
            <a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener">GitHub 仓库</a>
            <a href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android" target="_blank" rel="noopener">Mirror酱</a>
            <a href="https://qm.qq.com/q/729283213" target="_blank" rel="noopener">QQ 交流群</a>
          </div>
        </footer>
      </main>

      <!-- ── 右侧本页目录浮动导航 (宽屏) ───────────── -->
      <aside class="docs-toc" aria-label="本页目录导航">
        <div class="toc-card">
          <div class="toc-header">
            <span class="toc-dot" aria-hidden="true"></span>
            <span class="toc-title">本页内容</span>
          </div>
          <ul class="toc-list">
            <li v-for="item in allItems" :key="item.id">
              <a
                :href="`#${item.id}`"
                class="toc-link"
                :class="{ 'is-active': activeSectionId === item.id }"
                @click.prevent="scrollToAnchor(item.id)"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- ── 回到顶部浮动按钮 ───────────────────────── -->
    <transition name="fade">
      <button
        v-if="showBackToTop"
        class="floating-top-btn"
        type="button"
        aria-label="回到顶部"
        @click="scrollToTop"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M8 12 V4 M4 7 l4 -4 l4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </transition>

    <!-- ── 实机截图高清灯箱模态 ───────────────────── -->
    <transition name="lightbox">
      <div
        v-if="lightboxImg"
        class="lightbox-overlay"
        @click="closeLightbox"
      >
        <div class="lightbox-dialog" @click.stop>
          <div class="lightbox-topbar">
            <span class="lightbox-title">{{ lightboxImg.caption }}</span>
            <button
              type="button"
              class="lightbox-close"
              aria-label="关闭灯箱"
              @click="closeLightbox"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="lightbox-body">
            <img :src="lightboxImg.src" :alt="lightboxImg.caption" />
          </div>
          <div class="lightbox-footer">
            <span class="lightbox-hint">按 ESC 键或点击外部空白即可关闭</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ══ 全局布局 ═══════════════════════════════════ */
.docs-layout {
  min-height: 100vh;
  background-color: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
}

/* 顶部阅读进度条 */
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2.5px;
  background: linear-gradient(90deg, var(--accent), var(--ink));
  z-index: 100;
  transition: width 0.1s linear;
}

/* ══ 顶部玻璃拟态导航栏 ═════════════════════════ */
.docs-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(245, 242, 236, 0.82);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(20, 22, 26, 0.08);
  height: 64px;
}
.docs-header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.docs-header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1.0625rem;
  letter-spacing: -0.015em;
  color: var(--ink);
  transition: opacity 0.2s;
}
.brand-link:hover {
  opacity: 0.85;
}
.brand-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--ink);
  color: var(--paper);
  box-shadow: 0 2px 8px rgba(20, 22, 26, 0.12);
}
.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  background: rgba(20, 22, 26, 0.06);
  border: 1px solid rgba(20, 22, 26, 0.08);
  padding: 3px 9px;
  border-radius: 999px;
}
.status-pulse {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #34c759;
  box-shadow: 0 0 0 2px rgba(52, 199, 89, 0.2);
}

/* 搜索栏 */
.docs-search {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 340px;
  width: 100%;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: var(--ink-soft-2);
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 36px;
  padding: 0 54px 0 34px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.65);
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--ink);
  outline: none;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
}
.search-input:focus {
  background: #fff;
  border-color: var(--ink);
  box-shadow: 0 2px 10px rgba(20, 22, 26, 0.08);
}
.search-kbd {
  position: absolute;
  right: 12px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--ink-ghost);
  border: 1px solid var(--line-faint);
  background: rgba(20, 22, 26, 0.04);
  padding: 1px 5px;
  border-radius: 4px;
  pointer-events: none;
}
.search-clear {
  position: absolute;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 0;
  background: var(--ink-ghost);
  color: #fff;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
}

/* 外部导航链接 */
.docs-header-links {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-link {
  font-size: 0.84375rem;
  color: var(--ink-mid);
  transition: color 0.2s, background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.header-link:hover {
  color: var(--ink);
}
.header-link.link-pill {
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.06);
  border: 1px solid var(--line);
  color: var(--ink);
  font-weight: 500;
}
.header-link.link-pill:hover {
  background: rgba(20, 22, 26, 0.1);
}
.header-link.qq-btn {
  background: transparent;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  padding: 4px 12px;
  font-family: inherit;
  color: var(--ink);
  font-weight: 500;
}
.header-link.qq-btn:hover {
  background: #fff;
}

/* 移动端汉堡按钮 */
.mobile-menu-btn {
  display: none;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.6);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  color: var(--ink);
  padding: 0;
}
.bar-line {
  width: 16px;
  height: 1.5px;
  background: currentColor;
  border-radius: 2px;
  transition: transform 0.25s var(--ease-out-expo);
}
.bar-line.open:first-child {
  transform: translateY(3.25px) rotate(45deg);
}
.bar-line.open:last-child {
  transform: translateY(-3.25px) rotate(-45deg);
}

/* ══ 三栏式主体网格 ═════════════════════════════ */
.docs-body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 210px;
  gap: clamp(28px, 4vw, 56px);
  padding-top: 36px;
  padding-bottom: 96px;
  align-items: start;
}

/* ── 左侧侧边栏 ───────────────────────────────── */
.docs-sidebar {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  scrollbar-width: thin;
  padding-right: 8px;
}
.sidebar-inner {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line-faint);
}
.sidebar-title {
  font-family: var(--font-mono);
  font-size: 0.71875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft-2);
}
.sidebar-count {
  font-size: 0.6875rem;
  color: var(--ink-ghost);
}
.sidebar-empty {
  font-size: 0.8125rem;
  color: var(--ink-soft-2);
  padding: 12px 0;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.group-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.02em;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.group-icon {
  font-size: 0.875rem;
}
.group-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--ink-mid);
  padding: 7px 12px;
  border-radius: 8px;
  line-height: 1.45;
  transition: background 0.2s, color 0.2s;
  position: relative;
}
.nav-link:hover {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.04);
}
.nav-link.is-active {
  color: var(--ink);
  font-weight: 600;
  background: rgba(20, 22, 26, 0.07);
}
.link-bullet {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--line-strong);
  transition: transform 0.2s, background 0.2s;
}
.nav-link.is-active .link-bullet {
  background: var(--ink);
  transform: scale(1.4);
}
.sidebar-bottom {
  padding-top: 12px;
  border-top: 1px solid var(--line-faint);
}
.sidebar-help {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}
.sidebar-help:hover {
  color: var(--ink);
}

/* ── 右侧本页目录 (TOC) ───────────────────────── */
.docs-toc {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  scrollbar-width: none;
}
.toc-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(253, 252, 250, 0.65);
  border: 1px solid var(--line-faint);
}
.toc-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}
.toc-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--ink-ghost);
}
.toc-title {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft-2);
}
.toc-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.toc-link {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
  line-height: 1.5;
  display: block;
  padding: 3px 0;
  transition: color 0.2s, transform 0.2s;
}
.toc-link:hover {
  color: var(--ink);
}
.toc-link.is-active {
  color: var(--ink);
  font-weight: 600;
  transform: translateX(3px);
}

/* ── 正文内容排版 ─────────────────────────────── */
.docs-content {
  display: flex;
  flex-direction: column;
  gap: 56px;
  min-width: 0;
}

/* 面包屑 */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78125rem;
  color: var(--ink-soft-2);
  margin-bottom: 16px;
}
.breadcrumbs a {
  transition: color 0.2s;
}
.breadcrumbs a:hover {
  color: var(--ink);
}
.breadcrumbs .sep {
  opacity: 0.4;
}
.breadcrumbs .current {
  color: var(--ink);
  font-weight: 500;
}

/* 导言头 */
.content-header {
  border-bottom: 1px solid var(--line-faint);
  padding-bottom: 34px;
}
.doc-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--ink-soft-2);
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}
.kicker-pill {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.6875rem;
  font-weight: 700;
}
.doc-main-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1.18;
  letter-spacing: -0.03em;
  color: var(--ink);
}
.doc-lede {
  margin-top: 16px;
  font-size: 1.0625rem;
  line-height: 1.85;
}

/* 导言规格条 */
.doc-meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed var(--line-strong);
}
.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(20, 22, 26, 0.04);
}
.meta-label {
  color: var(--ink-soft-2);
}
.meta-val {
  font-weight: 600;
  color: var(--ink);
  font-family: var(--font-mono);
}

/* 章节通用样式 */
.doc-section {
  scroll-margin-top: 84px;
}
.section-title {
  font-size: clamp(1.375rem, 2.4vw, 1.75rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-bottom: 18px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
}
.anchor-link {
  color: var(--ink-ghost);
  font-family: var(--font-mono);
  font-size: 0.9em;
  opacity: 0.3;
  transition: opacity 0.2s;
  text-decoration: none;
}
.section-title:hover .anchor-link {
  opacity: 1;
}

.doc-section p {
  font-size: 0.9375rem;
  line-height: 1.84;
  color: var(--ink-soft);
  margin-bottom: 16px;
}

/* ══ 提示卡片 (Notion / Tailwind 风格) ═════════ */
.callout {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 12px;
  margin: 22px 0;
  font-size: 0.875rem;
  line-height: 1.75;
}
.callout-badge {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  flex-shrink: 0;
  margin-top: 2px;
}
.callout-body {
  flex: 1;
}
.callout-body strong {
  display: block;
  font-size: 0.90625rem;
  margin-bottom: 4px;
  color: var(--ink);
}
.callout-body p {
  font-size: 0.875rem !important;
  line-height: 1.72 !important;
  margin: 0 !important;
  color: var(--ink-soft) !important;
}

.callout-info {
  background: rgba(91, 127, 199, 0.08);
  border: 1px solid rgba(91, 127, 199, 0.24);
}
.callout-info .callout-badge {
  background: rgba(91, 127, 199, 0.16);
  color: var(--accent-deep);
}

.callout-warning {
  background: rgba(195, 163, 158, 0.16);
  border: 1px solid rgba(195, 163, 158, 0.4);
}
.callout-warning .callout-badge {
  background: rgba(195, 163, 158, 0.3);
  color: #8c4e44;
}

.callout-tip {
  background: rgba(157, 169, 142, 0.14);
  border: 1px solid rgba(157, 169, 142, 0.35);
}
.callout-tip .callout-badge {
  background: rgba(157, 169, 142, 0.3);
  color: #4b6638;
}

/* 终端命令 / 路径框 */
.terminal-box {
  background: var(--ui-900);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 14px;
  margin: 12px 0 10px;
}
.terminal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.terminal-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--ui-text-dim);
  letter-spacing: 0.04em;
}
.btn-terminal-copy {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 0;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-terminal-copy:hover {
  background: rgba(255, 255, 255, 0.22);
}
.terminal-code {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.78125rem;
  color: #8fa3b4;
  word-break: break-all;
  line-height: 1.6;
}
.tip-alt {
  margin-top: 10px !important;
  font-size: 0.8125rem !important;
}

/* ══ 路线图网格 ═════════════════════════════════ */
.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.roadmap-card {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.25s var(--ease-out-expo), box-shadow 0.25s;
}
.roadmap-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-s);
}
.roadmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.roadmap-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 2px 7px;
  border-radius: 999px;
}
.in-progress .roadmap-badge {
  background: rgba(195, 163, 158, 0.22);
  color: #8c4e44;
}
.planned .roadmap-badge {
  background: rgba(91, 127, 199, 0.15);
  color: var(--accent-deep);
}
.continuous .roadmap-badge {
  background: rgba(157, 169, 142, 0.2);
  color: #4b6638;
}
.roadmap-tag {
  font-size: 0.6875rem;
  color: var(--ink-soft-2);
}
.roadmap-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  margin-top: 4px;
}
.roadmap-desc {
  font-size: 0.8125rem !important;
  line-height: 1.7 !important;
  color: var(--ink-mid) !important;
  margin: 0 !important;
}

/* ══ 下载磁贴卡片 ═══════════════════════════════ */
.download-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.download-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 14px;
  background: var(--card);
  border: 1px solid var(--line-faint);
  transition: transform 0.25s var(--ease-out-expo), box-shadow 0.25s, border-color 0.25s;
  text-decoration: none;
}
.download-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-m);
  border-color: var(--line);
}
.download-card.highlight {
  background: var(--ui-900);
  border-color: var(--ui-600);
  color: var(--ui-text);
}
.download-card.highlight .card-title {
  color: #fff;
}
.download-card.highlight .card-desc {
  color: var(--ui-text-dim);
}
.card-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.card-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
}
.card-desc {
  font-size: 0.8125rem;
  color: var(--ink-mid);
}
.card-badge {
  font-size: 0.6875rem;
  font-family: var(--font-mono);
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
.card-badge.neutral {
  background: rgba(20, 22, 26, 0.06);
  color: var(--ink-soft-2);
}
.card-arrow {
  font-size: 1.25rem;
  color: var(--ink-soft-2);
  transition: transform 0.25s var(--ease-out-expo), color 0.25s;
}
.download-card:hover .card-arrow {
  transform: translateX(4px);
  color: var(--ink);
}
.download-card.highlight:hover .card-arrow {
  color: #fff;
}

/* ══ 设备 / 视窗框架 (Mockup Window) ════════════ */
.figure-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 24px 0;
}
.mockup-frame {
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  background: var(--ui-900);
  border: 1px solid rgba(20, 22, 26, 0.14);
  box-shadow: var(--shadow-m);
  cursor: zoom-in;
  transition: transform 0.3s var(--ease-out-expo), box-shadow 0.3s;
}
.mockup-frame:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-l);
}
.mockup-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #181a1d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.mockup-dots {
  display: flex;
  gap: 6px;
}
.mockup-dots .dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}
.dot.red { background: #d18a82; }
.dot.yellow { background: #d6b579; }
.dot.green { background: #96b49c; }

.mockup-title {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--ui-text-dim);
  letter-spacing: 0.02em;
}
.mockup-zoom-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.45);
  transition: color 0.2s;
}
.mockup-frame:hover .mockup-zoom-tip {
  color: #fff;
}
.mockup-screen {
  background: #111315;
  display: flex;
  justify-content: center;
  align-items: center;
}
.mockup-screen img {
  width: 100%;
  height: auto;
  display: block;
}
.mockup-caption {
  padding: 12px 16px;
  background: var(--card);
  font-size: 0.8125rem;
  color: var(--ink-mid);
  line-height: 1.6;
  border-top: 1px solid var(--line-faint);
}

.mockup-frame.single-frame {
  margin: 22px 0;
}
.mockup-frame.small-frame {
  max-width: 480px;
}

/* ══ 步骤卡片 (Step Card) ═══════════════════════ */
.styled-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 22px 0;
}
.step-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--line-faint);
  transition: transform 0.25s var(--ease-out-expo);
}
.step-card:hover {
  transform: translateX(4px);
}
.step-badge {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}
.step-content {
  flex: 1;
}
.step-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
}
.step-content p {
  font-size: 0.875rem !important;
  line-height: 1.75 !important;
  color: var(--ink-mid) !important;
  margin: 0 !important;
}

/* ══ 现代化数据表格 ═════════════════════════════ */
.table-card {
  overflow-x: auto;
  margin: 20px 0;
  border: 1px solid var(--line-faint);
  border-radius: 12px;
  background: var(--card);
}
.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84375rem;
  text-align: left;
}
.styled-table th {
  background: rgba(20, 22, 26, 0.03);
  padding: 14px 18px;
  font-weight: 600;
  color: var(--ink);
  border-bottom: 1px solid var(--line-faint);
}
.styled-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--line-faint);
  color: var(--ink-soft);
  line-height: 1.6;
}
.styled-table tr:last-child td {
  border-bottom: 0;
}
.styled-table tr:hover td {
  background: rgba(20, 22, 26, 0.015);
}
.format-pill {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}
.format-pill.kpp {
  background: rgba(91, 127, 199, 0.14);
  color: var(--accent-deep);
}
.format-pill.bundle {
  background: rgba(157, 169, 142, 0.22);
  color: #4b6638;
}
.format-pill.myb {
  background: rgba(195, 163, 158, 0.22);
  color: #8c4e44;
}
.stat-highlight {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--ink);
}

/* ══ ABR 转换工作流卡片 ═════════════════════════ */
.workflow-card {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 14px;
  padding: 24px 26px;
  margin: 22px 0;
}
.workflow-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.workflow-tag {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
}
.workflow-sub {
  font-size: 0.8125rem;
  color: var(--ink-soft-2);
}
.workflow-steps {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.w-step {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(20, 22, 26, 0.025);
}
.w-num {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--line-strong);
  color: var(--ink);
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.w-body strong {
  font-size: 0.875rem;
  color: var(--ink);
  display: block;
  margin-bottom: 4px;
}
.w-body p {
  font-size: 0.8125rem !important;
  color: var(--ink-mid) !important;
  line-height: 1.65 !important;
  margin: 0 !important;
}

/* ══ 资源磁贴 ═══════════════════════════════════ */
.resource-tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.resource-tile {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--line-faint);
  text-decoration: none;
  transition: transform 0.25s var(--ease-out-expo), box-shadow 0.25s;
}
.resource-tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-s);
}
.tile-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}
.tile-info {
  flex: 1;
}
.tile-info h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
}
.tile-info p {
  font-size: 0.8125rem !important;
  line-height: 1.68 !important;
  color: var(--ink-mid) !important;
  margin: 0 !important;
}
.tile-ext {
  color: var(--ink-soft-2);
  font-size: 0.9375rem;
}
.tile-action-btn {
  align-self: flex-start;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.tile-action-btn:hover {
  background: var(--ink);
  color: var(--paper);
}

/* ══ 格式卡片网格 ═══════════════════════════════ */
.formats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 22px 0;
}
.format-card {
  padding: 20px 22px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--line-faint);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.format-card.primary-revp {
  background: var(--ui-900);
  border-color: var(--ui-600);
  color: var(--ui-text);
}
.format-card.primary-revp .format-name {
  color: #fff;
}
.format-card.primary-revp .format-desc {
  color: var(--ui-text-dim);
}
.format-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.format-badge {
  font-size: 0.6875rem;
  font-family: var(--font-mono);
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.06);
  color: var(--ink-soft-2);
}
.primary-revp .format-badge {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
.format-ext {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--accent);
}
.format-name {
  font-size: 1rem;
  font-weight: 600;
}
.format-desc {
  font-size: 0.8125rem !important;
  line-height: 1.7 !important;
  color: var(--ink-mid);
  margin: 0 !important;
}

/* ══ 工具清单矩阵 ═══════════════════════════════ */
.tool-tags-matrix {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 22px 0;
}
.tool-cat-card {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 14px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cat-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cat-icon {
  font-size: 1.1rem;
}
.cat-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink);
}
.chip-cluster {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.tool-chip {
  font-size: 0.75rem;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.04);
  border: 1px solid var(--line-faint);
  color: var(--ink-soft);
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.tool-chip:hover {
  background: var(--ink);
  color: var(--paper);
  transform: translateY(-1px);
}

/* 特性注释列表 */
.feature-notes {
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
}
.note-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.note-bullet {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.note-item strong {
  font-size: 0.875rem;
  color: var(--ink);
  display: block;
}
.note-item p {
  font-size: 0.8125rem !important;
  color: var(--ink-mid) !important;
  line-height: 1.65 !important;
  margin: 2px 0 0 !important;
}

.styled-points {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}
.styled-points li {
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--ink-soft);
}

/* ══ 反馈指引卡片 ═══════════════════════════════ */
.feedback-spec-card {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 12px;
  padding: 22px 24px;
  margin: 20px 0;
}
.spec-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.spec-icon {
  font-size: 1.1rem;
}
.spec-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
}
.spec-list {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.spec-list li {
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--ink-soft);
}

.action-btn-row {
  margin: 20px 0;
}
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: var(--ink);
  padding: 12px 22px;
  border-radius: 999px;
  text-decoration: none;
  box-shadow: var(--shadow-m);
  transition: transform 0.25s var(--ease-out-expo), background 0.25s, box-shadow 0.25s;
}
.btn-action:hover {
  transform: translateY(-2px);
  background: var(--ink-soft);
  box-shadow: var(--shadow-l);
}

/* ══ 社群横幅卡片 ═══════════════════════════════ */
.community-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--card) 0%, rgba(255, 255, 255, 0.95) 100%);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-s);
  margin-top: 20px;
  flex-wrap: wrap;
}
.community-badge {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--ink-soft-2);
  margin-bottom: 6px;
}
.community-name {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--ink);
}
.community-desc {
  font-size: 0.84375rem !important;
  color: var(--ink-mid) !important;
  margin: 6px 0 12px !important;
}
.community-code-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 22, 26, 0.05);
  padding: 5px 12px;
  border-radius: 6px;
}
.code-label {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
}
.code-num {
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ink);
}
.community-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.btn-banner-action {
  font-family: inherit;
  font-size: 0.84375rem;
  font-weight: 500;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(20, 22, 26, 0.04);
  color: var(--ink);
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.25s, border-color 0.25s;
}
.btn-banner-action:hover {
  background: rgba(20, 22, 26, 0.09);
  border-color: var(--ink);
}
.btn-banner-action.primary {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.btn-banner-action.primary:hover {
  background: var(--ink-soft);
}

/* ══ 页脚 ═══════════════════════════════════════ */
.content-footer {
  border-top: 1px solid var(--line-faint);
  padding-top: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.footer-meta p {
  font-size: 0.8125rem;
  color: var(--ink-soft-2);
  line-height: 1.6;
}
.footer-sub {
  font-size: 0.75rem !important;
}
.footer-links {
  display: flex;
  gap: 18px;
}
.footer-links a {
  font-size: 0.8125rem;
  color: var(--ink-mid);
  transition: color 0.2s;
}
.footer-links a:hover {
  color: var(--ink);
}

/* ══ 回到顶部浮动按钮 ═══════════════════════════ */
.floating-top-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  border: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: var(--shadow-l);
  z-index: 40;
  transition: transform 0.25s var(--ease-out-expo), opacity 0.25s;
}
.floating-top-btn:hover {
  transform: translateY(-2px);
}

/* ══ 高清实机截屏灯箱模态 ═══════════════════════ */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(14, 16, 18, 0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
}
.lightbox-dialog {
  position: relative;
  max-width: 94vw;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: #181a1d;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}
.lightbox-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #1e2126;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.lightbox-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
}
.lightbox-close {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s;
}
.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.25);
}
.lightbox-body {
  overflow: auto;
  max-height: 76vh;
  display: flex;
  justify-content: center;
  background: #121417;
  padding: 12px;
}
.lightbox-body img {
  max-width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 8px;
}
.lightbox-footer {
  padding: 8px 18px;
  background: #181a1d;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}
.lightbox-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s, transform 0.25s var(--ease-out-expo);
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* ══ 响应式适配 ═════════════════════════════════ */
@media (max-width: 1200px) {
  .docs-body {
    grid-template-columns: 240px minmax(0, 1fr);
  }
  .docs-toc {
    display: none;
  }
}

@media (max-width: 960px) {
  .docs-body {
    grid-template-columns: minmax(0, 1fr);
    padding-top: 24px;
  }
  .docs-sidebar {
    position: fixed;
    top: 64px;
    bottom: 0;
    left: 0;
    width: 280px;
    background: var(--paper-warm);
    padding: 24px 20px;
    z-index: 45;
    transform: translateX(-100%);
    transition: transform 0.3s var(--ease-out-expo);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.1);
  }
  .docs-sidebar.is-open {
    transform: translateX(0);
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    top: 64px;
    background: rgba(20, 22, 26, 0.4);
    z-index: 44;
  }
  .mobile-menu-btn {
    display: flex;
  }
  .docs-header-links {
    display: none;
  }
  .roadmap-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 680px) {
  .figure-row,
  .download-cards,
  .resource-tiles,
  .formats-grid,
  .tool-tags-matrix,
  .workflow-steps {
    grid-template-columns: minmax(0, 1fr);
  }
  .docs-search {
    max-width: 160px;
  }
  .search-kbd {
    display: none;
  }
  .community-banner {
    flex-direction: column;
    align-items: stretch;
    padding: 22px 20px;
  }
  .community-right {
    flex-direction: column;
    align-items: stretch;
  }
  .community-right .btn-banner-action {
    width: 100%;
    justify-content: center;
  }
}
</style>
