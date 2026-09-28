<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
      { id: 'gestures-touch', label: '触控手势与智能快形' }
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
      { id: 'color-tools', label: '色彩面板与参考视窗' },
      { id: 'filters-suite', label: '35 种滤镜与线稿提取' },
      { id: 'selection-transform', label: '选区运算与空间变换' },
      { id: 'animation-workflow', label: '逐帧动画与洋葱皮' }
    ]
  },
  {
    index: '05',
    group: '工程与社群',
    items: [
      { id: 'project-timelapse', label: '工程规范与延时摄影' },
      { id: 'community-feedback', label: '问题反馈与创作者群' }
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
          <span class="brand-doc-tag">文档手册</span>
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
              placeholder="搜索章节或关键字（Ctrl+K）"
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
          <a href="/" class="header-link desktop-only">官网首页</a>
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
            {{ copiedMap['qqHeader'] ? '群号已复制' : 'QQ 群 729283213' }}
          </button>
          <button
            type="button"
            class="mobile-menu-btn"
            aria-label="目录"
            @click="toggleMobileMenu"
          >
            {{ mobileMenuOpen ? '收起' : '目录' }}
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
          <span>{{ mobileMenuOpen ? '收起' : '目录' }}</span>
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
            ReveriePaint 深度整合 Krita 核心图形内核，采用 C++ 原生底层与 Android 硬件加速通道直接渲染，杜绝跨平台 Web 包装层的性能损耗
          </p>
          <div class="feature-bullets">
            <div class="bullet-card">
              <strong>系统基准：</strong>适用于 Android 7.0 及以上版本（API Level 24+），推荐 64 位 ARM64 架构芯片
            </div>
            <div class="bullet-card">
              <strong>内存调度：</strong>无硬编码图层上限，系统依照设备当前可用物理内存动态评估最大安全图层深度
            </div>
            <div class="bullet-card">
              <strong>系统兼容提示：</strong>由于图形驱动差异，HarmonyOS NEXT 纯血架构兼容性较弱，推荐在标准 Android 设备上使用
            </div>
          </div>

          <h3 class="doc-h3">获取 APK 安装包通道</h3>
          <p>
            ReveriePaint 遵循 GPL-3.0 协议开源，官方优先推荐通过 GitHub Releases 获取正版构建，国内免翻环境亦可通过第三方 Mirror酱 或 QQ 群文件下载：
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
              Mirror酱镜像下载（第三方免翻通道） →
            </a>
          </div>
          <div class="note-box">
            <p><strong>备选渠道：</strong>若外部网络访问受限，可在官方创作者交流群（群号 <code>729283213</code>）群文件中直接获取最新 APK 安装包</p>
          </div>
          <ul class="bullet-list">
            <li>在系统浏览器或文件管理器中点击下载的 APK 文件，允许「安装未知来源应用」</li>
            <li>首次启动提示授予存储空间权限，用于工程读写与笔刷资源加载</li>
            <li>支持蓝牙与外设连接授权，用于获取手写笔电量、侧键动作与星闪超采样数据</li>
          </ul>

          <h3 class="doc-h3">已知待优化与路线图</h3>
          <ul class="bullet-list">
            <li><strong>液化工具与对称尺：</strong>移动端交互与多线程计算正在重构优化中，后续更新开放</li>
            <li><strong>Photoshop ABR 格式：</strong>后续版本将实现直接解析 <code>.abr</code> 二进制笔刷包</li>
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

          <h3 class="doc-h3">画布视图辅助设置</h3>
          <ul class="bullet-list">
            <li><strong>像素网格（Pixel Grid）：</strong>超微距放大画布超过 1600% 时自动显现单像素网格分界线，精准绘制像素画</li>
            <li><strong>放大插值平滑（Magnification Interpolation）：</strong>开启时放大视口采用双线性平滑滤波，关闭时呈现清晰马赛克锐利边缘</li>
            <li><strong>快捷侧滑块（Quick Sliders）：</strong>常驻左侧控制笔刷尺寸与不透明度，可配置单滑块或双滑块展开</li>
          </ul>
        </section>

        <section id="gestures-touch" class="doc-section">
          <h2>
            <a href="#gestures-touch" class="anchor">#</a>
            触控手势与智能快形
          </h2>
          <p>
            画布内置全手势识别引擎，精准区分单指拾色、双指漫游与多指快捷回退：
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
                  <td>零延迟双线性滤波变换，松手后保持当前视角</td>
                </tr>
                <tr>
                  <td><code>双指同时轻点</code></td>
                  <td>撤销（Undo）</td>
                  <td>即刻回退上一笔或上一次图层修改</td>
                </tr>
                <tr>
                  <td><code>双指按住不放</code></td>
                  <td>连续高速撤销</td>
                  <td>保持双指贴紧屏幕即可持续向前回溯历史记录</td>
                </tr>
                <tr>
                  <td><code>三指同时轻点</code></td>
                  <td>重做（Redo）</td>
                  <td>恢复刚刚撤销的操作步数</td>
                </tr>
                <tr>
                  <td><code>双指快速向内捏合</code></td>
                  <td>适应屏幕（Fit View）</td>
                  <td>瞬时将画布居中并缩放至完整可视范围</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="doc-h3">智能快形绘制（QuickShape）</h3>
          <p>
            在画布上手绘直线、圆弧、椭圆、多边形或矩形时，运笔结束保持笔尖停留在屏幕约 0.5 秒不动，笔迹即自动吸附对齐为完美几何形状：
          </p>
          <ul class="bullet-list">
            <li><strong>顶部胶囊编辑栏：</strong>吸附成功后屏幕顶部弹出操作栏，支持一键在正圆/椭圆或正方形/矩形之间自由切换</li>
            <li><strong>节点微调：</strong>可通过拖拽各顶点控制手柄微调几何大小、角度与比例</li>
            <li><strong>提交与放弃：</strong>点击胶囊栏右侧确认图标应用成型，点击叉号即可撤回放弃</li>
          </ul>

          <h3 class="doc-h3">长按取色与防遮挡偏移</h3>
          <ul class="bullet-list">
            <li><strong>悬浮动态取色环：</strong>内环显示当前画笔原色，外环显示触点下方最新采样色，便于对比明度与冷暖差异</li>
            <li><strong>防遮挡垂直偏移：</strong>取色圆环自动向上偏移显示在手指上方，解决指尖遮挡视线问题</li>
            <li><strong>仅手写笔模式：</strong>开启后画布仅接收主动手写笔输入，手指仅用于缩放漫游，手掌自然贴靠不误触</li>
          </ul>

          <h3 class="doc-h3">外接实体键盘快捷键全集</h3>
          <p>连接蓝牙或平板外接键盘时，支持完整桌面级快捷键映射：</p>
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
                  <td>画布漫游</td>
                  <td>平移画布 / 翻转画布 / 旋转</td>
                  <td><code>Space（长按）</code> / <code>H</code> / <code>R</code></td>
                </tr>
                <tr>
                  <td>历史与选区</td>
                  <td>撤销 / 重做 / 取消选区</td>
                  <td><code>Ctrl + Z</code> / <code>Ctrl + Shift + Z</code> / <code>Ctrl + D</code></td>
                </tr>
                <tr>
                  <td>常用工具</td>
                  <td>矩形选区 / 套索 / 魔棒 / 吸管</td>
                  <td><code>M</code> / <code>L</code> / <code>W</code> / <code>I</code></td>
                </tr>
                <tr>
                  <td>图形变换</td>
                  <td>油漆桶 / 渐变 / 自由变换 / 移动</td>
                  <td><code>G</code> / <code>Shift + G</code> / <code>Ctrl + T</code> / <code>V</code></td>
                </tr>
                <tr>
                  <td>图层管理</td>
                  <td>新建图层 / 复制 / 向下合并</td>
                  <td><code>Ctrl + Shift + N</code> / <code>Ctrl + J</code> / <code>Ctrl + E</code></td>
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
          <p>系统根据设备物理运存动态计算安全层数，创建画布时右下角会实时预估：</p>
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
            <li><strong>S 形对比（Sigmoid）：</strong>两头平缓中间灵敏，增强轻重笔触的戏剧化反差</li>
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

          <h3 class="doc-h3">四档防抖稳定器</h3>
          <ul class="bullet-list">
            <li><strong>无平滑（None）：</strong>100% 忠实记录原生采样坐标，极速无延迟，适合草图速写</li>
            <li><strong>基本平滑（Basic）：</strong>轻量滑动平均插值算法，消除手部细微生理抖动</li>
            <li><strong>加权平滑（Weighted）：</strong>按笔画距离动态计算阻尼，勾线圆润流畅</li>
            <li><strong>延迟稳定器（Stabilizer）：</strong>拉绳稳定模型，笔尖后方牵引弹性绳，彻底消除一切抖褶</li>
          </ul>
        </section>

        <!-- 04 创作与进阶工具 -->
        <section id="color-tools" class="doc-section">
          <h2>
            <a href="#color-tools" class="anchor">#</a>
            色彩面板与参考视窗
          </h2>
          <ul class="bullet-list">
            <li><strong>悬浮取色面板：</strong>可拖拽至屏幕任意位置，点击左上角图钉图标置顶常驻，边画边取色</li>
            <li><strong>外环双击极轴吸附：</strong>双击色轮外环可在纯红（0°）、纯黄（60°）、纯绿（120°）、纯青（180°）、纯蓝（240°）、纯洋红（300°）之间瞬时精准定位</li>
            <li><strong>内置多色彩立体模型：</strong>正方形（HSV）、三角形（Triangle）、圆形（Circle）三种内嵌选色形态随心切换</li>
            <li><strong>五合一取色模式：</strong>HSV 色轮、饱和度方块、和谐配色环、预设色卡与 RGB 滑块一键切换</li>
            <li><strong>浮动参考图视窗：</strong>支持独立加载外部高清参考图，窗口内支持双指独立平移缩放，点击即可直接取色</li>
          </ul>

          <h3 class="doc-h3">色彩和谐算法在插画中的应用</h3>
          <ul class="bullet-list">
            <li><strong>互补色（Complementary）：</strong>色环 180 度正相对立颜色，制造最强烈的视觉冲击感与张力</li>
            <li><strong>分裂互补色（Split-Complementary）：</strong>由互补色两翼展开的次级对比色，既丰富又比直接互补更为柔和雅致</li>
            <li><strong>类似色（Analogous）：</strong>色环相邻 30-60 度同色调搭配，营造自然统一的光影氛围感</li>
            <li><strong>三色组（Triadic）：</strong>色轮 120 度等边三角形分布，适合动漫画风的生动多色表达</li>
          </ul>

          <h3 class="doc-h3">全量工具清单一览</h3>
          <div class="tool-list-clean">
            <div class="tool-row">
              <span class="tool-head">基础绘画</span>
              <span>画笔、橡皮擦、混合涂抹、油漆桶填充、渐变工具</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">选区工具</span>
              <span>自由套索、矩形选择、椭圆选择、多边形选择、魔棒连续选择、相似色选择</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">几何矢量</span>
              <span>直线、矩形、椭圆、多边形、多段线、贝塞尔矢量路径</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">变换与辅助</span>
              <span>移动、画布裁剪、文本工具、测量尺、透视参考网格、悬浮参考视窗</span>
            </div>
          </div>
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

        <section id="selection-transform" class="doc-section">
          <h2>
            <a href="#selection-transform" class="anchor">#</a>
            选区运算与空间变换
          </h2>
          <p>
            选区面板提供自由套索、几何矩形/椭圆、多边形以及魔棒连续选择，并支持完整布尔运算：
          </p>
          <ul class="bullet-list">
            <li><strong>布尔运算：</strong>支持新建选区、添加模式（+）、减去模式（-）、相交模式（∩）</li>
            <li><strong>边缘处理：</strong>支持一键反向选择、选区边缘羽化柔化以及像素级扩展与收缩</li>
            <li><strong>提取命令：</strong>支持「剪切到新图层」、「复制到新图层」与直接清空选区内容</li>
            <li><strong>自由变换：</strong>支持八控制手柄自由拉伸、锁定等比缩放、自由旋转与镜像对称翻转，配合高质量双三次插值重采样减少失真</li>
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
            <li><strong>时间轴控制：</strong>自由插入空白关键帧或复制现有帧，调节单帧驻留时间适配一拍一、一拍二节奏</li>
            <li><strong>洋葱皮透光台：</strong>前续帧默认为朱红色标，后续帧默认为青绿色标，附带透明度阶梯衰减与仅显示关键帧模式</li>
            <li><strong>预渲染缓存引擎：</strong>内置动态 RAM 预渲染机制，提前合成显存纹理，保证 60fps 丝滑播放不卡顿</li>
            <li><strong>动效导出：</strong>支持一键输出为 GIF 动图、MP4 高清动画视频或连续 PNG 序列帧</li>
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
            <li><strong>无损分块位图：</strong>图层像素采用无损压缩分块存储，大幅降低读写功耗与存盘耗时</li>
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

          <h3 class="doc-h3">创作者交流群</h3>
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
    background: rgba(20, 22, 26, 0.32);
    z-index: 85;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
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
