<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import FluidCanvas from './components/FluidCanvas.vue'
import fallbackRelease from './data/latest-release.json'
import { useI18n } from './composables/useI18n.js'
import { isFineHoverPointer } from './composables/useGsap.js'
import { initReveal } from './composables/useReveal.js'

const { t, isEn } = useI18n()

// 解析 GitHub Release Markdown 正文为结构化分组
function parseReleaseNotes(body) {
  if (!body || typeof body !== 'string') return []

  const lines = body.split('\n')
  const groups = []
  let currentGroup = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    // 匹配标题行，如 ### 新增特性 (Features)
    if (line.startsWith('#')) {
      const title = line.replace(/^#+\s*/, '')
      let badge = 'NOTE'
      let type = 'note'
      const lower = title.toLowerCase()

      if (lower.includes('新增') || lower.includes('feat') || lower.includes('new')) {
        badge = 'NEW'
        type = 'feat'
      } else if (lower.includes('修复') || lower.includes('fix') || lower.includes('bug')) {
        badge = 'FIX'
        type = 'fix'
      } else if (lower.includes('优化') || lower.includes('perf') || lower.includes('opt') || lower.includes('调整')) {
        badge = 'OPT'
        type = 'opt'
      }

      currentGroup = {
        title,
        badge,
        type,
        items: []
      }
      groups.push(currentGroup)
      continue
    }

    // 匹配列表条目，如 - **标题**: 描述 或 • 标题: 描述
    const itemMatch = line.match(/^[-*•]\s+(.*)$/)
    if (itemMatch) {
      const content = itemMatch[1].trim()
      let itemTitle = ''
      let itemDesc = content

      // 提取 **标题**: 或普通 标题:
      const colonMatch = content.match(/^(\*\*[^*]+\*\*|[^:：]{2,30})[:：]\s*(.*)$/)
      if (colonMatch) {
        itemTitle = colonMatch[1].replace(/^\*\*|\*\*$/g, '').trim()
        itemDesc = colonMatch[2].trim()
      }

      if (!currentGroup) {
        currentGroup = {
          title: '更新内容',
          badge: 'NEW',
          type: 'feat',
          items: []
        }
        groups.push(currentGroup)
      }

      currentGroup.items.push({
        title: itemTitle,
        desc: itemDesc || content
      })
    } else if (currentGroup && currentGroup.items.length > 0) {
      const lastItem = currentGroup.items[currentGroup.items.length - 1]
      lastItem.desc += ` ${line}`
    }
  }

  return groups
}

const release = ref({ ...fallbackRelease })
const changelogGroups = computed(() => {
  return parseReleaseNotes(release.value.body || fallbackRelease.body)
})
const isLoading = ref(false)
const copied = ref(false)
const copiedQQ = ref(false)

// 下载节点列表（默认官方源，并集成 gh-proxy 等加速镜像）
const PROXY_NODES = [
  {
    id: 'direct',
    name: 'GitHub 官方源',
    badge: '默认官方',
    prefix: '',
    desc: 'GitHub 官方原始发布直链'
  },
  {
    id: 'gh-proxy-com',
    name: 'gh-proxy.com',
    badge: '国内加速',
    prefix: 'https://gh-proxy.com/',
    desc: 'gh-proxy 骨干镜像加速，国内免翻墙满速直连'
  },
  {
    id: 'ghproxy-net',
    name: 'ghproxy.net',
    badge: '备用镜像',
    prefix: 'https://ghproxy.net/',
    desc: '高带宽镜像备用加速节点'
  },
  {
    id: 'gh-proxy-org',
    name: 'gh-proxy.org',
    badge: '多线加速',
    prefix: 'https://gh-proxy.org/',
    desc: '多线路负载均衡加速节点'
  }
]

const selectedNodeId = ref('direct')
const selectedArchId = ref('arm64-v8a')

