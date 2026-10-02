import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ReveriePaint 文档',
  description: '基于 Krita 核心渲染架构的 Android 原生数字绘画系统官方文档',
  base: '/docs/',
  outDir: '../dist/docs',
  cleanUrls: true,
  lastUpdated: true,
  head: [
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
      { text: '使用文档', link: '/guide/intro' },
      { text: 'Mirror酱', link: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android' },
      { text: 'GitHub', link: 'https://github.com/LanRhyme/ReveriePaint' }
    ],
    sidebar: {
      '/': [
        {
          text: '01 入门与手势',
          collapsed: false,
          items: [
            { text: '软件架构与安装授权', link: '/guide/intro' },
            { text: '主界面与工具栏定制', link: '/guide/interface' },
            { text: '触控手势与快捷操作', link: '/guide/gestures' }
          ]
        },
        {
          text: '02 图层与核心机制',
          collapsed: false,
          items: [
            { text: '图层体系与混合模式', link: '/guide/layers' },
            { text: '单图层孤立与 Alpha 锁定', link: '/guide/isolate-alpha' },
            { text: '继承不透明度实战', link: '/guide/inherit-alpha' }
          ]
        },
        {
          text: '03 手写笔与工坊',
          collapsed: false,
          items: [
            { text: '多品牌手写笔与压感声学', link: '/guide/stylus' },
            { text: '笔刷工坊与 ABR 导入', link: '/guide/brush-studio' }
          ]
        },
        {
          text: '04 创作与进阶工具',
          collapsed: false,
          items: [
            { text: '色彩面板与 3D 光影球', link: '/guide/color-tools' },
            { text: '几何形状、透视与对称系统', link: '/guide/shapes-guides' },
            { text: '流动蚂蚁线选区与液化形变', link: '/guide/selection-transform' },
            { text: '35 种滤镜与线稿提取', link: '/guide/filters' },
            { text: '逐帧动画与洋葱皮', link: '/guide/animation' }
          ]
        },
        {
          text: '05 工程与社群',
          collapsed: false,
          items: [
            { text: '工程安全、WebDAV 与延时摄影', link: '/guide/project' },
            { text: '问题反馈与创作者群', link: '/guide/community' },
            { text: '参与文档贡献指南', link: '/guide/contributing' }
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
