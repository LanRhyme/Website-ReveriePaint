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

    const apkAsset = (data.assets || []).find((a) => a.name && a.name.endsWith('.apk'))

    const releaseData = {
      version: data.tag_name,
      name: data.name || `ReveriePaint ${data.tag_name}`,
      apkName: apkAsset ? apkAsset.name : 'ReveriePaint-latest.apk',
      size: apkAsset && apkAsset.size ? `${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB` : '80.2 MB',
      sizeBytes: apkAsset ? apkAsset.size : 84130031,
      date: data.published_at ? data.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      githubUrl: apkAsset ? apkAsset.browser_download_url : `https://github.com/LanRhyme/ReveriePaint/releases/download/${data.tag_name}/ReveriePaint-${data.tag_name}.apk`,
      releasesPage: data.html_url || `https://github.com/LanRhyme/ReveriePaint/releases/tag/${data.tag_name}`,
      mirrorChyanUrl: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android',
      qqGroup: '729283213',
      body: data.body || ''
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