const ARCH_OPTIONS = computed(() => {
  const archs = release.value.architectures || fallbackRelease.architectures || {}
  return [
    {
      id: 'arm64-v8a',
      name: isEn.value ? '64-bit (ARM64-v8a)' : '64 位 (ARM64-v8a)',
      badge: isEn.value ? 'Recommended' : '主流推荐',
      desc: isEn.value ? 'For modern 64-bit Android tablets & phones' : '适用于绝大多数现代 64 位安卓平板与手机',
      info: archs['arm64-v8a'] || {
        apkName: release.value.apkName,
        size: release.value.size,
        githubUrl: release.value.githubUrl,
        available: true
      }
    },
    {
      id: 'armeabi-v7a',
      name: isEn.value ? '32-bit (ARMv7)' : '32 位 (ARMv7)',
      badge: isEn.value ? 'Legacy' : '兼容旧机',
      desc: isEn.value ? 'For 32-bit legacy devices or specific systems' : '适用于老旧 32 位设备、特定系统或墨水屏平板',
      info: archs['armeabi-v7a'] || {
        apkName: release.value.apkName.replace('.apk', '-armeabi-v7a.apk'),
        size: '~92 MB',
        githubUrl: release.value.githubUrl.replace('.apk', '-armeabi-v7a.apk'),
        available: false,
        note: isEn.value ? 'Available starting next milestone release' : '下个里程碑版本起正式自动随 Release 分发'
      }
    }
  ]
})

const activeArch = computed(() => {
  return ARCH_OPTIONS.value.find(a => a.id === selectedArchId.value) || ARCH_OPTIONS.value[0]
})

const currentApkName = computed(() => {
  return activeArch.value.info?.apkName || release.value.apkName
})

const currentSize = computed(() => {
  return activeArch.value.info?.size || release.value.size
})

const currentRawUrl = computed(() => {
  return activeArch.value.info?.githubUrl || release.value.githubUrl
})

const isArchAvailable = computed(() => {
  return activeArch.value.info?.available !== false
})

const activeNode = computed(() => {
  return PROXY_NODES.find(n => n.id === selectedNodeId.value) || PROXY_NODES[0]
})

const activeDownloadUrl = computed(() => {
  const node = activeNode.value
  const rawUrl = currentRawUrl.value
  if (!node.prefix) {
    return rawUrl
  }
  return `${node.prefix}${rawUrl}`
})

async function fetchLatestRelease() {
  isLoading.value = true
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3500)

  try {
    const res = await fetch('https://api.github.com/repos/LanRhyme/ReveriePaint/releases/latest', {
      signal: controller.signal
    })
    clearTimeout(timer)

    if (!res.ok) return

    const data = await res.json()
    if (!data || !data.tag_name) return

    const assets = data.assets || []
    const arm64Asset = assets.find(a => a.name && (a.name.includes('arm64') || (a.name.endsWith('.apk') && !a.name.includes('armeabi') && !a.name.includes('armv7') && !a.name.includes('x86'))))
    const armv7Asset = assets.find(a => a.name && (a.name.includes('armeabi') || a.name.includes('armv7')))
    const mainApkAsset = arm64Asset || assets.find(a => a.name && a.name.endsWith('.apk'))

    if (mainApkAsset) {
      release.value = {
        version: data.tag_name,
        name: data.name || `ReveriePaint ${data.tag_name}`,
        apkName: mainApkAsset.name,
        size: mainApkAsset.size ? `${(mainApkAsset.size / (1024 * 1024)).toFixed(1)} MB` : fallbackRelease.size,
        sizeBytes: mainApkAsset.size || fallbackRelease.sizeBytes,
        date: data.published_at ? data.published_at.slice(0, 10) : fallbackRelease.date,
        githubUrl: mainApkAsset.browser_download_url,
        releasesPage: data.html_url || fallbackRelease.releasesPage,
        mirrorChyanUrl: fallbackRelease.mirrorChyanUrl,
        qqGroup: fallbackRelease.qqGroup,
        body: data.body || fallbackRelease.body,
        architectures: {
          'arm64-v8a': {
            name: '64 位 (ARM64-v8a)',
            badge: '主流推荐',
            apkName: mainApkAsset.name,
            size: mainApkAsset.size ? `${(mainApkAsset.size / (1024 * 1024)).toFixed(1)} MB` : fallbackRelease.size,
            sizeBytes: mainApkAsset.size || fallbackRelease.sizeBytes,
            githubUrl: mainApkAsset.browser_download_url,
            available: true
          },
          'armeabi-v7a': {
            name: '32 位 (ARMv7)',
            badge: '兼容旧机',
            apkName: armv7Asset ? armv7Asset.name : `ReveriePaint-${data.tag_name}-armeabi-v7a.apk`,
            size: armv7Asset && armv7Asset.size ? `${(armv7Asset.size / (1024 * 1024)).toFixed(1)} MB` : '~92 MB',
            sizeBytes: armv7Asset ? armv7Asset.size : 96468992,
            githubUrl: armv7Asset ? armv7Asset.browser_download_url : `https://github.com/LanRhyme/ReveriePaint/releases/download/${data.tag_name}/ReveriePaint-${data.tag_name}-armeabi-v7a.apk`,
            available: !!armv7Asset,
            note: armv7Asset ? '' : '下个里程碑版本起正式自动随 Release 分发'
          }
        }
      }
    }
  } catch {
    // 保持使用可靠预设数据
  } finally {
    isLoading.value = false
  }
}

