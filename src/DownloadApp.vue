<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useI18n } from './composables/useI18n.js'
import { isFineHoverPointer } from './composables/useGsap.js'

const { t, isEn } = useI18n()

// 默认稳定元数据（即使 GitHub API 遭遇 Rate Limit 也能 100% 毫秒级展示）
const FALLBACK_RELEASE = {
  version: 'v1.4.1',
  name: 'ReveriePaint v1.4.1 正式版',
  apkName: 'ReveriePaint-v1.4.1.apk',
  size: '80.2 MB',
  sizeBytes: 84130031,
  date: '2026-10-04',
  githubUrl: 'https://github.com/LanRhyme/ReveriePaint/releases/download/v1.4.1/ReveriePaint-v1.4.1.apk',
  releasesPage: 'https://github.com/LanRhyme/ReveriePaint/releases',
  mirrorChyanUrl: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android',
  qqGroup: '729283213'
}

const release = ref({ ...FALLBACK_RELEASE })
const isLoading = ref(false)
const copied = ref(false)
const copiedQQ = ref(false)

// 加速节点列表
const PROXY_NODES = [
  {
    id: 'gh-proxy-com',
    name: 'gh-proxy.com',
    badge: '首选加速',
    prefix: 'https://gh-proxy.com/',
    desc: '国内骨干优化，免翻墙满速直连'
  },
  {
    id: 'ghproxy-net',
    name: 'ghproxy.net',
    badge: '备用通道',
    prefix: 'https://ghproxy.net/',
    desc: '高带宽镜像备用加速节点'
  },
  {
    id: 'gh-proxy-org',
    name: 'gh-proxy.org',
    badge: '多线节点',
    prefix: 'https://gh-proxy.org/',
    desc: '多线路负载均衡加速'
  },
  {
    id: 'direct',
    name: 'GitHub 官方源',
    badge: '海外直连',
    prefix: '',
    desc: 'GitHub 官方原始直链'
  }
]

const selectedNodeId = ref('gh-proxy-com')

const activeNode = computed(() => {
  return PROXY_NODES.find(n => n.id === selectedNodeId.value) || PROXY_NODES[0]
})

