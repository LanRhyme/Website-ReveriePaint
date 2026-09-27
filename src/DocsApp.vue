<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 配图
import imgInstallRepo from './assets/docs/doc-install-repo.webp'
import imgInstallRelease from './assets/docs/doc-install-release.webp'
import imgBrushImport from './assets/docs/doc-brush-import.webp'
import imgBrushQq from './assets/docs/doc-brush-qq.webp'
import imgUiSettings from './assets/docs/doc-ui-settings.webp'
import imgUiMain from './assets/docs/doc-ui-main.webp'
import imgUiLeftbar from './assets/docs/doc-ui-leftbar.webp'
import imgLayersPresets from './assets/docs/doc-layers-presets.webp'
import imgFeedbackIssue from './assets/docs/doc-feedback-issue.webp'

// 章节大纲
const navSections = [
  {
    group: '快速入门',
    items: [
      { id: 'intro', label: '软件简介与兼容性' },
      { id: 'roadmap', label: '已知待修复内容' }
    ]
  },
  {
    group: '安装与权限',
    items: [
      { id: 'install', label: '下载安装包' },
      { id: 'permissions', label: '安装与权限' }
    ]
  },
  {
    group: '笔刷与格式',
    items: [
      { id: 'import-brush', label: '导入笔刷与 QQ 存储' },
      { id: 'brush-formats', label: '支持的笔刷格式' },
      { id: 'abr-tips', label: 'PS .abr 笔刷转换' },
      { id: 'file-formats', label: '工程与文件格式' }
    ]
  },
  {
    group: '界面与工具',
    items: [
      { id: 'ui-overview', label: '主界面总览' },
      { id: 'ui-toolbar', label: '工具栏滑动与排布' },
      { id: 'color-picker', label: '悬浮取色与固定' },
      { id: 'ui-scale', label: '界面尺寸与滑块调节' },
      { id: 'tools-list', label: '支持的工具清单' }
    ]
  },
  {
    group: '图层与规格',
    items: [
      { id: 'layer-specs', label: '图层数量与推荐规格' }
    ]
  },
  {
    group: '问题反馈',
    items: [
      { id: 'feedback', label: '反馈 Bug 规范' },
      { id: 'community', label: '创作者交流群' }
    ]
  }
]

const searchQuery = ref('')
const activeSectionId = ref('intro')
const mobileMenuOpen = ref(false)
const showBackToTop = ref(false)
const scrollProgress = ref(0)
const copiedMap = ref({})
const lightboxImg = ref(null)