function copyDownloadLink() {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(activeDownloadUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  }
}

function copyQQ() {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(release.value.qqGroup)
    copiedQQ.value = true
    setTimeout(() => {
      copiedQQ.value = false
    }, 2500)
  }
}

onMounted(() => {
  initReveal()
  fetchLatestRelease()
})
</script>

<template>
  <div class="download-page">
    <FluidCanvas />
    <AppHeader />

    <main class="download-main">
      <div class="shell">
        <!-- 面包屑与顶部提示 -->
        <nav class="breadcrumb" aria-label="页面路径">
          <a href="/">{{ isEn ? 'ReveriePaint' : 'ReveriePaint' }}</a>
          <span class="sep">/</span>
          <span class="current">{{ isEn ? 'Download' : '下载' }}</span>
        </nav>

        <!-- 页面标题区域 -->
        <header class="download-header sec-head reveal">
          <div class="sec-rail">
            <span class="sec-num">01</span>
            <span class="sec-label">{{ isEn ? 'Download' : '下载' }}</span>
          </div>
          <h1 class="h-display download-title"><span class="line-mask"><span class="line-inner">{{ isEn ? 'Download ReveriePaint' : '下载 ReveriePaint 最新版' }}</span></span></h1>
          <p class="lede sec-sub download-sub">
            {{ isEn
              ? 'Professional open-source digital painting tool for Android tablets & phones. Direct fast download powered by gh-proxy acceleration mirrors.'
              : '专为 Android 平板与手机打造的原生专业数字绘画工具。搭载 Krita C++ 核心图像处理内核，提供官方原源与 gh-proxy 国内极速直链下载'
            }}
          </p>
        </header>

        <!-- 核心下载卡片 -->
        <section id="download-action" class="hero-dl-card reveal">
          <div class="card-inner">
            <div class="app-summary">
              <div class="app-icon" data-cursor="APK">
                <img src="/favicon.png" alt="ReveriePaint" width="48" height="48" class="app-icon-img" />
              </div>
              <div class="app-meta-text">
                <div class="title-row">
                  <h2 class="app-name">ReveriePaint</h2>
                  <span class="version-tag">{{ release.version }}</span>
                  <span class="latest-pill">{{ isEn ? 'Latest' : '正式版' }}</span>
                </div>
                <div class="file-name-row">
                  <code>{{ currentApkName }}</code>
                </div>
              </div>
            </div>

            <!-- 参数指标条 -->
            <div class="specs-bar">
              <div class="spec-cell">
                <span class="spec-label">{{ isEn ? 'Package Size' : '安装包大小' }}</span>
                <span class="spec-val">{{ currentSize }}</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">{{ isEn ? 'Release Date' : '发布日期' }}</span>
                <span class="spec-val">{{ release.date }}</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">{{ isEn ? 'Min System' : '最低系统' }}</span>
                <span class="spec-val">Android 7.0+</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">{{ isEn ? 'Architecture' : '适配架构' }}</span>
                <span class="spec-val">ARM64-v8a / ARMv7</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">{{ isEn ? 'License' : '开源协议' }}</span>
                <span class="spec-val">GPL-3.0</span>
              </div>
            </div>

            <!-- 架构选择器 -->
            <div class="arch-switch-box">
              <div class="switch-header">
                <span class="switch-title">
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <rect x="2" y="2" width="12" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.3" />
                    <rect x="5" y="5" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.2" />
                    <path d="M5 2 V0 M11 2 V0 M5 16 V14 M11 16 V14 M2 5 H0 M2 11 H0 M16 5 H14 M16 11 H14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                  </svg>
                  <span>{{ isEn ? 'Select Chip Architecture' : '选择设备芯片架构' }}</span>
                </span>
                <span class="switch-hint">{{ isEn ? 'ARM64-v8a for modern devices · ARMv7 for legacy 32-bit' : '64 位主流推荐 · 32 位老旧兼容' }}</span>
              </div>

              <div class="arch-pills">
                <button
                  v-for="arch in ARCH_OPTIONS"
                  :key="arch.id"
                  type="button"
                  class="arch-pill"
                  :class="{ active: selectedArchId === arch.id }"
                  :data-cursor="arch.id"
                  @click="selectedArchId = arch.id"
                >
                  <span class="a-name">{{ arch.name }}</span>
                  <span class="a-badge" :class="arch.id">{{ arch.badge }}</span>
                </button>
              </div>

              <div class="node-tip">
                <span class="node-tip-dot"></span>
                <span>{{ activeArch.desc }}</span>
                <span v-if="activeArch.info?.note" class="arch-status-note">（{{ activeArch.info.note }}）</span>
              </div>
            </div>

            <!-- 加速节点切换器 -->
            <div class="proxy-switch-box">
              <div class="switch-header">
                <span class="switch-title">
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M8 1 L14 4 L14 12 L8 15 L2 12 L2 4 Z" fill="none" stroke="currentColor" stroke-width="1.3" />
                    <path d="M8 4 L8 12 M2 4 L8 8 L14 4" fill="none" stroke="currentColor" stroke-width="1.3" />
                  </svg>
                  <span>{{ isEn ? 'Select Download Mirror Node' : '选择下载通道与加速镜像' }}</span>
                </span>
                <span class="switch-hint">{{ isEn ? 'Default: Official GitHub · gh-proxy mirrors available' : '默认官方源 · 支持一键切换 gh-proxy 加速镜像' }}</span>
              </div>

              <div class="proxy-pills">
                <button
                  v-for="node in PROXY_NODES"
                  :key="node.id"
                  type="button"
                  class="proxy-pill"
                  :class="{ active: selectedNodeId === node.id }"
                  :data-cursor="node.id === 'direct' ? 'OFFICIAL' : 'MIRROR'"
                  @click="selectedNodeId = node.id"
                >
                  <span class="p-name">{{ node.name }}</span>
                  <span class="p-badge">{{ node.badge }}</span>
                </button>
              </div>

              <div class="node-tip">
                <span class="node-tip-dot"></span>
                <span>{{ activeNode.desc }}</span>
              </div>
            </div>

            <!-- 核心行动按钮区 -->
            <div class="actions-area">
              <template v-if="isArchAvailable">
                <a
                  class="btn-dl-main"
                  :href="activeDownloadUrl"
                  target="_blank"
                  rel="noopener"
                  data-cursor="DOWNLOAD"
                >
                  <div class="btn-dl-icon">
                    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                      <path d="M10 3 L10 13 M6 9 L10 13 L14 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3 15 C3 16.1 3.9 17 5 17 L15 17 C16.1 17 17 16.1 17 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="btn-dl-content">
                    <span class="btn-dl-title">
                      {{ isEn ? 'Download APK Now' : '立即高速下载 APK' }}
                    </span>
                    <span class="btn-dl-sub">
                      {{ activeArch.name }} · {{ activeNode.name }} · {{ currentSize }}
                    </span>
                  </div>
                </a>

                <button
                  type="button"
                  class="btn-dl-copy"
                  data-cursor="COPY"
                  @click="copyDownloadLink"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                    <path d="M3 11 V3 h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                  </svg>
                  <span>{{ copied ? (isEn ? 'Copied' : '已复制直链') : (isEn ? 'Copy Direct Link' : '复制下载直链') }}</span>
                </button>
              </template>

              <template v-else>
                <div class="btn-dl-disabled">
                  <div class="btn-dl-icon">
                    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/>
                      <path d="M6 10 H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="btn-dl-content">
                    <span class="btn-dl-title">
                      {{ isEn ? '32-bit Build Available in Next Release' : '当前 1.4.10 暂未开放 32 位在线下载' }}
                    </span>
                    <span class="btn-dl-sub">
                      {{ isEn ? 'Support will be officially integrated from next milestone release' : '底层构建与 CI 自动化已就绪，将于下个里程碑版本起正式随 Release 发布' }}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  class="btn-dl-copy"
                  data-cursor="SWITCH"
                  @click="selectedArchId = 'arm64-v8a'"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M4 8 h8 M8 4 l4 4 -4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ isEn ? 'Switch to 64-bit Build' : '切换至 64 位版本' }}</span>
                </button>
              </template>
            </div>

            <div class="url-preview">
              <span class="url-label">{{ isEn ? 'Download Link' : '当前调用链接' }}:</span>
              <code class="url-text">{{ activeDownloadUrl }}</code>
            </div>
          </div>
        </section>

        <!-- 备用分发渠道卡片 -->
        <section class="channels-section">
          <header class="sec-head reveal">
            <div class="sec-rail">
              <span class="sec-num">02</span>
              <span class="sec-label">{{ isEn ? 'Channels' : '备用渠道' }}</span>
            </div>
            <h2 class="h-section"><span class="line-mask"><span class="line-inner">{{ isEn ? 'Alternative Channels' : '备用与多元分流渠道' }}</span></span></h2>
            <p class="lede sec-sub">{{ isEn ? 'Choose the channel that best suits your network conditions.' : '若上述通道下载受限，可通过以下途径高速获取应用包与最新构建' }}</p>
          </header>

          <div class="channels-grid">
            <!-- Mirror酱 -->
            <article class="channel">
              <div class="ch-head">
                <span class="ch-num">01</span>
                <h3>Mirror酱 国内镜像</h3>
              </div>
              <p class="body-text">专为大陆安卓用户打造的开源软件托管镜像，国内云服务器高速节点直连。</p>
              <div class="ch-links">
                <a class="ch-link" :href="release.mirrorChyanUrl" target="_blank" rel="noopener">
                  <span>前往 Mirror酱</span>
                  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                    <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </a>
              </div>
            </article>

            <!-- QQ群分流 -->
            <article class="channel">
              <div class="ch-head">
                <span class="ch-num">02</span>
                <h3>QQ 群文件</h3>
              </div>
              <p class="body-text">群号 729283213，群文件保存历史版本安装包、笔刷预设包与内测构建。</p>
              <div class="ch-links">
                <button type="button" class="ch-link" @click="copyQQ">
                  <span>{{ copiedQQ ? '已复制群号' : '复制群号 729283213' }}</span>
                </button>
                <a class="ch-link" href="https://qm.qq.com/q/729283213" target="_blank" rel="noopener">
                  <span>一键加群</span>
                  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                    <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </a>
              </div>
            </article>

            <!-- GitHub Releases -->
            <article class="channel">
              <div class="ch-head">
                <span class="ch-num">03</span>
                <h3>GitHub Releases</h3>
              </div>
              <p class="body-text">历史里程碑版本、源码压缩包与完整提交记录都在这里。</p>
              <div class="ch-links">
                <a class="ch-link" :href="release.releasesPage" target="_blank" rel="noopener">
                  <span>浏览 Releases</span>
                  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                    <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </a>
              </div>
            </article>
          </div>
        </section>

        <!-- 更新日志区域 -->
        <section class="changelog-section">
          <header class="sec-head reveal">
            <div class="sec-rail">
              <span class="sec-num">03</span>
              <span class="sec-label">{{ isEn ? 'Release Notes' : '更新日志' }}</span>
            </div>
            <h2 class="h-section"><span class="line-mask"><span class="line-inner">{{ release.version }} {{ isEn ? 'Changelog' : '版本特性详情' }}</span></span></h2>
            <p class="lede sec-sub">{{ isEn ? 'What changed in this build.' : '本次构建的改动明细' }}</p>
          </header>

          <div class="changelog-card">
            <div
              v-for="group in changelogGroups"
              :key="group.title"
              class="change-group"
            >
              <h3 :class="['group-title', `${group.type}-title`]">
                <span :class="['group-badge', `${group.type}-badge`]">{{ group.badge }}</span>
                <span>{{ group.title }}</span>
              </h3>
              <ul class="change-list">
                <li v-for="(item, idx) in group.items" :key="idx">
                  <b v-if="item.title">{{ item.title }}：</b>
                  <span>{{ item.desc }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 安装引导与安全解答 -->
        <section class="faq-section">
          <header class="sec-head reveal">
            <div class="sec-rail">
              <span class="sec-num">04</span>
              <span class="sec-label">{{ isEn ? 'Install' : '安装说明' }}</span>
            </div>
            <h2 class="h-section"><span class="line-mask"><span class="line-inner">{{ isEn ? 'Installation FAQ' : '安装与使用常见问题' }}</span></span></h2>
            <p class="lede sec-sub">{{ isEn ? 'Common questions before first launch.' : '首次安装与启动前后常被问到的问题' }}</p>
          </header>

          <div class="faq-grid">
            <article class="faq-card">
              <span class="ch-num">01</span>
              <h4>系统提示「未在应用商店收录」或安全警告？</h4>
              <p>ReveriePaint 是由社区推动的纯开源非营利项目，未向各家应用市场支付上架年费与认证费。在系统拦截页面点击「继续安装」，或在设置中退出「纯净模式」即可。代码全量开源于 GitHub，无广告、无内购、无后台追踪。</p>
            </article>

            <article class="faq-card">
              <span class="ch-num">02</span>
              <h4>手写笔压感与防误触如何设置？</h4>
              <p>首次启动后进入「设置 - 手写笔与压感」校准压感过渡曲线。作画时打开快捷工具栏的「禁用画布触控」，主画布只响应笔尖，手指留给双指缩放与画布旋转。</p>
            </article>

            <article class="faq-card">
              <span class="ch-num">03</span>
              <h4>如何更新到后续新版本？</h4>
              <p>直接下载新版 APK 覆盖安装即可，画作、图层、笔刷收藏与工程文件都会保留。也可以在应用内「关于」里检查最新发布。</p>
            </article>
          </div>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
/* ════════════════════════════════════════════════
   下载页：沿用首页的画册版式（章首线 / 编号 / 图版语言）
   ════════════════════════════════════════════════ */
.download-main {
  position: relative;
  z-index: 5;
  padding-top: calc(var(--nav-h) + clamp(18px, 3vh, 30px));
}

/* ── 面包屑：页边注 ───────────────────────────── */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-ghost);
  margin-bottom: clamp(20px, 3vh, 32px);
}
.breadcrumb a {
  color: var(--ink-soft-2);
  transition: color var(--dur-fast);
}
.breadcrumb a:hover {
  color: var(--ink);
}
.breadcrumb .sep {
  color: var(--ink-ghost);
}
.breadcrumb .current {
  color: var(--ink);
}

