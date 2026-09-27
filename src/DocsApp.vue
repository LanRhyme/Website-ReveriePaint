<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 导入文档专属高精 WebP 配图
import imgInstallRepo from './assets/docs/doc-install-repo.webp'
import imgInstallRelease from './assets/docs/doc-install-release.webp'
import imgBrushImport from './assets/docs/doc-brush-import.webp'
import imgBrushQq from './assets/docs/doc-brush-qq.webp'
import imgUiSettings from './assets/docs/doc-ui-settings.webp'
import imgUiMain from './assets/docs/doc-ui-main.webp'
import imgUiLeftbar from './assets/docs/doc-ui-leftbar.webp'
import imgLayersPresets from './assets/docs/doc-layers-presets.webp'
import imgFeedbackIssue from './assets/docs/doc-feedback-issue.webp'

// 导航大纲定义
const navSections = [
  {
    group: '快速入门',
    items: [
      { id: 'intro', label: '软件简介与兼容性' },
      { id: 'roadmap', label: '已知待修复与路线图' }
    ]
  },
  {
    group: '安装与部署',
    items: [
      { id: 'install', label: '获取 APK 安装包' },
      { id: 'permissions', label: '安装步骤与系统权限' }
    ]
  },
  {
    group: '笔刷与资源格式',
    items: [
      { id: 'import-brush', label: '导入笔刷预设与 QQ 路径' },
      { id: 'brush-formats', label: 'Krita 笔刷格式原理' },
      { id: 'abr-tips', label: 'Photoshop ABR 笔尖转换' },
      { id: 'brush-resources', label: '笔刷资源获取渠道' },
      { id: 'file-formats', label: '支持的工程与文件格式' }
    ]
  },
  {
    group: '界面与核心工具',
    items: [
      { id: 'ui-overview', label: '主画布界面全局总览' },
      { id: 'ui-toolbar', label: '工具栏滑动与排布定制' },
      { id: 'color-picker', label: '悬浮取色面板与固定' },
      { id: 'ui-scale', label: '界面尺寸与滑块适配' },
      { id: 'tools-list', label: '全量工具清单' }
    ]
  },
  {
    group: '图层与画布规格',
    items: [
      { id: 'layer-specs', label: '图层上限与推荐分辨率' }
    ]
  },
  {
    group: '问题反馈与社群',
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
const copiedMap = ref({})
const lightboxImg = ref(null)

// 复制工具函数
function copyText(key, text) {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
    copiedMap.value[key] = true
    setTimeout(() => {
      copiedMap.value[key] = false
    }, 2000)
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
    const yOffset = -80
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
    activeSectionId.value = id
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 滚动监听
function onScroll() {
  const scrollY = window.pageYOffset
  showBackToTop.value = scrollY > 400

  const allItems = navSections.flatMap((g) => g.items)
  for (let i = allItems.length - 1; i >= 0; i--) {
    const item = allItems[i]
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

// 扁平化过滤大纲
const filteredNav = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return navSections
  return navSections
    .map((group) => {
      const matched = group.items.filter((item) =>
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
    setTimeout(() => scrollToAnchor(hash), 100)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="docs-layout">
    <!-- ── 顶部导航栏 ───────────────────────────────── -->
    <header class="docs-header">
      <div class="docs-header-inner">
        <div class="docs-header-brand">
          <a href="/" class="brand-link" title="返回 ReveriePaint 官网首页">
            <span class="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 22 22" width="20" height="20">
                <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="11" cy="13" r="1.5" fill="currentColor" />
              </svg>
            </span>
            <span class="brand-name">ReveriePaint</span>
          </a>
          <span class="brand-badge">官方文档</span>
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
            placeholder="搜索文档关键字..."
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
          <a href="/" class="header-link">官网首页</a>
          <a href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android" target="_blank" rel="noopener" class="header-link">Mirror酱</a>
          <a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener" class="header-link">GitHub</a>
          <a href="https://qm.qq.com/q/729283213" target="_blank" rel="noopener" class="header-link qq-link">QQ 群</a>
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

    <!-- ── 页面主体 ───────────────────────────────── -->
    <div class="docs-body shell">
      <!-- 移动端遮罩 -->
      <transition name="fade">
        <div
          v-if="mobileMenuOpen"
          class="sidebar-backdrop"
          @click="mobileMenuOpen = false"
        ></div>
      </transition>

      <!-- ── 左侧侧边栏 ───────────────────────────── -->
      <aside class="docs-sidebar" :class="{ 'is-open': mobileMenuOpen }">
        <div class="sidebar-inner">
          <div class="sidebar-header">
            <span class="sidebar-title">目录导航</span>
            <span v-if="searchQuery" class="sidebar-count">
              搜索中
            </span>
          </div>

          <div v-if="filteredNav.length === 0" class="sidebar-empty">
            无匹配条目
          </div>

          <nav class="sidebar-nav" aria-label="文档章节大纲">
            <div v-for="group in filteredNav" :key="group.group" class="nav-group">
              <div class="group-title">{{ group.group }}</div>
              <ul class="group-list">
                <li v-for="item in group.items" :key="item.id">
                  <a
                    :href="`#${item.id}`"
                    class="nav-link"
                    :class="{ 'is-active': activeSectionId === item.id }"
                    @click.prevent="scrollToAnchor(item.id)"
                  >
                    {{ item.label }}
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      <!-- ── 右侧正文区域 ─────────────────────────── -->
      <main class="docs-content">
        <!-- 页面主标题区 -->
        <header class="content-header">
          <p class="eyebrow">REVERIEPAINT USER GUIDE</p>
          <h1 class="h-display">ReveriePaint 官方使用指南</h1>
          <p class="lede">
            基于 Krita 开源核心引擎打造的 Android 原生数字绘画应用，专为平板与手写笔深度优化的专业创作工作流。
          </p>
        </header>

        <!-- ══ 1. 快速入门 ═══════════════════════════ -->
        <section id="intro" class="doc-section">
          <h2 class="section-title">
            <a href="#intro" class="anchor-link">#</a>
            软件简介与系统兼容性
          </h2>
          <p>
            ReveriePaint 继承了 Krita 工业级的图像与物理颜料渲染内核，彻底重构并专为移动触控与手写笔交互定制了轻量直观的 UI 体系，让专业数字插画师在 Android 平板上获得无妥协的桌面级创作能力。
          </p>

          <div class="callout callout-info">
            <div class="callout-icon">ℹ</div>
            <div class="callout-body">
              <strong>系统兼容要求：</strong>
              <p>适用于 Android 7.0 及以上版本设备（API Level 24+，建议 64 位 arm64-v8a 芯片架构以获得完整物理笔刷渲染性能）。</p>
            </div>
          </div>

          <div class="callout callout-warning">
            <div class="callout-icon">⚠</div>
            <div class="callout-body">
              <strong>HarmonyOS 纯血鸿蒙支持说明：</strong>
              <p>目前 4.2 及后续纯血鸿蒙（Next）系统由于运行环境变动支持较差，推荐在标准 Android 或兼容 Android 运行时的平板设备上使用。</p>
            </div>
          </div>
        </section>

        <!-- 路线图与已知问题 -->
        <section id="roadmap" class="doc-section">
          <h2 class="section-title">
            <a href="#roadmap" class="anchor-link">#</a>
            已知待修复与近期路线图
          </h2>
          <p>
            项目处于活跃开发迭代中，开发者正在紧密跟进社区反馈并逐步推进以下重点功能的重构与修复：
          </p>
          <ul class="doc-list">
            <li><strong>液化与对称尺：</strong>近期因手势与视口变换矩阵联动产生偏移，目前正处于底层修复与重新调校阶段，请留意后续版本更新。</li>
            <li><strong>Photoshop .abr 笔刷格式原生支持：</strong>正在推进解析管线，后续将直接支持直接导入 .abr 资源包。</li>
            <li><strong>硬件触控笔深度支持：</strong>持续优化华为 M-Pencil、OPPO / 一加手写笔、三星 S Pen 等低延迟与侧键手势联动。</li>
          </ul>
        </section>

        <!-- ══ 2. 安装与部署 ═════════════════════════ -->
        <section id="install" class="doc-section">
          <h2 class="section-title">
            <a href="#install" class="anchor-link">#</a>
            获取 APK 安装包
          </h2>
          <p>
            建议始终通过官方渠道获取构建版本，确保代码纯净与完整：
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
                <span class="card-title">Mirror酱 高速下载（推荐国内用户）</span>
                <span class="card-desc">无需网络代理加速，国内全节点直连高速分发</span>
              </div>
              <span class="card-badge">国内免梯</span>
            </a>

            <a
              href="https://github.com/LanRhyme/ReveriePaint/releases"
              target="_blank"
              rel="noopener"
              class="download-card"
            >
              <div class="card-icon">🐙</div>
              <div class="card-meta">
                <span class="card-title">GitHub Releases 官方构建</span>
                <span class="card-desc">浏览完整发布更新日志、历史版本与源代码归档</span>
              </div>
              <span class="card-badge">官方发布</span>
            </a>
          </div>

          <div class="figure-group">
            <figure class="doc-figure" @click="openLightbox(imgInstallRepo, 'GitHub 仓库 Releases 入口导航')">
              <img :src="imgInstallRepo" alt="GitHub 仓库 Releases 入口导航" loading="lazy" />
              <figcaption>GitHub 仓库主页右侧 Releases 区域即可获取最新正式版本构建</figcaption>
            </figure>

            <figure class="doc-figure" @click="openLightbox(imgInstallRelease, 'Releases 页面 APK 下载资源位置')">
              <img :src="imgInstallRelease" alt="Releases 页面 APK 下载资源位置" loading="lazy" />
              <figcaption>在版本发布页面底部的 Assets 列表中，点击 ReveriePaint-vX.X.X.apk 即可开始下载</figcaption>
            </figure>
          </div>
        </section>

        <section id="permissions" class="doc-section">
          <h2 class="section-title">
            <a href="#permissions" class="anchor-link">#</a>
            安装步骤与系统权限
          </h2>
          <ol class="doc-steps">
            <li>
              <strong>下载 APK 安装包：</strong>在平板或手机浏览器中打开上述下载页面，获取最新构建的 <code>.apk</code> 安装包。
            </li>
            <li>
              <strong>开启未知来源安装：</strong>在系统弹出的风险提示中选择「允许来自此来源的应用安装」继续安装。
            </li>
            <li>
              <strong>授予存储与手写笔权限：</strong>首次启动时授予存储权限（用于读写 <code>.revp</code> 工程与笔刷资源），若连接有星闪/蓝牙手写笔，请授予蓝牙与位置权限以支持侧键按压与悬空光标识别。
            </li>
          </ol>
        </section>

        <!-- ══ 3. 笔刷与资源格式 ═════════════════════ -->
        <section id="import-brush" class="doc-section">
          <h2 class="section-title">
            <a href="#import-brush" class="anchor-link">#</a>
            导入笔刷预设与 QQ 接收路径
          </h2>
          <p>
            ReveriePaint 具备完整的笔刷管理面板，支持从设备内部存储快速载入官方和社区分享的笔刷预设。
          </p>

          <div class="figure-group">
            <figure class="doc-figure" @click="openLightbox(imgBrushImport, '笔刷面板导入预设流程')">
              <img :src="imgBrushImport" alt="笔刷面板导入预设流程" loading="lazy" />
              <figcaption>点击左侧工具条画笔图标展开「笔刷库」，点击下方「导入」按钮唤起系统文件管理器</figcaption>
            </figure>
          </div>

          <div class="callout callout-tip">
            <div class="callout-icon">💡</div>
            <div class="callout-body">
              <strong>QQ 群内下载的笔刷文件导入技巧：</strong>
              <p>
                从 QQ 创作者交流群中下载群文件后，由于 Android 系统沙盒限制，文件默认保存在 QQ 专属目录：
              </p>
              <div class="copy-box">
                <code>/storage/emulated/0/Android/data/com.tencent.mobileqq/Tencent/QQfile_recv/</code>
                <button
                  type="button"
                  class="btn-copy-code"
                  @click="copyText('qqpath', '/storage/emulated/0/Android/data/com.tencent.mobileqq/Tencent/QQfile_recv/')"
                >
                  {{ copiedMap['qqpath'] ? '已复制路径' : '复制路径' }}
                </button>
              </div>
              <p>
                <strong>更便捷的方法：</strong>在手机/平板 QQ 中点击下载文件右侧的 <code>···</code> 菜单，选择「保存到手机」或「另存为」到「下载 (Download)」等公开目录，导入时便可直达。
              </p>
            </div>
          </div>

          <figure class="doc-figure single-fig" @click="openLightbox(imgBrushQq, 'QQ 文件另存为选项')">
            <img :src="imgBrushQq" alt="QQ 文件另存为选项" loading="lazy" />
            <figcaption>在 QQ 文件卡片右侧菜单选择「另存为」至更好找的本地位置</figcaption>
          </figure>
        </section>

        <section id="brush-formats" class="doc-section">
          <h2 class="section-title">
            <a href="#brush-formats" class="anchor-link">#</a>
            Krita 原生笔刷格式原理
          </h2>
          <p>
            ReveriePaint 完整复用 Krita 核心渲染器，因此完美原生兼容 Krita 体系的所有笔刷规范：
          </p>
          <div class="specs-table-wrapper">
            <table class="specs-table">
              <thead>
                <tr>
                  <th>格式扩展名</th>
                  <th>类型说明</th>
                  <th>内含数据与特性</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>.kpp</code></td>
                  <td>Krita Paintop Preset</td>
                  <td>包含笔尖形状、动态阻尼、压感曲线、颜料混合比率及预览缩略图</td>
                </tr>
                <tr>
                  <td><code>.bundle</code></td>
                  <td>Krita 资源包合辑</td>
                  <td>打包归档的多组笔刷预设、笔尖图案（Gbr）、纸质材质纹理（Pat）及色彩配置文件</td>
                </tr>
                <tr>
                  <td><code>.myb</code></td>
                  <td>MyPaint 笔刷预设</td>
                  <td>基于 MyPaint 笔刷引擎的传统手绘纹理预设</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="abr-tips" class="doc-section">
          <h2 class="section-title">
            <a href="#abr-tips" class="anchor-link">#</a>
            Photoshop ABR 格式说明与笔尖转换技巧
          </h2>
          <p>
            <code>.abr</code>（Adobe Photoshop Brush）为 Adobe 专属二进制画笔文件，目前暂未原生支持直接导入。然而，你可以通过<strong>笔尖图案提取法</strong>将任意 PS 笔刷导入 ReveriePaint：
          </p>
          <div class="doc-card-guide">
            <div class="step-badge">转换工作流</div>
            <ol class="guide-steps">
              <li>通过外部工具（或 Photoshop）将 <code>.abr</code> 中的笔尖印记图案导出并保存为透明背景的 <code>.png</code> 图片。</li>
              <li>在 ReveriePaint 中打开笔刷面板，点击 <strong>新建笔刷</strong>。</li>
              <li>进入 <strong>笔刷设置 ＞ 高级工坊 ＞ 笔尖形状</strong>，点击「导入自定义」并选择保存的 <code>.png</code> 笔尖图案。</li>
              <li>微调间距（Spacing）、抖动翻转与压感映射后，点击保存，即可完整归档至个人专属笔刷库。</li>
            </ol>
          </div>
        </section>

        <section id="brush-resources" class="doc-section">
          <h2 class="section-title">
            <a href="#brush-resources" class="anchor-link">#</a>
            笔刷资源获取渠道
          </h2>
          <p>
            全球画师社群为 Krita 产出了数以千计的免费笔刷包，可直接在平板上下载后导入：
          </p>
          <ul class="doc-list">
            <li>
              <strong>Krita 官方论坛资源专区：</strong>访问
              <a href="https://krita-artists.org/c/resources/brushes-and-bundles/32" target="_blank" rel="noopener">Krita Artists Resources</a>
              可获取大量高质量水彩、厚涂、漫画勾线、铅笔素描与概念材质笔刷包。
            </li>
            <li>
              <strong>ReveriePaint 创作者交流群：</strong>官方群文件中不定期精选归档多套开箱即用的优质笔刷合辑（群号 <code>729283213</code>）。
            </li>
          </ul>
        </section>

        <section id="file-formats" class="doc-section">
          <h2 class="section-title">
            <a href="#file-formats" class="anchor-link">#</a>
            支持的工程与文件格式
          </h2>
          <p>
            ReveriePaint 坚持数据完全开放与非私有捆绑，深度适配跨设备与跨软件流通：
          </p>
          <ul class="doc-list">
            <li><strong>.revp：</strong>自研原生工程文件，打包画作图层树、混合模式参数以及<strong>全流程笔迹延时事件流</strong>，方便随时拖动进度条回放绘制过程。</li>
            <li><strong>.kra：</strong>Krita 原生工程文件，支持无损互相导入导出图层。</li>
            <li><strong>.psd：</strong>Photoshop 分层文件，保持图层顺序、不透明度与混合模式对应关系。</li>
            <li><strong>PNG / JPG / WebP：</strong>支持多档位品质与无损 Alpha 通道平片导出。</li>
          </ul>
        </section>

        <!-- ══ 4. 界面与核心工具 ═════════════════════ -->
        <section id="ui-overview" class="doc-section">
          <h2 class="section-title">
            <a href="#ui-overview" class="anchor-link">#</a>
            主画布界面全局总览
          </h2>
          <p>
            界面以沉浸式画布为核心，所有浮动面板均采用高斯模糊与非阻挡层级设计：
          </p>

          <figure class="doc-figure" @click="openLightbox(imgUiMain, 'ReveriePaint 平板主画布界面全局说明')">
            <img :src="imgUiMain" alt="ReveriePaint 平板主画布界面全局说明" loading="lazy" />
            <figcaption>主界面各功能区分布：左侧工具栏、快捷滑块、顶部系统控制、图层与滤镜浮窗、悬浮色轮</figcaption>
          </figure>
        </section>

        <section id="ui-toolbar" class="doc-section">
          <h2 class="section-title">
            <a href="#ui-toolbar" class="anchor-link">#</a>
            工具栏滑动与排布定制
          </h2>
          <p>
            左侧工具栏专为双手握持平板的拇指操作优化，支持随心定制：
          </p>

          <div class="figure-group">
            <figure class="doc-figure" @click="openLightbox(imgUiLeftbar, '左侧菜单栏操作秘笈')">
              <img :src="imgUiLeftbar" alt="左侧菜单栏操作秘笈" loading="lazy" />
              <figcaption>左侧工具栏支持上下滑动浏览全部工具，点击底部展开按钮可自由重排常用位置</figcaption>
            </figure>
          </div>
          <ul class="doc-list">
            <li><strong>上下滑动浏览：</strong>当左侧工具数量较多时，直接在工具栏区域上下滑即可快速翻动。</li>
            <li><strong>工具栏拖曳排布：</strong>点击底部编辑按钮进入排布模式，长按即可调整工具位的先后顺序。</li>
            <li><strong>侧边滑块联动：</strong>左侧常驻画笔大小（Size）与画笔不透明度（Opacity）双滑块，支持在主题设置中自由调整长短与敏感度。</li>
          </ul>
        </section>

        <section id="color-picker" class="doc-section">
          <h2 class="section-title">
            <a href="#color-picker" class="anchor-link">#</a>
            悬浮取色面板与固定技巧
          </h2>
          <p>
            告别传统绘画软件繁琐的弹窗打断，ReveriePaint 引入轻量级微浮层取色面板：
          </p>
          <ul class="doc-list">
            <li><strong>按住顶栏自由拖曳：</strong>按住取色面板顶部的抓手手柄，可将其移动到画布任意顺手位置。</li>
            <li><strong>图钉钉住状态（Pin）：</strong>点击色轮左上角的「图钉」图标，取色板将常驻画布不随点击外部而关闭，边画边调色极其高效。</li>
            <li><strong>五合一取色工作坊：</strong>面板底部支持一键切换「SAI 经典色轮」、「方块取色」、「色彩调和助手」、「3D 光影受光球」、「智能色卡」与「精确数值滑块」。</li>
          </ul>
        </section>

        <section id="ui-scale" class="doc-section">
          <h2 class="section-title">
            <a href="#ui-scale" class="anchor-link">#</a>
            界面尺寸与滑块适配
          </h2>
          <p>
            不同尺寸的平板（8.8 英寸掌机到 14 英寸大平板）需要不同的触控目标间距。通过「设置 ＞ 主题设置」可随时按需缩放：
          </p>

          <figure class="doc-figure" @click="openLightbox(imgUiSettings, '主题设置与界面尺寸滑块长度调节')">
            <img :src="imgUiSettings" alt="主题设置与界面尺寸滑块长度调节" loading="lazy" />
            <figcaption>进入设置 ＞ 偏好与硬件 ＞ 主题设置，可微调绘画界面整体缩放比例与侧边滑块长度</figcaption>
          </figure>
        </section>

        <section id="tools-list" class="doc-section">
          <h2 class="section-title">
            <a href="#tools-list" class="anchor-link">#</a>
            全量工具清单一览表
          </h2>
          <p>
            目前版本内置完整覆盖专业插画全链路的工具矩阵：
          </p>

          <div class="tool-tags-matrix">
            <div class="tool-category">
              <span class="cat-name">基础绘画</span>
              <div class="tag-chips">
                <span class="chip">画笔</span>
                <span class="chip">橡皮擦</span>
                <span class="chip">物理混合涂抹</span>
                <span class="chip">油漆桶填充</span>
                <span class="chip">多色渐变</span>
              </div>
            </div>

            <div class="tool-category">
              <span class="cat-name">选区系统</span>
              <div class="tag-chips">
                <span class="chip">折线套索选择</span>
                <span class="chip">矩形选择</span>
                <span class="chip">椭圆选择</span>
                <span class="chip">多边形选择</span>
                <span class="chip">连续自动选择 (魔棒)</span>
                <span class="chip">相似色彩选择</span>
              </div>
            </div>

            <div class="tool-category">
              <span class="cat-name">几何矢量与形状</span>
              <div class="tag-chips">
                <span class="chip">直线</span>
                <span class="chip">矩形</span>
                <span class="chip">椭圆</span>
                <span class="chip">多边形</span>
                <span class="chip">多段折线</span>
                <span class="chip">贝塞尔矢量路径</span>
              </div>
            </div>

            <div class="tool-category">
              <span class="cat-name">画幅变换与参考</span>
              <div class="tag-chips">
                <span class="chip">自由移动</span>
                <span class="chip">无损裁剪</span>
                <span class="chip">画布水平/垂直翻转</span>
                <span class="chip">双模式悬浮参考窗</span>
                <span class="chip">对称尺 (优化中)</span>
                <span class="chip">透视网格尺</span>
                <span class="chip">液化 (优化中)</span>
                <span class="chip">矢量文本</span>
                <span class="chip">像素标尺测量</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ══ 5. 图层与画布规格 ═════════════════════ -->
        <section id="layer-specs" class="doc-section">
          <h2 class="section-title">
            <a href="#layer-specs" class="anchor-link">#</a>
            图层上限与推荐分辨率
          </h2>
          <p>
            ReveriePaint <strong>没有硬性设定最高图层数量上限</strong>，而是依托动态稀疏瓦片内存管理（Sparse Tile Engine），根据设备的可用运行内存（RAM）动态计算：
          </p>

          <figure class="doc-figure" @click="openLightbox(imgLayersPresets, '新建画布面板与推荐图层数')">
            <img :src="imgLayersPresets" alt="新建画布面板与推荐图层数" loading="lazy" />
            <figcaption>创建画布时，系统会基于当前设备可用内存实时标出各分辨率推荐的最大安全图层数</figcaption>
          </figure>

          <div class="specs-table-wrapper">
            <table class="specs-table">
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
                  <td>230 ~ 260+ 层</td>
                  <td>完美铺满当前设备物理屏幕，轻盈顺畅</td>
                </tr>
                <tr>
                  <td><strong>正方形 2K</strong></td>
                  <td>2048 × 2048 · 300 PPI</td>
                  <td>250 ~ 280+ 层</td>
                  <td>社交网络头像、插画与贴图常用规格</td>
                </tr>
                <tr>
                  <td><strong>正方形 4K</strong></td>
                  <td>4096 × 4096 · 300 PPI</td>
                  <td>60 ~ 80+ 层</td>
                  <td>超高清印刷级精细绘制与高细节输出</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ══ 6. 问题反馈与社群 ═════════════════════ -->
        <section id="feedback" class="doc-section">
          <h2 class="section-title">
            <a href="#feedback" class="anchor-link">#</a>
            Bug 反馈与 GitHub 规范
          </h2>
          <p>
            若在创作过程中偶遇异常或崩溃，强烈建议前往 GitHub 提交 Issue：
          </p>

          <figure class="doc-figure single-fig" @click="openLightbox(imgFeedbackIssue, '开发者关于反馈的温馨提示')">
            <img :src="imgFeedbackIssue" alt="开发者关于反馈的温馨提示" loading="lazy" />
            <figcaption>群聊消息容易被刷屏冲淡，在 GitHub Issues 提交问题能够长效跟踪并被优先修复</figcaption>
          </figure>

          <div class="callout callout-info">
            <div class="callout-icon">📋</div>
            <div class="callout-body">
              <strong>反馈规范小贴士（帮助开发者光速定位）：</strong>
              <ul class="doc-list" style="margin-top: 6px;">
                <li><strong>设备信息：</strong>请标明平板/手机品牌与具体型号（例如：华为 MatePad Pro 13.2 / 小米平板 6 Pro / 三星 Tab S9）。</li>
                <li><strong>系统与软件版本：</strong>标注 Android 系统版本及 ReveriePaint 具体版本号（例如：v1.3.3）。</li>
                <li><strong>复现步骤：</strong>尽可能简要列出触发异常的连续步骤（例：打开套索 ＞ 点击闭合 ＞ 撤销时界面假死）。</li>
                <li><strong>录屏或截图：</strong>如有偶发复现情况，录制简短屏幕视频是最高效的定位手段。</li>
              </ul>
            </div>
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
            <a href="#community" class="anchor-link">#</a>
            创作者交流社群
          </h2>
          <p>
            欢迎加入 ReveriePaint 官方交流社群，与全国数千名画师同好交流平板绘画心得、分享自制笔刷并获取最新内测构建：
          </p>

          <div class="community-box">
            <div class="community-info">
              <span class="community-title">ReveriePaint 创作者交流群</span>
              <span class="community-code">群号：729283213</span>
            </div>
            <div class="community-actions">
              <button
                type="button"
                class="btn-action"
                @click="copyText('qqgroup', '729283213')"
              >
                {{ copiedMap['qqgroup'] ? '已复制群号 729283213' : '复制群号: 729283213' }}
              </button>
              <a
                href="https://qm.qq.com/q/729283213"
                target="_blank"
                rel="noopener"
                class="btn-action primary"
              >
                一键唤起 QQ 加群
              </a>
            </div>
          </div>
        </section>

        <!-- 页脚版权与链接 -->
        <footer class="content-footer">
          <div class="footer-meta">
            <p>© {{ new Date().getFullYear() }} LanRhyme · 基于 GPL-3.0 协议开源</p>
            <p>Krita 为其各自所有者的商标，本项目与 KDE 无隶属关系</p>
          </div>
          <div class="footer-links">
            <a href="/">返回官网首页</a>
            <a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener">GitHub 仓库</a>
            <a href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android" target="_blank" rel="noopener">Mirror酱</a>
          </div>
        </footer>
      </main>
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

    <!-- ── 图片灯箱模态弹窗 ───────────────────────── -->
    <transition name="lightbox">
      <div
        v-if="lightboxImg"
        class="lightbox-overlay"
        @click="closeLightbox"
      >
        <div class="lightbox-dialog" @click.stop>
          <button
            type="button"
            class="lightbox-close"
            aria-label="关闭灯箱"
            @click="closeLightbox"
          >
            ×
          </button>
          <img :src="lightboxImg.src" :alt="lightboxImg.caption" />
          <p class="lightbox-caption">{{ lightboxImg.caption }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ══ 整体布局 ═══════════════════════════════════ */
.docs-layout {
  min-height: 100vh;
  background-color: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
}

/* ══ 顶部导航栏 ═════════════════════════════════ */
.docs-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(245, 242, 236, 0.88);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border-bottom: 1px solid var(--line-faint);
  height: 64px;
}
.docs-header-inner {
  max-width: var(--shell);
  height: 100%;
  margin-inline: auto;
  padding-inline: var(--gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.docs-header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.brand-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1.0625rem;
  letter-spacing: -0.015em;
  color: var(--ink);
}
.brand-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: var(--ink);
  color: var(--paper);
}
.brand-badge {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--ink-soft-2);
  background: rgba(20, 22, 26, 0.06);
  padding: 2px 7px;
  border-radius: 999px;
}

/* 搜索栏 */
.docs-search {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 320px;
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
  padding: 0 52px 0 34px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.6);
  font-family: inherit;
  font-size: 0.84375rem;
  color: var(--ink);
  outline: none;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
}
.search-input:focus {
  background: #fff;
  border-color: var(--ink);
  box-shadow: 0 2px 8px rgba(20, 22, 26, 0.06);
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

/* 外部链接 */
.docs-header-links {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-link {
  font-size: 0.84375rem;
  color: var(--ink-mid);
  transition: color 0.2s;
}
.header-link:hover {
  color: var(--ink);
}
.header-link.qq-link {
  color: var(--ink);
  font-weight: 500;
}

/* 移动端汉堡 */
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

/* ══ 主体网格 ═══════════════════════════════════ */
.docs-body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: clamp(32px, 5vw, 64px);
  padding-top: 36px;
  padding-bottom: 80px;
  align-items: start;
}

/* ── 左侧侧边栏 ───────────────────────────────── */
.docs-sidebar {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  scrollbar-width: thin;
  padding-right: 12px;
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
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-faint);
}
.sidebar-title {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft-2);
}
.sidebar-count {
  font-size: 0.75rem;
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
}
.group-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-link {
  display: block;
  font-size: 0.8125rem;
  color: var(--ink-mid);
  padding: 6px 10px;
  border-radius: 6px;
  line-height: 1.45;
  transition: background 0.2s, color 0.2s, transform 0.2s;
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

/* ── 右侧正文 ─────────────────────────────────── */
.docs-content {
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.content-header {
  border-bottom: 1px solid var(--line-faint);
  padding-bottom: 32px;
}
.content-header .h-display {
  font-size: clamp(1.85rem, 3.8vw, 2.6rem);
  line-height: 1.2;
  margin-top: 10px;
  letter-spacing: -0.025em;
}
.content-header .lede {
  margin-top: 14px;
}

/* 章节 */
.doc-section {
  scroll-margin-top: 88px;
}
.section-title {
  font-size: clamp(1.35rem, 2.4vw, 1.7rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}
.anchor-link {
  color: var(--ink-ghost);
  font-family: var(--font-mono);
  font-size: 0.9em;
  opacity: 0.4;
  transition: opacity 0.2s;
  text-decoration: none;
}
.section-title:hover .anchor-link {
  opacity: 1;
}

.doc-section p {
  font-size: 0.9375rem;
  line-height: 1.82;
  color: var(--ink-soft);
  margin-bottom: 16px;
}
.doc-section p:last-child {
  margin-bottom: 0;
}

/* 步骤与列表 */
.doc-steps {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}
.doc-steps li {
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--ink-soft);
}

.doc-list {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0;
}
.doc-list li {
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--ink-soft);
}

/* 提示与警告框 */
.callout {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 10px;
  margin: 18px 0;
  font-size: 0.875rem;
  line-height: 1.72;
}
.callout-icon {
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}
.callout-body {
  flex: 1;
}
.callout-body p {
  font-size: 0.875rem !important;
  line-height: 1.72 !important;
  margin-top: 4px;
}
.callout-info {
  background: rgba(91, 127, 199, 0.08);
  border: 1px solid rgba(91, 127, 199, 0.24);
  color: var(--ink);
}
.callout-warning {
  background: rgba(195, 163, 158, 0.16);
  border: 1px solid rgba(195, 163, 158, 0.38);
  color: var(--ink);
}
.callout-tip {
  background: rgba(157, 169, 142, 0.14);
  border: 1px solid rgba(157, 169, 142, 0.32);
  color: var(--ink);
}

/* 路径复制代码块 */
.copy-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: rgba(20, 22, 26, 0.06);
  padding: 8px 12px;
  border-radius: 8px;
  margin: 8px 0;
  overflow-x: auto;
}
.copy-box code {
  font-family: var(--font-mono);
  font-size: 0.78125rem;
  color: var(--ink);
  word-break: break-all;
}
.btn-copy-code {
  flex-shrink: 0;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  border: 0;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-copy-code:hover {
  opacity: 0.88;
}

/* 下载卡片 */
.download-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 20px 0;
}
.download-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--line-faint);
  transition: transform 0.25s var(--ease-out-expo), box-shadow 0.25s, border-color 0.25s;
}
.download-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-m);
  border-color: var(--line);
}
.download-card.highlight {
  background: var(--ui-900);
  color: var(--ui-text);
  border-color: var(--ui-600);
}
.download-card.highlight .card-title {
  color: #fff;
}
.download-card.highlight .card-desc {
  color: var(--ui-text-dim);
}
.download-card.highlight .card-badge {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
.card-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}
.card-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
}
.card-desc {
  font-size: 0.78125rem;
  color: var(--ink-mid);
}
.card-badge {
  font-size: 0.6875rem;
  font-family: var(--font-mono);
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.06);
  color: var(--ink-soft-2);
}