const activeDownloadUrl = computed(() => {
  const node = activeNode.value
  if (!node.prefix) {
    return release.value.githubUrl
  }
  return `${node.prefix}${release.value.githubUrl}`
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

    const apkAsset = (data.assets || []).find(a => a.name && a.name.endsWith('.apk'))

    if (apkAsset) {
      release.value = {
        version: data.tag_name,
        name: data.name || `ReveriePaint ${data.tag_name}`,
        apkName: apkAsset.name,
        size: apkAsset.size ? `${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB` : '80.2 MB',
        sizeBytes: apkAsset.size || 84130031,
        date: data.published_at ? data.published_at.slice(0, 10) : '2026-10-04',
        githubUrl: apkAsset.browser_download_url,
        releasesPage: data.html_url || FALLBACK_RELEASE.releasesPage,
        mirrorChyanUrl: FALLBACK_RELEASE.mirrorChyanUrl,
        qqGroup: FALLBACK_RELEASE.qqGroup
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
  fetchLatestRelease()
})
</script>

<template>
  <div class="download-page">
    <AppHeader />

    <main class="download-main">
      <div class="shell">
        <!-- 面包屑与顶部提示 -->
        <nav class="breadcrumb" aria-label="页面路径">
          <a href="/">{{ isEn ? 'Home' : '官网首页' }}</a>
          <span class="sep">/</span>
          <span class="current">{{ isEn ? 'Download APK' : '下载最新版' }}</span>
        </nav>

        <!-- 页面标题区域 -->
        <header class="download-header">
          <div class="eyebrow">{{ isEn ? 'OFFICIAL DISTRIBUTION · HIGH SPEED' : '官方发布 · 高速通道' }}</div>
          <h1 class="h-display download-title">
            {{ isEn ? 'Download ReveriePaint' : '下载 ReveriePaint 最新版' }}
          </h1>
          <p class="lede download-sub">
            {{ isEn
              ? 'Professional open-source digital painting tool for Android tablets & phones. Direct fast download powered by gh-proxy acceleration mirrors.'
              : '专为 Android 平板与手机打造的原生专业数字绘画工具。搭载 Krita C++ 核心图像处理内核，提供官方原源与 gh-proxy 国内极速直链下载'
            }}
          </p>
        </header>

        <!-- 核心下载卡片 -->
        <section id="download-action" class="hero-dl-card">
          <div class="card-glow" aria-hidden="true"></div>

          <div class="card-inner">
            <div class="app-summary">
              <div class="app-icon">
                <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
                  <rect x="2" y="2" width="40" height="40" rx="9" fill="var(--ink)" />
                  <path d="M12.8 31.2 L22 12.8 L31.2 31.2" fill="none" stroke="var(--paper)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="22" cy="26" r="3" fill="var(--paper)" />
                </svg>
              </div>
              <div class="app-meta-text">
                <div class="title-row">
                  <h2 class="app-name">ReveriePaint</h2>
                  <span class="version-tag">{{ release.version }}</span>
                  <span class="latest-pill">{{ isEn ? 'Latest' : '正式版' }}</span>
                </div>
                <div class="file-name-row">
                  <code>{{ release.apkName }}</code>
                </div>
              </div>
            </div>

            <!-- 参数指标条 -->
            <div class="specs-bar">
              <div class="spec-cell">
                <span class="spec-label">{{ isEn ? 'Package Size' : '安装包大小' }}</span>
                <span class="spec-val">{{ release.size }}</span>
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
                <span class="spec-val">ARM64-v8a</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">{{ isEn ? 'License' : '开源协议' }}</span>
                <span class="spec-val">GPL-3.0</span>
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
                <span class="switch-hint">{{ isEn ? 'Recommended: gh-proxy.com' : '国内网络推荐使用 gh-proxy 节点' }}</span>
              </div>

              <div class="proxy-pills">
                <button
                  v-for="node in PROXY_NODES"
                  :key="node.id"
                  type="button"
                  class="proxy-pill"
                  :class="{ active: selectedNodeId === node.id }"
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
              <a
                class="btn-dl-main"
                :href="activeDownloadUrl"
                target="_blank"
                rel="noopener"
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
                    {{ activeNode.name }} · {{ release.size }}
                  </span>
                </div>
              </a>

              <button
                type="button"
                class="btn-dl-copy"
                @click="copyDownloadLink"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                  <path d="M3 11 V3 h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                </svg>
                <span>{{ copied ? (isEn ? 'Copied' : '已复制直链') : (isEn ? 'Copy Direct Link' : '复制下载直链') }}</span>
              </button>
            </div>

            <div class="url-preview">
              <span class="url-label">{{ isEn ? 'Download Link' : '当前调用链接' }}:</span>
              <code class="url-text">{{ activeDownloadUrl }}</code>
            </div>
          </div>
        </section>

        <!-- 备用分发渠道卡片 -->
        <section class="channels-section">
          <div class="section-title-wrap">
            <h2 class="h-section">{{ isEn ? 'Alternative Channels' : '备用与多元分流渠道' }}</h2>
            <p class="lede">{{ isEn ? 'Choose the channel that best suits your network conditions.' : '若上述通道下载受限，可通过以下途径高速获取应用包与最新构建' }}</p>
          </div>

          <div class="channels-grid">
            <!-- Mirror酱 -->
            <div class="channel-card">
              <div class="ch-icon mirror-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M8 12 L11 15 L16 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="ch-info">
                <h3>Mirror酱 国内应用镜像</h3>
                <p>专为大陆安卓用户打造的开源软件托管镜像，国内云服务器高速节点直连</p>
              </div>
              <a
                class="ch-btn"
                :href="release.mirrorChyanUrl"
                target="_blank"
                rel="noopener"
              >
                <span>前往 Mirror酱</span>
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d="M4 12 L12 4 M6 4 h6 v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </a>
            </div>

            <!-- QQ群分流 -->
            <div class="channel-card">
              <div class="ch-icon qq-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path d="M12 3 C7 3 4 7 4 12 C4 15 5.5 17.5 7 19 L6 22 L9.5 20.5 C10.3 20.8 11.1 21 12 21 C17 21 20 17 20 12 C20 7 17 3 12 3 Z" fill="none" stroke="currentColor" stroke-width="1.7"/>
                </svg>
              </div>
              <div class="ch-info">
                <h3>QQ 官方交流群文件</h3>
                <p>群号: 729283213 · 群文件包含历史所有版本安装包、笔刷预设包与内测构建</p>
              </div>
              <div class="ch-btn-group">
                <button
                  type="button"
                  class="ch-btn"
                  @click="copyQQ"
                >
                  <span>{{ copiedQQ ? '已复制群号' : '复制群号 729283213' }}</span>
                </button>
                <a
                  class="ch-btn ch-btn-ghost"
                  href="https://qm.qq.com/q/729283213"
                  target="_blank"
                  rel="noopener"
                >
                  <span>一键加群</span>
                </a>
              </div>
            </div>

            <!-- GitHub Releases -->
            <div class="channel-card">
              <div class="ch-icon gh-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" fill="currentColor"/>
                </svg>
              </div>
              <div class="ch-info">
                <h3>GitHub 全部 Releases 归档</h3>
                <p>查看历史里程碑版本、源码压缩包（Source code）与完整提交记录</p>
              </div>
              <a
                class="ch-btn"
                :href="release.releasesPage"
                target="_blank"
                rel="noopener"
              >
                <span>浏览 Releases ↗</span>
              </a>
            </div>
          </div>
        </section>

        <!-- 更新日志区域 -->
        <section class="changelog-section">
          <div class="section-title-wrap">
            <div class="eyebrow">{{ isEn ? 'RELEASE NOTES' : '更新日志' }}</div>
            <h2 class="h-section">{{ release.version }} {{ isEn ? 'Changelog' : '版本特性详情' }}</h2>
          </div>

          <div class="changelog-card">
            <div class="change-group">
              <h3 class="group-title feat-title">
                <span class="group-badge feat-badge">NEW</span>
                <span>新增特性 (Features)</span>
              </h3>
              <ul class="change-list">
                <li>
                  <b>笔刷工作台全参数高阶贝塞尔动态响应曲线编辑器</b>：对标桌面级数字绘画系统，笔刷全属性支持任意增删控制点、曲线预设、翻转与步进微调；试画板支持实时发光光点游标与输入/输出动态追踪
                </li>
                <li>
                  <b>13 种 Krita 物理级传感器矩阵全面接入</b>：支持压力、速度、运笔角、俯仰倾角、方位倾角、倾角 X/Y、笔身旋转、切向压感、渐隐、距离、时间与随机噪点
                </li>
                <li>
                  <b>禁用画布触控快捷开关</b>：快捷操作悬浮栏与快捷键系统新增「禁用画布触控」独立开关，开启后画布仅响应手写笔绘制，彻底杜绝手掌与手指误触线条
                </li>
              </ul>
            </div>

            <div class="change-group">
              <h3 class="group-title fix-title">
                <span class="group-badge fix-badge">FIX</span>
                <span>缺陷修复与架构调优 (Bug Fixes & Refinements)</span>
              </h3>
              <ul class="change-list">
                <li>
                  <b>大笔刷调度与全大核芯片架构优化</b>：优化笔刷在鸿蒙系统（HarmonyOS）及搭配全大核/特定芯片架构（如小米 Pad 9 Pro 等）上的调度性能，消除大尺寸笔刷高速运笔时的卡顿
                </li>
                <li>
                  <b>透明画布液化残影修复与 GPU 实时代理预览</b>：重构推抹、重建、平滑、旋转与缩放交互，彻底解决透明画布液化操作时的性能衰减与像素残影
                </li>
                <li>
                  <b>双指旋转实时吸附与平滑释放</b>：双指旋转画布时实时对齐并吸附 0°、90°、180° 等标准角度，手势释放时平滑无缝过渡
                </li>
                <li>
                  <b>参考窗口旋转吸色几何偏差修复</b>：修复参考图旋转状态下吸色点几何坐标换算偏移的问题，移除十字瞄准线干扰
                </li>
                <li>
                  <b>作品工程复制后台异步化</b>：将主页作品复制流程移至后台异步线程执行并显示平滑处理进度，避免大尺寸高图层工程复制时阻塞主界面
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 安装引导与安全解答 -->
        <section class="faq-section">
          <div class="section-title-wrap">
            <div class="eyebrow">{{ isEn ? 'HELP & TIPS' : '安装说明' }}</div>
            <h2 class="h-section">{{ isEn ? 'Installation FAQ' : '安装与使用常见问题' }}</h2>
          </div>

          <div class="faq-grid">
            <div class="faq-card">
              <h4>系统提示「未在应用商店收录」或安全警告？</h4>
              <p>
                ReveriePaint 是一项由社区推动的纯开源非营利项目，未向华为、小米、OPPO、vivo 等手机厂商支付高额应用市场年费与上架认证费。在系统拦截页面点击「继续安装」或在设置中退出「纯净模式」即可。代码全量开源于 GitHub，完全无广告、无内购、零后台追踪。
              </p>
            </div>

            <div class="faq-card">
              <h4>手写笔压感与防误触如何正确设置？</h4>
              <p>
                安装后首次启动，建议进入应用内「设置 - 手写笔与压感」校准设备的压感过渡曲线。在作画界面，建议点击快捷工具栏的「禁用画布触控」开关，开启后主画布仅响应手写笔笔尖绘制，手指可专注于双指缩放与画布旋转，实现完美的防误触体验。
              </p>
            </div>

            <div class="faq-card">
              <h4>如何更新到后续新版本？</h4>
              <p>
                后续版本直接下载新版 APK 覆盖安装即可，您的所有画作、图层、笔刷收藏与工程文件都会完整保留。您也可以在应用内「关于」中检查最新版本发布动态。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.download-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--paper);
  color: var(--ink);
}

