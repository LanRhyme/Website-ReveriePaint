import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataFilePath = path.resolve(__dirname, '../src/data/latest-release.json')

async function fetchLatestRelease() {
  const headers = {
    'User-Agent': 'Website-ReveriePaint-Builder',
    Accept: 'application/vnd.github.v3+json'
  }

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch('https://api.github.com/repos/LanRhyme/ReveriePaint/releases/latest', { headers })
    if (!res.ok) {
      console.warn(`[fetch-release] GitHub API returned status ${res.status}, keeping existing data`)
      return
    }

    const data = await res.json()
    if (!data || !data.tag_name) return

    const assets = data.assets || []
    // 优先匹配标准架构包
    const arm64Asset = assets.find((a) => a.name && (a.name.includes('arm64') || (a.name.endsWith('.apk') && !a.name.includes('armeabi') && !a.name.includes('armv7') && !a.name.includes('x86'))))
    const armv7Asset = assets.find((a) => a.name && (a.name.includes('armeabi') || a.name.includes('armv7')))
    const mainApkAsset = arm64Asset || assets.find((a) => a.name && a.name.endsWith('.apk'))

    // 读取既有兜底配置（保留个性化提示）
    let existingData = {}
    try {
      if (fs.existsSync(dataFilePath)) {
        existingData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
      }
    } catch {
      // 忽略解析错误
    }

    const releaseData = {
      version: data.tag_name,
      name: data.name || `ReveriePaint ${data.tag_name}`,
      apkName: mainApkAsset ? mainApkAsset.name : `ReveriePaint-${data.tag_name}.apk`,
      size: mainApkAsset && mainApkAsset.size ? `${(mainApkAsset.size / (1024 * 1024)).toFixed(1)} MB` : (existingData.size || '90.0 MB'),
      sizeBytes: mainApkAsset ? mainApkAsset.size : (existingData.sizeBytes || 94380559),
      date: data.published_at ? data.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      githubUrl: mainApkAsset ? mainApkAsset.browser_download_url : `https://github.com/LanRhyme/ReveriePaint/releases/download/${data.tag_name}/ReveriePaint-${data.tag_name}.apk`,
      releasesPage: data.html_url || `https://github.com/LanRhyme/ReveriePaint/releases/tag/${data.tag_name}`,
      mirrorChyanUrl: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android',
      qqGroup: '729283213',
      body: data.body || existingData.body || '',
      architectures: {
        'arm64-v8a': {
          name: '64 位 (ARM64-v8a)',
          badge: '主流推荐',
          apkName: mainApkAsset ? mainApkAsset.name : `ReveriePaint-${data.tag_name}.apk`,
          size: mainApkAsset && mainApkAsset.size ? `${(mainApkAsset.size / (1024 * 1024)).toFixed(1)} MB` : '90.0 MB',
          sizeBytes: mainApkAsset ? mainApkAsset.size : 94380559,
          githubUrl: mainApkAsset ? mainApkAsset.browser_download_url : `https://github.com/LanRhyme/ReveriePaint/releases/download/${data.tag_name}/ReveriePaint-${data.tag_name}.apk`,
          available: !!mainApkAsset
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

    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true })
    fs.writeFileSync(dataFilePath, JSON.stringify(releaseData, null, 2), 'utf-8')
    console.log(`[fetch-release] Successfully synced latest release ${data.tag_name} to latest-release.json`)
  } catch (err) {
    console.warn('[fetch-release] Failed to fetch latest release from GitHub API:', err.message)
    console.warn('[fetch-release] Using cached latest-release.json')
  }
}

fetchLatestRelease()