/* ── 页头 ─────────────────────────────────────── */
.download-header {
  margin-bottom: clamp(32px, 4.5vh, 52px);
}
.download-header .h-display {
  font-size: clamp(1.9rem, 4.2vw, 3.4rem);
  line-height: 1.16;
  letter-spacing: -0.035em;
  grid-column: 1 / 8;
  max-width: 15em;
}
.download-header .sec-sub {
  align-self: end;
  margin-bottom: 0.5em;
}

/* ── 下载面板 ─────────────────────────────────── */
.hero-dl-card {
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--line);
}

.app-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-block: 22px;
  border-bottom: 1px solid var(--line);
}
.app-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border: 1px solid var(--line-strong);
  border-radius: 3px;
  overflow: hidden;
}
.app-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.app-meta-text {
  min-width: 0;
  flex: 1;
}
.title-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
}
.app-name {
  font-size: 1.375rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.2;
}
.version-tag {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.latest-pill {
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ochre);
  border: 1px solid currentColor;
  border-radius: 2px;
  padding: 2px 6px;
}
.file-name-row {
  margin-top: 6px;
}
.file-name-row code {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--ink-soft-2);
  word-break: break-all;
}

/* 规格表：五格，竖线分隔 */
.specs-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-bottom: 1px solid var(--line);
}
.spec-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px 20px 0;
}
.spec-cell + .spec-cell {
  padding-left: 20px;
  border-left: 1px solid var(--line-faint);
}
.spec-label {
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft-2);
}
.spec-val {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.4;
}