.download-main {
  flex: 1;
  padding-top: clamp(84px, 12vh, 120px);
  padding-bottom: clamp(60px, 9vh, 96px);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--ink-soft-2);
  margin-bottom: 24px;
}
.breadcrumb a {
  color: var(--ink-mid);
  transition: color 0.2s;
}
.breadcrumb a:hover {
  color: var(--ink);
}
.breadcrumb .sep {
  opacity: 0.5;
}
.breadcrumb .current {
  color: var(--ink);
  font-weight: 500;
}

.download-header {
  margin-bottom: clamp(28px, 4.4vh, 44px);
}
.download-title {
  margin-top: 8px;
}
.download-sub {
  margin-top: 14px;
  max-width: 68ch;
}

/* ── 核心下载卡片 ──────────────────────────────── */
.hero-dl-card {
  position: relative;
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 20px;
  box-shadow: var(--shadow-l);
  overflow: hidden;
  margin-bottom: clamp(48px, 7.5vh, 76px);
}

.card-inner {
  padding: clamp(26px, 3.6vw, 44px);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.app-summary {
  display: flex;
  align-items: center;
  gap: 18px;
}
.app-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-meta-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.app-name {
  font-size: clamp(1.375rem, 2.4vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}
.version-tag {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 3px 10px;
  background: rgba(20, 22, 26, 0.07);
  border-radius: 6px;
  color: var(--ink);
}
.latest-pill {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 9px;
  background: rgba(91, 127, 199, 0.12);
  color: var(--accent-deep);
  border-radius: 999px;
}
.file-name-row code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--ink-soft-2);
}