/* 插图排版 */
.figure-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.doc-figure {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--ui-900);
  border: 1px solid var(--line-faint);
  box-shadow: var(--shadow-s);
  cursor: zoom-in;
  transition: transform 0.3s var(--ease-out-expo), box-shadow 0.3s;
}
.doc-figure:hover {
  transform: scale(1.01);
  box-shadow: var(--shadow-m);
}
.doc-figure img {
  width: 100%;
  height: auto;
  display: block;
  background: #111;
}
.doc-figure figcaption {
  padding: 10px 14px;
  background: var(--card);
  font-size: 0.78125rem;
  color: var(--ink-mid);
  line-height: 1.5;
  border-top: 1px solid var(--line-faint);
}
.doc-figure.single-fig {
  margin: 20px 0;
  max-width: 520px;
}

/* 规格表格 */
.specs-table-wrapper {
  overflow-x: auto;
  margin: 18px 0;
  border: 1px solid var(--line-faint);
  border-radius: 10px;
  background: var(--card);
}
.specs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84375rem;
  text-align: left;
}
.specs-table th {
  background: rgba(20, 22, 26, 0.03);
  padding: 12px 16px;
  font-weight: 600;
  color: var(--ink);
  border-bottom: 1px solid var(--line-faint);
}
.specs-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--line-faint);
  color: var(--ink-soft);
  line-height: 1.6;
}
.specs-table tr:last-child td {
  border-bottom: 0;
}