/* 选择器 */
.arch-switch-box,
.proxy-switch-box {
  padding-block: 22px;
  border-bottom: 1px solid var(--line);
}
.switch-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.switch-title {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink);
}
.switch-title svg {
  color: var(--ink-ghost);
}
.switch-hint {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  color: var(--ink-soft-2);
}

.arch-pills,
.proxy-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.arch-pill,
.proxy-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid var(--line-strong);
  border-radius: 3px;
  background: transparent;
  font-family: inherit;
  font-size: 0.84375rem;
  color: var(--ink-mid);
  cursor: pointer;
  transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
}
.a-badge,
.p-badge {
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 6px;
  border: 1px solid currentColor;
  border-radius: 2px;
  opacity: 0.6;
}
.arch-pill.active,
.proxy-pill.active {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}
.arch-pill.active .a-badge,
.proxy-pill.active .p-badge {
  opacity: 0.85;
}
@media (hover: hover) and (pointer: fine) {
  .arch-pill:hover:not(.active),
  .proxy-pill:hover:not(.active) {
    border-color: var(--ink-ghost);
    color: var(--ink);
  }
}

.node-tip {
  margin-top: 14px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--ink-mid);
}
.node-tip-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--ochre);
  flex-shrink: 0;
  transform: translateY(-2px);
}
.arch-status-note {
  color: var(--ink-soft-2);
  font-size: 0.75rem;
}