const allItems = computed(() => navSections.flatMap((g) => g.items))

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
    const yOffset = -76
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
    activeSectionId.value = id
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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
    <!-- 顶部极细阅读进度线 -->
    <div class="scroll-progress-line" :style="{ width: `${scrollProgress}%` }"></div>

    <!-- 顶部导航 -->
    <header class="docs-header">
      <div class="header-inner shell">
        <div class="header-left">
          <a href="/" class="brand-link">
            <svg class="brand-svg" viewBox="0 0 22 22" width="20" height="20" aria-hidden="true">
              <rect x="1" y="1" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
              <path d="M6.4 15.6 L11 6.4 L15.6 15.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="11" cy="13" r="1.5" fill="currentColor" />
            </svg>
            <span class="brand-name">ReveriePaint</span>
          </a>
          <span class="brand-sub">使用指南</span>
        </div>

        <div class="header-center">
          <div class="search-box">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.3" />
              <path d="M10 10 L14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              class="search-input"
              placeholder="搜索文档..."
              aria-label="搜索文档"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="search-clear"
              @click="searchQuery = ''"
            >×</button>
          </div>
        </div>

        <div class="header-right">
          <a href="/" class="nav-text-link">官网首页</a>
          <a href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android" target="_blank" rel="noopener" class="nav-text-link">下载</a>
          <a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener" class="nav-text-link">GitHub</a>
          <button
            class="mobile-menu-btn"
            type="button"
            :aria-expanded="mobileMenuOpen"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            目录
          </button>
        </div>
      </div>
    </header>

    <!-- 主体：经典简洁双栏 -->
    <div class="docs-container shell">
      <transition name="fade">
        <div v-if="mobileMenuOpen" class="sidebar-backdrop" @click="mobileMenuOpen = false"></div>
      </transition>

      <!-- 侧边栏 -->
      <aside class="docs-sidebar" :class="{ 'is-open': mobileMenuOpen }">
        <nav class="sidebar-nav">
          <div v-for="group in filteredNav" :key="group.group" class="nav-group">
            <div class="group-title">{{ group.group }}</div>
            <ul class="group-list">
              <li v-for="item in group.items" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="nav-item"
                  :class="{ active: activeSectionId === item.id }"
                  @click.prevent="scrollToAnchor(item.id)"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- 正文阅读区 -->
      <main class="docs-main">
        <header class="doc-lead-header">
          <p class="eyebrow">USER GUIDE</p>
          <h1 class="doc-title">ReveriePaint 使用指南</h1>
          <p class="doc-desc">
            ReveriePaint 是基于 Krita 核心引擎的 Android 原生数字绘画应用，专为平板与手写笔优化的绘画软件。
          </p>
        </header>

        <!-- 1. 快速入门 -->
        <section id="intro" class="doc-section">
          <h2>
            <a href="#intro" class="anchor">#</a>
            软件简介与系统兼容性
          </h2>
          <p>
            ReveriePaint 继承 Krita 核心图像渲染内核，专为移动触控与手写笔交互打造。
          </p>

          <div class="note-box">
            <p><strong>系统要求：</strong>适用于 Android 7.0 及以上版本（API Level 23+）。建议使用 64 位芯片架构设备以保证渲染效能。</p>
          </div>

          <div class="note-box warning">
            <p><strong>系统兼容提示：</strong>4.2 版本后的纯血鸿蒙系统支持较差，推荐在标准 Android 设备上使用。</p>
          </div>
        </section>

        <section id="roadmap" class="doc-section">
          <h2>
            <a href="#roadmap" class="anchor">#</a>
            目前已知的待优化内容
          </h2>
          <ul class="bullet-list">
            <li><strong>液化与对称尺：</strong>正在修复中，请耐心等待后续版本更新。</li>
            <li><strong>Photoshop 笔刷支持：</strong>后续将支持直接导入 PS 的 <code>.abr</code> 笔刷格式。</li>
          </ul>
        </section>

        <!-- 2. 安装与权限 -->
        <section id="install" class="doc-section">
          <h2>
            <a href="#install" class="anchor">#</a>
            下载最新版本的 APK 安装包
          </h2>
          <p>请通过官方通道获取最新安装包：</p>

          <div class="link-pills">
            <a
              href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android"
              target="_blank"
              rel="noopener"
              class="download-pill primary"
            >
              Mirror酱 高速下载（国内免梯推荐） →
            </a>
            <a
              href="https://github.com/LanRhyme/ReveriePaint/releases"
              target="_blank"
              rel="noopener"
              class="download-pill"
            >
              GitHub Releases 官方发布 →
            </a>
          </div>

          <div class="image-showcase">
            <figure class="clean-figure" @click="openLightbox(imgInstallRepo, 'GitHub 仓库主页 Releases 入口')">
              <img :src="imgInstallRepo" alt="GitHub 仓库主页 Releases 入口" loading="lazy" />
              <figcaption>GitHub 仓库主页右侧 Releases 区域获取最新构建</figcaption>
            </figure>

            <figure class="clean-figure" @click="openLightbox(imgInstallRelease, 'Releases 页面 APK 下载资源')">
              <img :src="imgInstallRelease" alt="Releases 页面 APK 下载资源" loading="lazy" />
              <figcaption>打开版本链接后，在 Assets 中点击下载 .apk 文件</figcaption>
            </figure>
          </div>
        </section>

        <section id="permissions" class="doc-section">
          <h2>
            <a href="#permissions" class="anchor">#</a>
            安装步骤与权限
          </h2>
          <ol class="ordered-list">
            <li>在平板或手机上点击下载完成的 APK 文件，允许「安装来自此来源的应用」。</li>
            <li>首次启动授予存储权限（用于读取笔刷与保存画作）。</li>
            <li>授予手写笔相关蓝牙与外设权限后即可开启创作。</li>
          </ol>
        </section>

        <!-- 3. 笔刷与格式 -->
        <section id="import-brush" class="doc-section">
          <h2>
            <a href="#import-brush" class="anchor">#</a>
            导入笔刷
          </h2>
          <p>
            在笔刷面板中点击「导入」按钮，调起系统文件管理器后即可选择笔刷预设导入。
          </p>
          <p class="sub-hint">注：分享导入目前支持图片和工程文件。</p>

          <figure class="clean-figure" style="max-width: 520px;" @click="openLightbox(imgBrushImport, '笔刷面板导入预设流程')">
            <img :src="imgBrushImport" alt="笔刷面板导入预设流程" loading="lazy" />
            <figcaption>点击左侧画笔展开笔刷库，点击底部的「导入」按钮</figcaption>
          </figure>

          <div class="note-box">
            <p><strong>QQ 群内下载的群文件存储路径：</strong></p>
            <div class="path-row">
              <code>/storage/emulated/0/Android/data/com.tencent.mobileqq/Tencent/QQfile_recv/</code>
              <button
                type="button"
                class="btn-copy-path"
                @click="copyText('path', '/storage/emulated/0/Android/data/com.tencent.mobileqq/Tencent/QQfile_recv/')"
              >
                {{ copiedMap['path'] ? '已复制' : '复制路径' }}
              </button>
            </div>
            <p style="margin-top: 8px;">
              更简单的方法：在 QQ 内点击文件右侧的三个点，选择「保存到手机」选项，将文件另存为至更好找的位置。
            </p>
          </div>

          <figure class="clean-figure" style="max-width: 440px;" @click="openLightbox(imgBrushQq, 'QQ 文件另存为选项')">
            <img :src="imgBrushQq" alt="QQ 文件另存为选项" loading="lazy" />
            <figcaption>在 QQ 文件卡片右侧菜单选择另存为</figcaption>
          </figure>
        </section>

        <section id="brush-formats" class="doc-section">
          <h2>
            <a href="#brush-formats" class="anchor">#</a>
            支持的笔刷格式
          </h2>
          <p>
            与 Krita 相同，原生支援 <code>.kpp</code> 与 <code>.bundle</code> 格式。
          </p>
          <p>
            Krita 的笔刷预设记录了笔刷的预览图、笔刷引擎、笔刷选项参数、笔尖图像、材质图案（如果可用）等数据。原生笔刷预设文件为 <code>.kpp</code> 格式，MyPaint 引擎笔刷预设文件为 <code>.myb</code> 格式。
          </p>
          <p>
            笔刷获取推荐：可在 Krita 官方论坛的 Resources 板块浏览与下载免费开源笔刷包。
          </p>
        </section>

        <section id="abr-tips" class="doc-section">
          <h2>
            <a href="#abr-tips" class="anchor">#</a>
            Photoshop ABR 笔刷格式说明
          </h2>
          <p>
            目前暂不原生支持 <code>.abr</code> 格式（后续版本将会支持），但依旧可以导入 <code>.abr</code> 的笔尖图案：
          </p>
          <ol class="ordered-list">
            <li>将 <code>.abr</code> 笔刷的笔尖图案提取并转存为透明背景的 <code>.png</code> 图片。</li>
            <li>在 ReveriePaint 中点击新建笔刷。</li>
            <li>进入 <strong>笔刷设置 ＞ 高级工坊 ＞ 笔尖形状 ＞ 导入自定义</strong>，选择保存的 <code>.png</code> 笔尖图案，即可打包进入笔刷库。</li>
          </ol>
        </section>

        <section id="file-formats" class="doc-section">
          <h2>
            <a href="#file-formats" class="anchor">#</a>
            支持的工程与文件格式
          </h2>
          <ul class="bullet-list">
            <li><strong>.revp：</strong>ReveriePaint 自研工程格式，完整保存图层与笔迹延时流。</li>
            <li><strong>.kra：</strong>Krita 原生工程格式。</li>
            <li><strong>.psd：</strong>Photoshop 分层文档格式。</li>
            <li><strong>PNG / JPG / WebP：</strong>常用图片平片导出。</li>
          </ul>
        </section>

        <!-- 4. 界面与工具 -->
        <section id="ui-overview" class="doc-section">
          <h2>
            <a href="#ui-overview" class="anchor">#</a>
            主界面功能总览
          </h2>
          <p>进入画布后，各功能布局如下：</p>

          <figure class="clean-figure" @click="openLightbox(imgUiMain, 'ReveriePaint 主界面总览')">
            <img :src="imgUiMain" alt="ReveriePaint 主界面总览" loading="lazy" />
            <figcaption>主画布各分区：工具栏、当前颜色、画笔大小、不透明度、图层、滤镜库、参考与色轮</figcaption>
          </figure>
        </section>

        <section id="ui-toolbar" class="doc-section">
          <h2>
            <a href="#ui-toolbar" class="anchor">#</a>
            工具栏滑动与排布定制
          </h2>
          <p>左侧菜单栏操作秘笈：</p>

          <figure class="clean-figure" style="max-width: 580px;" @click="openLightbox(imgUiLeftbar, '左侧菜单栏使用说明')">
            <img :src="imgUiLeftbar" alt="左侧菜单栏使用说明" loading="lazy" />
            <figcaption>工具栏支持直接上下滑动浏览，点击最下方的展开按钮可自由编辑排布常用项</figcaption>
          </figure>
        </section>

        <section id="color-picker" class="doc-section">
          <h2>
            <a href="#color-picker" class="anchor">#</a>
            悬浮取色面板与固定
          </h2>
          <ul class="bullet-list">
            <li><strong>按住顶栏拖拽：</strong>可将取色板移动至画布任意顺手位置。</li>
            <li><strong>点击图钉固定：</strong>点击色轮左上角的图钉图标可将其钉在界面上，边画边取色。</li>
            <li><strong>五合一取色模式：</strong>色轮、方块、和谐色轮、色卡与滑块一键切换。</li>
          </ul>
        </section>

        <section id="ui-scale" class="doc-section">
          <h2>
            <a href="#ui-scale" class="anchor">#</a>
            界面尺寸与滑块调节
          </h2>
          <p>如果工具栏尺寸不合适，可在设置中微调：</p>

          <figure class="clean-figure" style="max-width: 580px;" @click="openLightbox(imgUiSettings, '主题设置界面')">
            <img :src="imgUiSettings" alt="主题设置界面" loading="lazy" />
            <figcaption>设置 ＞ 偏好与硬件 ＞ 主题设置，可调整界面尺寸与侧边滑块板长短</figcaption>
          </figure>
        </section>

        <section id="tools-list" class="doc-section">
          <h2>
            <a href="#tools-list" class="anchor">#</a>
            目前支持的工具清单
          </h2>
          <div class="tool-list-clean">
            <div class="tool-row">
              <span class="tool-head">基础绘画</span>
              <span>画笔、橡皮擦、混合涂抹、填充、渐变</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">选区工具</span>
              <span>折线套索、矩形选择、椭圆选择、多边形选择、连续选择、相似色选择</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">几何矢量</span>
              <span>直线、矩形、椭圆、多边形、多段线、路径</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">变换与辅助</span>
              <span>移动、裁剪、文本、测量、透视、参考、对称（调优中）、液化（调优中）</span>
            </div>
          </div>
        </section>

        <!-- 5. 图层规格 -->
        <section id="layer-specs" class="doc-section">
          <h2>
            <a href="#layer-specs" class="anchor">#</a>
            图层数量与推荐规格
          </h2>
          <p>
            软件没有硬性限制最高图层数量，而是依据设备可用内存决定。在创建画布时会在右下角标出推荐层数：
          </p>

          <figure class="clean-figure" style="max-width: 540px;" @click="openLightbox(imgLayersPresets, '画布图层规格')">
            <img :src="imgLayersPresets" alt="画布图层规格" loading="lazy" />
            <figcaption>不同分辨率预设在典型设备上的安全图层数展示</figcaption>
          </figure>

          <ul class="bullet-list">
            <li><strong>当前设备全屏（1440 × 3200）：</strong>300 DPI · 约 235 层</li>
            <li><strong>正方形 2K（2048 × 2048）：</strong>300 DPI · 约 258 层</li>
            <li><strong>正方形 4K（4096 × 4096）：</strong>300 DPI · 约 64 层</li>
          </ul>
        </section>

        <!-- 6. 问题反馈 -->
        <section id="feedback" class="doc-section">
          <h2>
            <a href="#feedback" class="anchor">#</a>
            遇到 Bug 与反馈指引
          </h2>
          <p>
            如遇到可复现的 Bug，请优先前往 GitHub Issues 提交反馈。
          </p>

          <figure class="clean-figure" style="max-width: 440px;" @click="openLightbox(imgFeedbackIssue, '开发者关于反馈的说明')">
            <img :src="imgFeedbackIssue" alt="开发者关于反馈的说明" loading="lazy" />
            <figcaption>因为群消息容易忘，提交 GitHub Issue 能更系统地排查修复</figcaption>
          </figure>

          <div class="note-box">
            <p><strong>反馈要求：</strong>请带上<strong>设备型号 + Android 版本 + 触发 Bug 时的具体操作</strong>。如有需要可附带录屏视频。</p>
          </div>

          <div style="margin: 18px 0;">
            <a
              href="https://github.com/LanRhyme/ReveriePaint/issues"
              target="_blank"
              rel="noopener"
              class="download-pill primary"
            >
              前往 GitHub Issues 反馈 →
            </a>
          </div>
        </section>

        <section id="community" class="doc-section">
          <h2>
            <a href="#community" class="anchor">#</a>
            创作者交流群
          </h2>
          <p>
            不方便登录 GitHub 时，也可以在交流群内发布。
          </p>

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
            <a href="https://github.com/LanRhyme/ReveriePaint" target="_blank" rel="noopener">GitHub</a>
            <a href="https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android" target="_blank" rel="noopener">Mirror酱</a>
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
  background: rgba(245, 242, 236, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line-faint);
  height: 60px;
}
.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
  font-weight: 600;
  font-size: 1rem;
}
.brand-sub {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
  padding-left: 8px;
  border-left: 1px solid var(--line);
}
.header-center {
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
  left: 11px;
  color: var(--ink-soft-2);
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 32px;
  padding: 0 28px 0 32px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.55);
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
  font-size: 15px;
  color: var(--ink-ghost);
  cursor: pointer;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav-text-link {
  font-size: 0.8125rem;
  color: var(--ink-mid);
  transition: color 0.2s;
}
.nav-text-link:hover {
  color: var(--ink);
}
.mobile-menu-btn {
  display: none;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--line-strong);
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--ink);
  cursor: pointer;
}