/* ABR 转换指引卡片 */
.doc-card-guide {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 12px;
  padding: 22px 24px;
  margin: 18px 0;
}
.step-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  margin-bottom: 14px;
}
.guide-steps {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.guide-steps li {
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--ink-soft);
}

/* 工具矩阵 */
.tool-tags-matrix {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.tool-category {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cat-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.02em;
}
.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.chip {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.05);
  border: 1px solid var(--line-faint);
  color: var(--ink-soft);
}

/* 按钮行 */
.action-btn-row {
  margin: 18px 0;
}
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-size: 0.84375rem;
  font-weight: 500;
  color: var(--ink);
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.06);
  border: 1px solid var(--line);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.25s, border-color 0.25s;
}
.btn-action:hover {
  background: rgba(20, 22, 26, 0.1);
  border-color: var(--ink);
}
.btn-action.primary {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.btn-action.primary:hover {
  background: var(--ink-soft);
}

/* 社群大卡片 */
.community-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 14px;
  background: var(--card);
  border: 1px solid var(--line-faint);
  margin-top: 18px;
  flex-wrap: wrap;
}
.community-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.community-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--ink);
}
.community-code {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--ink-mid);
}
.community-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* 页脚 */
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
  font-size: 0.75rem;
  color: var(--ink-soft-2);
  line-height: 1.6;
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

/* 回到顶部 */
.floating-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
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

/* 灯箱模态 */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(20, 22, 26, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
}
.lightbox-dialog {
  position: relative;
  max-width: 96vw;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.lightbox-dialog img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
}
.lightbox-caption {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}
.lightbox-close {
  position: absolute;
  top: -42px;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s;
}
.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.35);
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
}

@media (max-width: 680px) {
  .figure-group,
  .download-cards,
  .tool-tags-matrix {
    grid-template-columns: minmax(0, 1fr);
  }
  .docs-search {
    max-width: 180px;
  }
  .search-kbd {
    display: none;
  }
  .community-box {
    flex-direction: column;
    align-items: stretch;
  }
  .community-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .community-actions .btn-action {
    width: 100%;
    justify-content: center;
  }
}
</style>