/* 行动区 */
.actions-area {
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding-block: 24px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}
.btn-dl-main {
  flex: 1 1 340px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--ink);
  color: var(--paper);
  border-radius: 3px;
  padding: 16px 22px;
  transition: background var(--dur-fast);
}
@media (hover: hover) and (pointer: fine) {
  .btn-dl-main:hover {
    background: var(--ink-soft);
  }
}
.btn-dl-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 2px;
  flex-shrink: 0;
}
.btn-dl-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.btn-dl-title {
  font-size: 0.9375rem;
  font-weight: 500;
}
.btn-dl-sub {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.04em;
  opacity: 0.62;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-dl-disabled {
  flex: 1 1 340px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px dashed var(--line-strong);
  border-radius: 3px;
  padding: 16px 22px;
  color: var(--ink-soft-2);
}
.btn-dl-disabled .btn-dl-icon {
  border-color: var(--line-strong);
}
.btn-dl-disabled .btn-dl-title {
  color: var(--ink-soft);
}
.btn-dl-disabled .btn-dl-sub {
  opacity: 1;
  color: var(--ink-soft-2);
  white-space: normal;
}

.btn-dl-copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  border: 1px solid var(--line-strong);
  border-radius: 3px;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--ink-soft);
  cursor: pointer;
  transition: border-color var(--dur-fast), color var(--dur-fast);
}
.btn-dl-copy svg {
  color: var(--ink-ghost);
}
@media (hover: hover) and (pointer: fine) {
  .btn-dl-copy:hover {
    border-color: var(--ink-ghost);
    color: var(--ink);
  }
}

