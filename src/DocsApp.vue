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

// 章节导航结构
const navSections = [
  {
    group: '快速入门',
    items: [
      { id: 'intro', label: '软件架构与系统兼容性' },
      { id: 'install', label: '获取 APK 安装包' },
      { id: 'permissions', label: '安装步骤与系统授权' },
      { id: 'roadmap', label: '已知待优化与路线图' }
    ]
  },
  {
    group: '画布与触控手势',
    items: [
      { id: 'gestures-touch', label: '核心触控手势清单' },
      { id: 'eyedropper', label: '长按取色与防遮挡偏移' },
      { id: 'pen-mode', label: '仅手写笔模式与防误触' }
    ]
  },
  {
    group: '图层与继承不透明度',
    items: [
      { id: 'layer-types', label: '图层类型与组织架构' },
      { id: 'inherit-alpha', label: '继承不透明度（剪贴蒙版）' },
      { id: 'alpha-compare', label: '锁定透明度与继承透明度对比' },
      { id: 'layer-ops', label: '图层进阶操作与独奏' },
      { id: 'blend-modes', label: '图层混合模式参考' },
      { id: 'layer-specs', label: '图层数量与推荐规格' }
    ]
  },
  {
    group: '手写笔硬件与微震声学',
    items: [
      { id: 'stylus-brands', label: '多品牌手写笔深度适配' },
      { id: 'pressure-curve', label: '全局压感曲线微调' },
      { id: 'paper-sound', label: '纸感微震与声学引擎' },
      { id: 'stylus-cursor', label: '笔尖光标与落笔预测' }
    ]
  },
  {
    group: '笔刷工坊与动力学',
    items: [
      { id: 'brush-import', label: '导入笔刷（分享与手动）' },
      { id: 'brush-formats', label: '支持的笔刷格式生态' },
      { id: 'abr-tips', label: 'Photoshop ABR 转换技巧' },
      { id: 'brush-studio', label: '笔刷工坊八大调校维度' },
      { id: 'brush-stabilizer', label: '笔迹平滑与防抖算法' }
    ]
  },
  {
    group: '界面与色彩工具',
    items: [
      { id: 'ui-overview', label: '主画布界面总览' },
      { id: 'ui-toolbar', label: '工具栏滑动与排布定制' },
      { id: 'color-picker', label: '悬浮取色面板与固定' },
      { id: 'color-reference', label: '浮动参考图视窗' },
      { id: 'tools-list', label: '全量工具清单一览' }
    ]
  },
  {
    group: '实时滤镜与通道处理',
    items: [
      { id: 'filters-overview', label: '35 种专业级滤镜分类' },
      { id: 'filters-map', label: '渐变映射与黑白线稿提取' }
    ]
  },
  {
    group: '选区与空间变换',
    items: [
      { id: 'selection-tools', label: '选区工具族与布尔运算' },
      { id: 'transform-modes', label: '自由变换与空间映射' }
    ]
  },
  {
    group: '逐帧动画与时间轴',
    items: [
      { id: 'anim-timeline', label: '时间轴面板与帧管理' },
      { id: 'anim-onion', label: '洋葱皮透光台' },
      { id: 'anim-playback', label: '预渲染缓存与动效导出' }
    ]
  },
  {
    group: '工程规范与延时摄影',
    items: [
      { id: 'file-revp', label: '.revp 自研工程规范' },
      { id: 'timelapse-record', label: '无损笔迹延时摄影回放' },
      { id: 'file-interop', label: '跨软件文件互通与导出' }
    ]
  },
  {
    group: '问题与社群',
    items: [
      { id: 'feedback', label: 'Bug 反馈与 GitHub 规范' },
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
    const id = window.location.hash.replace('#', '')
    setTimeout(() => scrollToAnchor(id), 120)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', handleKeydown)
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
          <a href="/" class="header-link">官网首页</a>
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
            class="header-copy-btn"
            @click="copyText('qqHeader', '729283213')"
          >
            {{ copiedMap['qqHeader'] ? '群号已复制' : 'QQ 群 729283213' }}
          </button>
          <button
            type="button"
            class="mobile-menu-btn"
            aria-label="目录"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            {{ mobileMenuOpen ? '关闭' : '目录' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 核心视图区域（居中平衡双栏布局） -->
    <div class="docs-viewport">
      <!-- 左侧大纲导航栏 -->
      <aside :class="['docs-sidebar', { 'is-open': mobileMenuOpen }]">
        <nav class="sidebar-nav">
          <div v-for="group in filteredNav" :key="group.group" class="nav-group">
            <div class="group-title">{{ group.group }}</div>
            <ul class="group-list">
              <li v-for="item in group.items" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  :class="['nav-item', { active: activeSectionId === item.id }]"
                  @click.prevent="scrollToAnchor(item.id)"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
          <div v-if="filteredNav.length === 0" class="search-empty">
            无匹配章节内容
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

        <!-- 1. 快速入门 -->
        <section id="intro" class="doc-section">
          <h2>
            <a href="#intro" class="anchor">#</a>
            软件架构与系统兼容性
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
              <strong>鸿蒙设备提示：</strong>由于图形驱动差异，HarmonyOS NEXT 纯血架构兼容性较弱，推荐在标准 Android 设备上使用
            </div>
          </div>
        </section>

        <section id="install" class="doc-section">
          <h2>
            <a href="#install" class="anchor">#</a>
            获取 APK 安装包
          </h2>
          <p>
            ReveriePaint 遵循 GPL-3.0 协议完全开源，所有编译产物均发布在 GitHub Releases，确保文件纯净安全
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
              前往 GitHub Releases 下载最新 APK →
            </a>
          </div>
          <div class="note-box">
            <p><strong>备选渠道：</strong>若网络访问受限，可在官方创作者交流群（群号 <code>729283213</code>）群文件中直接获取最新 APK 安装包</p>
          </div>
        </section>

        <section id="permissions" class="doc-section">
          <h2>
            <a href="#permissions" class="anchor">#</a>
            安装步骤与系统授权
          </h2>
          <ul class="bullet-list">
            <li>在系统浏览器或文件管理器中点击下载的 APK 文件，允许「安装未知来源应用」</li>
            <li>首次启动提示授予存储空间权限，用于工程读写与笔刷资源加载</li>
            <li>支持蓝牙与外设连接授权，用于获取手写笔电量、侧键动作与星闪超采样数据</li>
          </ul>
        </section>

        <section id="roadmap" class="doc-section">
          <h2>
            <a href="#roadmap" class="anchor">#</a>
            已知待优化与路线图
          </h2>
          <ul class="bullet-list">
            <li><strong>液化工具与对称尺：</strong>移动端交互与多线程计算正在重构优化中，后续更新开放</li>
            <li><strong>Photoshop ABR 格式：</strong>后续版本将实现直接解析 <code>.abr</code> 二进制笔刷包</li>
            <li><strong>矢量文字编辑：</strong>更丰富的排版对齐与外置字体加载正在排期适配</li>
          </ul>
        </section>

        <!-- 2. 画布与触控手势 -->
        <section id="gestures-touch" class="doc-section">
          <h2>
            <a href="#gestures-touch" class="anchor">#</a>
            核心触控手势清单
          </h2>
          <p>
            画布内置全手势识别引擎，精准区分单指拾色、双指漫游与多指快捷回退
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
                  <td>零延迟双线性滤波变换，松手后保持当前视图视角</td>
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
        </section>

        <section id="eyedropper" class="doc-section">
          <h2>
            <a href="#eyedropper" class="anchor">#</a>
            长按取色与防遮挡偏移
          </h2>
          <p>
            无需反复切换吸管工具，手指在画布任意位置长按即可实时吸色
          </p>
          <ul class="bullet-list">
            <li><strong>悬浮动态取色环：</strong>内环显示当前画笔原色，外环显示触点下方最新采样色，便于对比明度与冷暖差异</li>
            <li><strong>防遮挡垂直偏移：</strong>取色圆环自动向上偏移显示在手指上方，解决指尖遮挡视线问题</li>
            <li><strong>灵敏度调节：</strong>可在「偏好设置」中调节长按触发响应时间与位移防抖容差</li>
          </ul>
        </section>

        <section id="pen-mode" class="doc-section">
          <h2>
            <a href="#pen-mode" class="anchor">#</a>
            仅手写笔模式与防误触
          </h2>
          <p>
            开启「仅手写笔模式」后，画布绘制通道仅接收主动手写笔输入，手指仅用于缩放旋转和长按取色，手掌自然贴合屏幕书写也不会产生误触杂线
          </p>
        </section>

        <!-- 3. 图层与继承不透明度 (核心专章) -->
        <section id="layer-types" class="doc-section">
          <h2>
            <a href="#layer-types" class="anchor">#</a>
            图层类型与组织架构
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
        </section>

        <section id="inherit-alpha" class="doc-section">
          <h2>
            <a href="#inherit-alpha" class="anchor">#</a>
            继承不透明度（Inherit Alpha）替代传统剪贴蒙版
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
        </section>

        <section id="alpha-compare" class="doc-section">
          <h2>
            <a href="#alpha-compare" class="anchor">#</a>
            锁定透明度与继承透明度对比
          </h2>
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
                  <td><strong>适用场景</strong></td>
                  <td>快速给单条线稿换色、简单色块微调</td>
                  <td>赛璐璐阴影、二分光影、复杂材质贴图与多重高光</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="layer-ops" class="doc-section">
          <h2>
            <a href="#layer-ops" class="anchor">#</a>
            图层进阶操作与独奏
          </h2>
          <p>在图层行上点击进入图层操作面板，提供专业级操作命令：</p>
          <ul class="bullet-list">
            <li><strong>独奏模式（Solo）：</strong>点击图层眼睛图标旁的独奏按钮，画布瞬时仅展示当前图层内容，便于检查局部杂线或细微漏色</li>
            <li><strong>向下合并（Merge Down）：</strong>将当前图层合并至下方相邻图层</li>
            <li><strong>合并图层组（Flatten Group）：</strong>将整个图层组及其所有子图层烘焙为单个平片图层</li>
            <li><strong>从图层载入选区：</strong>根据当前图层的不透明度像素一键生成精确选区</li>
            <li><strong>栅格化（Rasterize）：</strong>将滤镜图层、渐变图层或文字图层转为标准可绘图像素</li>
            <li><strong>图层水平 / 垂直翻转：</strong>独立翻转单个图层而不变动画布其他元素</li>
          </ul>
        </section>

        <section id="blend-modes" class="doc-section">
          <h2>
            <a href="#blend-modes" class="anchor">#</a>
            图层混合模式参考
          </h2>
          <p>
            ReveriePaint 完整继承 Krita 的色彩合成通道，支持 25 种核心混合模式：
          </p>
          <div class="tool-list-clean">
            <div class="tool-row">
              <span class="tool-head">基础常规</span>
              <span>正常（Normal）、溶解（Dissolve）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">变暗压暗</span>
              <span>正片叠底（Multiply）、变暗（Darken）、颜色加深（Color Burn）、线性加深（Linear Burn）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">变亮提亮</span>
              <span>滤色（Screen）、变亮（Lighten）、颜色减淡（Color Dodge）、添加 / 线性减淡（Add）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">对比增强</span>
              <span>叠加（Overlay）、柔光（Soft Light）、强光（Hard Light）、亮光（Vivid Light）、线性光（Linear Light）、点光（Pin Light）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">差值排除</span>
              <span>差值（Difference）、排除（Exclusion）、减去（Subtract）、划分（Divide）</span>
            </div>
            <div class="tool-row">
              <span class="tool-head">色彩构成</span>
              <span>色相（Hue）、饱和度（Saturation）、颜色（Color）、明度（Luminosity）</span>
            </div>
          </div>
        </section>

        <section id="layer-specs" class="doc-section">
          <h2>
            <a href="#layer-specs" class="anchor">#</a>
            图层数量与推荐规格
          </h2>
          <p>
            系统根据设备物理运存动态计算安全层数，创建画布时右下角会实时预估：
          </p>
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

        <!-- 4. 手写笔硬件与微震声学 -->
        <section id="stylus-brands" class="doc-section">
          <h2>
            <a href="#stylus-brands" class="anchor">#</a>
            多品牌手写笔深度适配
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
                  <td>笔身双击快捷切换工具、压感平滑校准、落笔触觉机械震动</td>
                </tr>
                <tr>
                  <td><strong>三星 S-Pen</strong><br>Galaxy Tab S 系列</td>
                  <td>Wacom EMR 电磁压感 · 悬浮感应 Air Actions</td>
                  <td>侧键单击切换取色/橡皮擦、悬浮光标预览笔刷尺寸</td>
                </tr>
                <tr>
                  <td><strong>通用手写笔</strong><br>USI / 小米灵感笔 / 微软 MPP</td>
                  <td>标准 Android HID 触控协议</td>
                  <td>4096 级压感与倾斜角感应、掌托防误触隔离</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="pressure-curve" class="doc-section">
          <h2>
            <a href="#pressure-curve" class="anchor">#</a>
            全局压感曲线微调
          </h2>
          <p>
            在「设置 ＞ 手写笔」中提供基于贝塞尔样条的全局压力映射编辑器，画师可根据个人下笔轻重习惯调整控制点，亦可直接套用预设：
          </p>
          <ul class="bullet-list">
            <li><strong>线性（Linear）：</strong>输入压感与输出线宽 1:1 真实映射</li>
            <li><strong>轻柔（Soft）：</strong>轻压即可出浓墨，适合手劲较轻、喜欢轻快排线的画师</li>
            <li><strong>硬实（Hard）：</strong>需用力才能画出最大笔触，适合重力度勾线与雕刻细节</li>
            <li><strong>S 形对比（Sigmoid）：</strong>两头平缓中间灵敏，增强轻重笔触的戏剧化反差</li>
          </ul>
        </section>

        <section id="paper-sound" class="doc-section">
          <h2>
            <a href="#paper-sound" class="anchor">#</a>
            纸感微震与声学引擎
          </h2>
          <p>
            ReveriePaint 独家研发 PaperSoundEngine，通过分析运笔速度、即时压力与加速度，在设备扬声器与震动马达上实时合成真实纸张摩擦声效：
          </p>
          <ul class="bullet-list">
            <li><strong>铅笔纸质（Pencil）：</strong>具有真实微粒摩擦感的颗粒感声效，低速轻柔，高速清脆</li>
            <li><strong>钢笔墨水（Ink）：</strong>顺滑沉稳的湿墨流动阻尼感声效</li>
            <li><strong>机械轻嗒（Tick）：</strong>富有节奏感的微触觉确认音</li>
            <li><strong>动态低通滤波：</strong>运笔速度越快高频泛音越饱满，完美还原纸上沙沙作画的沉浸感</li>
          </ul>
        </section>

        <section id="stylus-cursor" class="doc-section">
          <h2>
            <a href="#stylus-cursor" class="anchor">#</a>
            笔尖光标与落笔预测
          </h2>
          <p>
            支持悬浮光标样式定制：包含笔刷真实外轮廓轮廓、十字精细准星、居中圆点或系统原生光标；配合落笔笔迹预测引擎，高刷屏幕跟手感更强
          </p>
        </section>

        <!-- 5. 笔刷工坊与动力学 -->
        <section id="brush-import" class="doc-section">
          <h2>
            <a href="#brush-import" class="anchor">#</a>
            导入笔刷（分享与手动）
          </h2>
          <p>
            支持两种导入途径，推荐使用系统级分享一键导入：
          </p>
          <figure class="clean-figure" @click="openLightbox(imgBrushImport, '笔刷面板导入界面')">
            <img :src="imgBrushImport" alt="笔刷面板导入界面" loading="lazy" />
            <figcaption>左侧画笔面板顶部导入按钮，支持直接加载本地笔刷资源文件</figcaption>
          </figure>
          <ul class="bullet-list">
            <li><strong>系统分享导入（首选）：</strong>在 QQ、微信、网盘或文件管理器中直接点击笔刷文件（<code>.kpp</code> / <code>.bundle</code>），选择「用其他应用打开」或「分享」，点选 <strong>ReveriePaint</strong> 即可秒级导入</li>
            <li><strong>应用内手动导入：</strong>在画布左侧画笔面板中点击「导入」按钮，调起系统文件管理器选取笔刷</li>
          </ul>
          <figure class="clean-figure" style="max-width: 520px;" @click="openLightbox(imgBrushQq, 'QQ 接收文件打开方式')">
            <img :src="imgBrushQq" alt="QQ 接收文件打开方式" loading="lazy" />
            <figcaption>QQ 内接收文件后点击右上角三个点，选择用其他应用打开</figcaption>
          </figure>
        </section>

        <section id="brush-formats" class="doc-section">
          <h2>
            <a href="#brush-formats" class="anchor">#</a>
            支持的笔刷格式生态
          </h2>
          <ul class="bullet-list">
            <li><strong>.kpp（Krita Paintop Preset）：</strong>Krita 原生预设格式，内嵌预览缩略图、笔刷引擎设定、笔尖蒙版与动力学参数</li>
            <li><strong>.bundle（Krita 资源包）：</strong>包含多个笔刷预设、笔尖贴图与纸纹材质的综合压缩包，导入时自动完成全套解包</li>
            <li><strong>.myb（MyPaint 笔刷）：</strong>兼容 MyPaint 水彩与涂抹预设引擎</li>
          </ul>
        </section>

        <section id="abr-tips" class="doc-section">
          <h2>
            <a href="#abr-tips" class="anchor">#</a>
            Photoshop ABR 转换技巧
          </h2>
          <p>
            由于 Photoshop <code>.abr</code> 采用私有二进制封闭封装，可将 ABR 中的笔尖图案导出为透明背景 <code>.png</code> 后导入：
          </p>
          <ol class="ordered-list">
            <li>使用在线转换工具或 ABR Viewer 提取 <code>.abr</code> 内部笔尖为透明 <code>.png</code></li>
            <li>在 ReveriePaint 笔刷面板中点击「新建笔刷」进入「高级工坊」</li>
            <li>在「笔尖形状（Tip & Mask）」中点击「导入自定义」，选取保存的 PNG 笔尖即可永久归档入库</li>
          </ol>
        </section>

        <section id="brush-studio" class="doc-section">
          <h2>
            <a href="#brush-studio" class="anchor">#</a>
            笔刷工坊八大调校维度
          </h2>
          <p>
            长按任意笔刷点击编辑即可进入 Brush Studio 深度调校工作台：
          </p>
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
        </section>

        <section id="brush-stabilizer" class="doc-section">
          <h2>
            <a href="#brush-stabilizer" class="anchor">#</a>
            笔迹平滑与防抖算法
          </h2>
          <p>
            针对不同绘画习惯，工具栏提供四档平滑模式切换：
          </p>
          <ul class="bullet-list">
            <li><strong>无平滑（None）：</strong>100% 忠实记录传感器原生采样坐标，极速无延迟，适合草图速写</li>
            <li><strong>基本平滑（Basic）：</strong>轻量滑动平均插值算法，消除手部细微生理抖动</li>
            <li><strong>加权平滑（Weighted）：</strong>按笔画距离动态计算阻尼，勾线更加圆润流畅</li>
            <li><strong>延迟稳定器（Stabilizer）：</strong>拉绳稳定模型，笔尖后方牵引弹性绳，彻底消除一切抖褶</li>
          </ul>
        </section>

        <!-- 6. 界面与色彩工具 -->
        <section id="ui-overview" class="doc-section">
          <h2>
            <a href="#ui-overview" class="anchor">#</a>
            主画布界面总览
          </h2>
          <figure class="clean-figure" @click="openLightbox(imgUiMain, 'ReveriePaint 平板主画布界面总览')">
            <img :src="imgUiMain" alt="ReveriePaint 平板主画布界面总览" loading="lazy" />
            <figcaption>各功能分区：左侧工具栏、快捷滑块、图层面板、色轮与浮动视窗</figcaption>
          </figure>
        </section>

        <section id="ui-toolbar" class="doc-section">
          <h2>
            <a href="#ui-toolbar" class="anchor">#</a>
            工具栏滑动与排布定制
          </h2>
          <figure class="clean-figure" style="max-width: 580px;" @click="openLightbox(imgUiLeftbar, '左侧菜单栏使用说明')">
            <img :src="imgUiLeftbar" alt="左侧菜单栏使用说明" loading="lazy" />
            <figcaption>工具栏支持上下滑动浏览，点击底部展开按钮可自由编辑常用工具排布</figcaption>
          </figure>
        </section>

        <section id="color-picker" class="doc-section">
          <h2>
            <a href="#color-picker" class="anchor">#</a>
            悬浮取色面板与固定
          </h2>
          <ul class="bullet-list">
            <li><strong>按住顶栏拖拽：</strong>可将取色板移动至画布任意顺手位置</li>
            <li><strong>点击图钉固定：</strong>点击色轮左上角图钉图标将其固定置顶，边画边取色</li>
            <li><strong>五合一取色模式：</strong>HSV 色轮、饱和度方块、和谐配色环、预设色卡与 RGB 滑块一键切换</li>
          </ul>
        </section>

        <section id="color-reference" class="doc-section">
          <h2>
            <a href="#color-reference" class="anchor">#</a>
            浮动参考图视窗
          </h2>
          <p>
            点击顶部「参考」按钮可呼出独立的悬浮参考图视窗：
          </p>
          <ul class="bullet-list">
            <li>支持加载外部本地图片作为画作参考，不占用画布实际图层</li>
            <li>参考窗口内支持双指独立平移与缩放，与主画布视角互不干扰</li>
            <li>手指或手写笔点击参考图内部即可直接吸色并应用到当前画笔</li>
          </ul>
        </section>

        <section id="tools-list" class="doc-section">
          <h2>
            <a href="#tools-list" class="anchor">#</a>
            全量工具清单一览
          </h2>
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

        <!-- 7. 实时滤镜与通道处理 -->
        <section id="filters-overview" class="doc-section">
          <h2>
            <a href="#filters-overview" class="anchor">#</a>
            35 种专业级滤镜分类
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
        </section>

        <section id="filters-map" class="doc-section">
          <h2>
            <a href="#filters-map" class="anchor">#</a>
            渐变映射与黑白线稿提取
          </h2>
          <p>
            内置两款数字绘画高频使用的通道滤镜：
          </p>
          <ul class="bullet-list">
            <li><strong>亮度转 Alpha（Luminance to Alpha）：</strong>纸上手绘草稿拍照导入后，一键将画面白纸区域完全转为透明，保留纯净的黑色铅笔线条，省去繁琐抠图步骤</li>
            <li><strong>渐变映射（Gradient Map）：</strong>黑白灰阶二分素描一键上色神器，通过自定义色带将图像由暗到明的灰度精准映射为丰富色彩</li>
          </ul>
        </section>

        <!-- 8. 选区与空间变换 -->
        <section id="selection-tools" class="doc-section">
          <h2>
            <a href="#selection-tools" class="anchor">#</a>
            选区工具族与布尔运算
          </h2>
          <p>
            支持自由套索、几何矩形/椭圆、多边形以及魔棒连续选择；面板提供完整的选区布尔运算控制：
          </p>
          <ul class="bullet-list">
            <li><strong>新建选区：</strong>替换当前选区</li>
            <li><strong>添加模式（+）：</strong>按住追加选区区域</li>
            <li><strong>减去模式（-）：</strong>镂空剔除指定区域</li>
            <li><strong>相交模式（∩）：</strong>仅保留重叠部分</li>
            <li><strong>边缘处理：</strong>支持一键反向选择、选区边缘羽化柔化以及像素级扩展/收缩</li>
            <li><strong>提取命令：</strong>支持「剪切到新图层」、「复制到新图层」与直接清空选区内容</li>
          </ul>
        </section>

        <section id="transform-modes" class="doc-section">
          <h2>
            <a href="#transform-modes" class="anchor">#</a>
            自由变换与空间映射
          </h2>
          <p>
            变换工具支持针对当前图层或局部选区内容执行空间矩阵变换：
          </p>
          <ul class="bullet-list">
            <li><strong>自由变换：</strong>支持八个控制手柄任意拉伸缩放</li>
            <li><strong>锁定宽高比：</strong>等比例缩放，避免人物形体失真</li>
            <li><strong>旋转与翻转：</strong>任意角度微调、90 度步进旋转与水平/垂直轴向对称镜像</li>
            <li><strong>双三次插值重采样：</strong>变换过程中提供高质量像素重建，最大限度减少缩放模糊</li>
          </ul>
        </section>

        <!-- 9. 逐帧动画与时间轴 -->
        <section id="anim-timeline" class="doc-section">
          <h2>
            <a href="#anim-timeline" class="anchor">#</a>
            时间轴面板与帧管理
          </h2>
          <p>
            展开动画时间轴后，画作转为逐帧动画工作流：
          </p>
          <ul class="bullet-list">
            <li><strong>关键帧与空白帧：</strong>随时在指定时间点插入空白关键帧或复制现有帧进行原画绘制</li>
            <li><strong>帧间隔与保持：</strong>支持调整单帧驻留时间，适配一拍一、一拍二或一拍三节奏</li>
            <li><strong>帧操作菜单：</strong>支持帧的剪切、复制、粘贴、反转与向后顺移</li>
          </ul>
        </section>

        <section id="anim-onion" class="doc-section">
          <h2>
            <a href="#anim-onion" class="anchor">#</a>
            洋葱皮透光台
          </h2>
          <p>
            提供专业二维动画透光台辅助视效：
          </p>
          <ul class="bullet-list">
            <li><strong>色标标注：</strong>前续帧默认为朱红色标记，后续帧默认为青绿色标记，便于区分动态走势</li>
            <li><strong>透明度阶梯衰减：</strong>离当前帧越远的画幅透明度自动降低，避免线条视觉杂乱</li>
            <li><strong>仅显示关键帧模式：</strong>可过滤中间过渡帧，专注于极重要动作节点对齐</li>
          </ul>
        </section>

        <section id="anim-playback" class="doc-section">
          <h2>
            <a href="#anim-playback" class="anchor">#</a>
            预渲染缓存与动效导出
          </h2>
          <p>
            内置动态 RAM 预渲染缓存机制，播放时提前将多图层合成为显存纹理，确保 60fps 丝滑预览不掉帧；支持导出为 GIF 动图、MP4 高清视频或连续 PNG 序列帧
          </p>
        </section>

        <!-- 10. 工程规范与延时摄影 -->
        <section id="file-revp" class="doc-section">
          <h2>
            <a href="#file-revp" class="anchor">#</a>
            .revp 自研工程规范
          </h2>
          <p>
            <code>.revp</code> 是 ReveriePaint 自研的原生高性能工程归档格式，采用标准 ZIP 封装协议：
          </p>
          <ul class="bullet-list">
            <li><strong>manifest.json：</strong>记录画布分辨率、色彩空间、图层组织层级树与混合模式元数据</li>
            <li><strong>无损分块位图：</strong>图层像素采用无损压缩分块存储，大幅降低读写功耗与存盘耗时</li>
            <li><strong>timelapse.bin：</strong>内嵌笔画事件流二进制记录，无损保留作画过程全轨迹</li>
          </ul>
        </section>

        <section id="timelapse-record" class="doc-section">
          <h2>
            <a href="#timelapse-record" class="anchor">#</a>
            无损笔迹延时摄影回放
          </h2>
          <p>
            ReveriePaint 的延时摄影与传统手机录屏具有本质差异：
          </p>
          <div class="feature-bullets">
            <div class="bullet-card">
              <strong>事件流记录：</strong>后台仅记录笔尖坐标、压力传感器数据与工具切换事件，几乎零 CPU/GPU 功耗占用，工程体积仅增加数兆字节
            </div>
            <div class="bullet-card">
              <strong>无损 4K 生成：</strong>导出延时摄影时，由后台渲染内核以原始分辨率重新仿真回放画画过程，输出清晰度极高的 4K MP4 视频，无任何界面遮挡
            </div>
          </div>
        </section>

        <section id="file-interop" class="doc-section">
          <h2>
            <a href="#file-interop" class="anchor">#</a>
            跨软件文件互通与导出
          </h2>
          <p>
            在「导出」面板中提供多种跨平台文件转换支持：
          </p>
          <ul class="bullet-list">
            <li><strong>.kra：</strong>Krita 原生标准规范，100% 完整保留正片叠底与继承透明度设置</li>
            <li><strong>.psd：</strong>Photoshop 分层文档，便于导入桌面端继续排版修图</li>
            <li><strong>TIFF：</strong>印刷工业级位图，无损色彩压缩</li>
            <li><strong>PNG / WebP / JPG：</strong>适合网络分享与社交平台发布的通用平片格式</li>
          </ul>
        </section>

        <!-- 11. 问题与社群 -->
        <section id="feedback" class="doc-section">
          <h2>
            <a href="#feedback" class="anchor">#</a>
            Bug 反馈与 GitHub 规范
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
        </section>

        <section id="community" class="doc-section">
          <h2>
            <a href="#community" class="anchor">#</a>
            创作者交流群
          </h2>
          <p>
            欢迎加入画师社群交流作画技巧、反馈建议或抢先体验测试安装包：
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
            <a href="https://github.com/LanRhyme/ReveriePaint/releases" target="_blank" rel="noopener">Releases</a>
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
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--line-strong);
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--ink);
  cursor: pointer;
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
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding-right: 16px;
  border-right: 1px solid var(--line-faint);
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
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft-2);
  padding: 3px 6px;
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
  padding: 5px 8px;
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
.search-empty {
  font-size: 0.8125rem;
  color: var(--ink-ghost);
  padding: 10px 8px;
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
  margin: 20px 0 10px;
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
  border-radius: 8px;
  border: 1px solid var(--line);
  background: #fff;
}
.doc-table {
  width: 100%;
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
  right: 28px;
  bottom: 28px;
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
  .docs-viewport {
    gap: 24px;
    padding: 24px 16px 80px;
  }
  .docs-sidebar {
    position: fixed;
    top: 58px;
    left: 0;
    bottom: 0;
    width: 260px;
    background: var(--paper);
    z-index: 90;
    padding: 20px 16px;
    border-right: 1px solid var(--line);
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  }
  .docs-sidebar.is-open {
    transform: translateX(0);
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    top: 58px;
    background: rgba(20, 22, 26, 0.3);
    z-index: 80;
    backdrop-filter: blur(2px);
  }
  .mobile-menu-btn {
    display: block;
  }
  .header-search {
    max-width: 200px;
  }
  .header-copy-btn {
    display: none;
  }
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0 14px;
  }
  .header-search {
    display: none;
  }
  .doc-title {
    font-size: 1.6rem;
  }
  .layer-steps {
    grid-template-columns: 1fr;
  }
  .tool-row {
    flex-direction: column;
    gap: 4px;
  }
  .tool-head {
    width: auto;
  }
  .qq-clean-box {
    flex-direction: column;
    align-items: flex-start;
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