/* 参数条 */
.specs-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  background: rgba(20, 22, 26, 0.03);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid var(--line-faint);
}
.spec-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.spec-label {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
}
.spec-val {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink);
}

/* 节点切换 */
.proxy-switch-box {
  background: rgba(20, 22, 26, 0.02);
  border: 1px solid var(--line);
  padding: 18px 22px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.switch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.switch-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink);
}
.switch-hint {
  font-size: 0.75rem;
  color: var(--ink-soft-2);
}
.proxy-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.proxy-pill {
  appearance: none;
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--ink-mid);
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.2s;
  touch-action: manipulation;
}
.proxy-pill:hover {
  border-color: var(--ink-soft);
  color: var(--ink);
}
.proxy-pill.active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
  box-shadow: var(--shadow-s);
}
.p-badge {
  font-size: 0.6875rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
}
.proxy-pill.active .p-badge {
  background: rgba(255, 255, 255, 0.2);
  color: var(--paper);
}
.node-tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--ink-soft-2);
}
.node-tip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

/* 下载行动区 */
.actions-area {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 14px;
}
.btn-dl-main {
  flex: 1 1 280px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: var(--ink);
  color: var(--paper);
  padding: 16px 24px;
  border-radius: 14px;
  box-shadow: var(--shadow-m);
  transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
  touch-action: manipulation;
}
@media (hover: hover) and (pointer: fine) {
  .btn-dl-main:hover {
    background: var(--ink-soft);
    box-shadow: var(--shadow-l);
    transform: translateY(-1px);
  }
}
.btn-dl-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.btn-dl-content {
  display: flex;
  flex-direction: column;
}
.btn-dl-title {
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.btn-dl-sub {
  font-size: 0.75rem;
  opacity: 0.75;
}

.btn-dl-copy {
  appearance: none;
  border: 1px solid var(--line-strong);
  background: rgba(20, 22, 26, 0.04);
  color: var(--ink);
  padding: 14px 20px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
}
@media (hover: hover) and (pointer: fine) {
  .btn-dl-copy:hover {
    background: rgba(20, 22, 26, 0.08);
    border-color: var(--ink);
  }
}

.url-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--ink-soft-2);
  background: rgba(20, 22, 26, 0.03);
  padding: 8px 14px;
  border-radius: 8px;
  overflow: hidden;
}
.url-text {
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-mid);
}