/* 直链预览 */
.url-preview {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-block: 14px;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.04em;
  color: var(--ink-ghost);
  overflow: hidden;
}
.url-label {
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.url-text {
  color: var(--ink-soft-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ════════════════════════════════════════════════
   章节
   ════════════════════════════════════════════════ */
.channels-section,
.changelog-section,
.faq-section {
  padding-block: var(--sec-air);
}
.faq-section {
  padding-bottom: clamp(96px, 12vh, 140px);
}

/* ── 备用渠道 ─────────────────────────────────── */
.channels-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--col-gap);
}
.channel {
  display: flex;
  flex-direction: column;
  padding-top: 18px;
  border-top: 1px solid var(--ink);
}
.ch-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.ch-num {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  color: var(--ochre);
  flex-shrink: 0;
}
.channel h3 {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: -0.012em;
}
.channel .body-text {
  margin-top: 10px;
  font-size: 0.84375rem;
  line-height: 1.85;
  color: var(--ink-mid);
  flex: 1;
}
.ch-links {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
}
.ch-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 11px 0;
  border: 0;
  border-top: 1px solid var(--line-faint);
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  color: var(--ink-soft);
  text-align: left;
  cursor: pointer;
  transition: color var(--dur-fast);
}
.ch-link svg {
  color: var(--ink-ghost);
  transition: transform var(--dur-fast) var(--ease-out-expo), color var(--dur-fast);
}
@media (hover: hover) and (pointer: fine) {
  .ch-link:hover {
    color: var(--ink);
  }
  .ch-link:hover svg {
    transform: translate(2px, -2px);
    color: var(--ink);
  }
}

