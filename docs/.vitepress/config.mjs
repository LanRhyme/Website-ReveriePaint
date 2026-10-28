import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ReveriePaint 文档',
  description: '基于 Krita 核心渲染架构的 Android 原生数字绘画系统官方文档',
  base: '/docs/',
  outDir: '../dist/docs',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/docs/favicon.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Serif+SC:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap'
    }],
    ['meta', { name: 'theme-color', content: '#8fa382' }]
  ],
  themeConfig: {
    logo: '/favicon.png',
    siteTitle: 'ReveriePaint',
    nav: [
      { text: '官网首页', link: 'https://reveriepaint.lanrhyme.top' },
      { text: '极速下载', link: 'https://reveriepaint.lanrhyme.top/download/' },
      { text: '使用文档', link: '/' },
      { text: 'Mirror酱', link: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android' },
      { text: 'GitHub', link: 'https://github.com/LanRhyme/ReveriePaint' }
    ],
    sidebar: {
      '/': [
        {
          text: '开始',
          collapsed: false,
          items: [
            { text: '概览与文档地图', link: '/' },
            { text: '安装与第一次作画', link: '/guide/install' },
            { text: '界面导览', link: '/guide/interface' },
            { text: '手势与快捷键', link: '/guide/gestures' }
          ]
        },
        {
          text: '绘画',
          collapsed: false,
          items: [
            { text: '画笔与压感', link: '/guide/brush' },
            { text: '手写笔与压感声学', link: '/guide/stylus' },
            { text: '笔刷工坊与导入', link: '/guide/brush-studio' },
            { text: '色彩与取色', link: '/guide/color' },
            { text: '形状、透视与对称', link: '/guide/shapes-guides' },
            { text: '选区、变换与液化', link: '/guide/selection-transform' },
            { text: '滤镜与线稿提取', link: '/guide/filters' }
          ]
        },
        {
          text: '图层',
          collapsed: false,
          items: [
            { text: '图层体系与混合模式', link: '/guide/layers' },
            { text: '剪贴蒙版与继承透明度', link: '/guide/clipping' },
            { text: 'Alpha 锁定与图层孤立', link: '/guide/alpha-lock' },
            { text: '3D 参考图层', link: '/guide/layer-3d' }
          ]
        },
        {
          text: '动画',
          collapsed: false,
          items: [
            { text: '逐帧动画与洋葱皮', link: '/guide/animation' },
            { text: '导出与回放', link: '/guide/export' }
          ]
        },
        {
          text: '工程',
          collapsed: false,
          items: [
            { text: '工程、备份与 WebDAV', link: '/guide/project' },
            { text: '设置与性能', link: '/guide/settings' }
          ]
        },
        {
          text: '参考',
          collapsed: false,
          items: [
            { text: '常见问题', link: '/guide/faq' },
            { text: '问题反馈与创作者群', link: '/guide/community' },
            { text: '参与文档贡献', link: '/guide/contributing' }
          ]
        }
      ]
    },
    editLink: {
      pattern: 'https://github.com/LanRhyme/Website-ReveriePaint/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    lastUpdated: {
      text: '最后更新于'
    },
    outline: {
      level: [2, 3],
      label: '本页大纲'
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题模式',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除搜索条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    }
  }
})