/* ══ 经典双栏布局 ═══════════════════════════════ */
.docs-container {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: clamp(32px, 6vw, 68px);
  padding-top: 36px;
  padding-bottom: 96px;
}

/* 侧边栏 */
.docs-sidebar {
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  scrollbar-width: thin;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.group-title {
  font-size: 0.6875rem;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft-2);
  padding: 4px 8px;
}
.group-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: block;
  font-size: 0.8125rem;
  color: var(--ink-mid);
  padding: 6px 8px;
  border-radius: 6px;
  line-height: 1.45;
  transition: color 0.15s, background 0.15s;
}
.nav-item:hover {
  color: var(--ink);
  background: rgba(20, 22, 26, 0.04);
}
.nav-item.active {
  color: var(--ink);
  font-weight: 500;
  background: rgba(20, 22, 26, 0.06);
}

/* ══ 正文排版 ═══════════════════════════════════ */
.docs-main {
  max-width: 740px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.doc-lead-header {
  border-bottom: 1px solid var(--line-faint);
  padding-bottom: 28px;
}
.doc-title {
  font-size: clamp(1.85rem, 3.4vw, 2.35rem);
  line-height: 1.25;
  font-weight: 500;
  margin-top: 8px;
  letter-spacing: -0.025em;
}
.doc-desc {
  margin-top: 14px;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--ink-mid);
}