/* ── 更新日志 ─────────────────────────────────── */
.changelog-card {
  border-top: 1px solid var(--ink);
}
.change-group {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--col-gap);
  padding-block: 22px;
  border-bottom: 1px solid var(--line-faint);
}
.group-title {
  grid-column: 1 / 5;
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.6;
}
.group-badge {
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.12em;
  padding: 2px 6px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  color: var(--ink-soft-2);
  flex-shrink: 0;
}
.feat-badge {
  color: var(--ochre);
  border-color: currentColor;
}
.change-list {
  grid-column: 5 / -1;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.change-list li {
  position: relative;
  padding-left: 16px;
  font-size: 0.84375rem;
  line-height: 1.8;
  color: var(--ink-mid);
}
.change-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.78em;
  width: 6px;
  height: 1px;
  background: var(--ink-ghost);
}
.change-list b {
  font-weight: 500;
  color: var(--ink);
}

/* ── 安装说明 ─────────────────────────────────── */
.faq-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--col-gap);
}
.faq-card {
  padding-top: 18px;
  border-top: 1px solid var(--ink);
}
.faq-card h4 {
  margin-top: 12px;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.01em;
}
.faq-card p {
  margin-top: 10px;
  font-size: 0.84375rem;
  line-height: 1.9;
  color: var(--ink-mid);
}

/* ════════════════════════════════════════════════
   响应式
   ════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .specs-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .spec-cell:nth-child(4) {
    padding-left: 0;
    border-left: 0;
  }
  .spec-cell:nth-child(n + 4) {
    border-top: 1px solid var(--line-faint);
  }
  .channels-grid,
  .faq-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 32px;
  }
  .change-group {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 12px;
  }
  .group-title,
  .change-list {
    grid-column: 1;
  }
}

@media (max-width: 700px) {
  .download-main {
    padding-top: calc(var(--nav-h) + 20px);
  }
  .download-header .h-display {
    font-size: clamp(1.75rem, 8vw, 2.25rem);
  }
  .app-summary {
    gap: 12px;
    padding-block: 18px;
  }
  .app-icon {
    width: 40px;
    height: 40px;
  }
  .app-name {
    font-size: 1.1875rem;
  }
  .specs-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .spec-cell {
    padding: 14px 14px 16px 0;
  }
  .spec-cell + .spec-cell {
    padding-left: 14px;
  }
  .spec-cell:nth-child(odd) {
    padding-left: 0;
    border-left: 0;
  }
  .spec-cell:nth-child(n + 3) {
    border-top: 1px solid var(--line-faint);
  }
  .arch-switch-box,
  .proxy-switch-box {
    padding-block: 18px;
  }
  .switch-header {
    margin-bottom: 12px;
  }
  .switch-hint {
    display: none;
  }
  .arch-pill,
  .proxy-pill {
    padding: 9px 12px;
    font-size: 0.8125rem;
  }
  .actions-area {
    padding-block: 18px;
    gap: 8px;
  }
  .btn-dl-main,
  .btn-dl-disabled {
    flex: 1 1 100%;
    padding: 14px 16px;
  }
  .btn-dl-copy {
    justify-content: center;
    width: 100%;
    padding: 13px 16px;
  }
  .btn-dl-sub {
    white-space: normal;
  }
  .url-preview {
    flex-direction: column;
    gap: 4px;
  }
  .channels-grid,
  .faq-grid {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 28px;
  }
  .channels-section,
  .changelog-section,
  .faq-section {
    padding-block: 48px;
  }
}
</style>