/* ── 备用渠道区域 ──────────────────────────────── */
.channels-section {
  margin-bottom: clamp(48px, 7.5vh, 76px);
}
.section-title-wrap {
  margin-bottom: 24px;
}
.section-title-wrap .lede {
  margin-top: 6px;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.channel-card {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}
@media (hover: hover) and (pointer: fine) {
  .channel-card:hover {
    border-color: var(--line);
    box-shadow: var(--shadow-m);
  }
}
.ch-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  background: rgba(20, 22, 26, 0.05);
}
.ch-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
}
.ch-info p {
  font-size: 0.84375rem;
  color: var(--ink-mid);
  line-height: 1.6;
}
.ch-btn {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink);
  padding: 9px 16px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.05);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
}
@media (hover: hover) and (pointer: fine) {
  .ch-btn:hover {
    background: rgba(20, 22, 26, 0.09);
    border-color: var(--ink);
  }
}
.ch-btn-group {
  margin-top: auto;
  display: flex;
  gap: 8px;
}
.ch-btn-group .ch-btn {
  flex: 1;
}

/* ── 更新日志 ──────────────────────────────────── */
.changelog-section {
  margin-bottom: clamp(48px, 7.5vh, 76px);
}
.changelog-card {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 16px;
  padding: clamp(24px, 3.2vw, 36px);
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.change-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.group-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 600;
}
.group-badge {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}
.feat-badge {
  background: rgba(91, 127, 199, 0.15);
  color: var(--accent-deep);
}
.fix-badge {
  background: rgba(157, 169, 142, 0.2);
  color: #556b46;
}
.change-list {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--ink-mid);
  font-size: 0.875rem;
  line-height: 1.75;
}
.change-list b {
  color: var(--ink);
}

/* ── FAQ ───────────────────────────────────────── */
.faq-section {
  margin-bottom: 24px;
}
.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.faq-card {
  background: var(--card);
  border: 1px solid var(--line-faint);
  border-radius: 14px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.faq-card h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
}
.faq-card p {
  font-size: 0.84375rem;
  color: var(--ink-mid);
  line-height: 1.7;
}

/* ── 触控交互适配 ──────────────────────────────── */
@media (hover: none) and (pointer: coarse) {
  .btn-dl-main:active,
  .btn-dl-copy:active,
  .ch-btn:active,
  .proxy-pill:active {
    opacity: 0.82;
  }
}

@media (max-width: 600px) {
  .specs-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  .actions-area {
    flex-direction: column;
  }
  .btn-dl-copy {
    width: 100%;
  }
  .ch-btn-group {
    flex-direction: column;
  }
}
</style>