.doc-section {
  scroll-margin-top: 80px;
}
.doc-section h2 {
  font-size: 1.35rem;
  font-weight: 500;
  letter-spacing: -0.015em;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
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
.sub-hint {
  font-size: 0.84375rem !important;
  color: var(--ink-mid) !important;
}

/* 提示块：极简左侧竖线 */
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

/* 下载按钮胶囊 */
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
  padding: 9px 18px;
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

/* 极简截图容器 */
.image-showcase {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.clean-figure {
  margin: 16px 0;
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

/* 路径代码与复制 */
.path-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--line-faint);
  margin-top: 6px;
}
.path-row code {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink);
  word-break: break-all;
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

/* 页脚 */
.doc-footer {
  border-top: 1px solid var(--line-faint);
  padding-top: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.78125rem;
  color: var(--ink-soft-2);
}
.doc-footer-links {
  display: flex;
  gap: 14px;
}
.doc-footer-links a {
  color: var(--ink-mid);
}

/* 回到顶部 */
.back-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: #fff;
  color: var(--ink);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 灯箱模态 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(20, 22, 26, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  cursor: zoom-out;
}
.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.lightbox-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.lightbox-content p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8125rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 860px) {
  .docs-container {
    grid-template-columns: minmax(0, 1fr);
  }
  .docs-sidebar {
    position: fixed;
    top: 60px;
    bottom: 0;
    left: 0;
    width: 260px;
    background: var(--paper-warm);
    padding: 20px 16px;
    z-index: 45;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 6px 0 20px rgba(0, 0, 0, 0.08);
  }
  .docs-sidebar.is-open {
    transform: translateX(0);
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    top: 60px;
    background: rgba(20, 22, 26, 0.35);
    z-index: 44;
  }
  .mobile-menu-btn {
    display: inline-block;
  }
  .image-showcase {
    grid-template-columns: minmax(0, 1fr);
  }
  .header-right .nav-text-link {
    display: none;
  }
}
</style>
