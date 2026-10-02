import { ref, computed } from 'vue'

const STORAGE_KEY = 'rp_lang'

export const SUPPORTED_LANGS = [
  { id: 'zh-CN', label: '简体中文', short: '简' },
  { id: 'zh-TW', label: '繁體中文', short: '繁' },
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'ja', label: '日本語', short: '日' }
]

function normalizeLang(lang) {
  if (!lang) return 'zh-CN'
  const lower = lang.toLowerCase()
  if (lower === 'zh' || lower === 'zh-cn' || lower === 'zh-hans') return 'zh-CN'
  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo' || lower === 'zh-hant') return 'zh-TW'
  if (lower.startsWith('en')) return 'en'
  if (lower.startsWith('ja')) return 'ja'
  if (lower.startsWith('zh')) return 'zh-CN'
  return 'en'
}

function getInitialLang() {
  if (typeof window === 'undefined') return 'zh-CN'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const normalized = normalizeLang(saved)
    if (SUPPORTED_LANGS.some(l => l.id === normalized)) return normalized
  }
  const browserLang = navigator.language || navigator.userLanguage || ''
  return normalizeLang(browserLang)
}

const currentLang = ref(getInitialLang())

export const messages = {
  'zh-CN': {
    header: {
      tagline: 'Android 原生数字绘画',
      nav: {
        features: '核心特性',
        toolkit: '色彩工坊',
        origin: '设计理念',
        get: '获取应用',
        docs: '使用文档'
      },
      download: '下载',
      mobileDownload: '前往 Releases 下载 APK',
      menu: '导航菜单',
      langTitle: '界面语言'
    },
    hero: {
      eyebrow: 'Android 平板专业创作 · GPL-3.0 开源 · QQ群 729283213',
      titleLine1: '把桌面级图像内核，',
      titleLine2: '装进安卓平板',
      sub: '融合 Krita C++ 原生图像处理内核与现代化触控交互，具备 240+ 官方笔刷预设、动态稀疏瓦片图层、多协议压感手写笔专属调校与全流程事件流延时回放，让专业创作在移动端彻底摆脱妥协',
      downloadApk: '下载 APK',
      docs: '使用文档',
      source: 'GitHub 源码',
      statBrushes: '官方物理笔刷',
      statBlend: '图层混合模式',
      statFilters: '无损实时滤镜',
      statLicense: '永久免费开源',
      unitKinds: ' 种',
      deviceAlt: 'ReveriePaint 画布上绘制的飞龙与猫的线稿',
      deviceNote: '实机界面展示 · Android 平板专业创作体验'
    },
    features: {
      eyebrow: '核心特性',
      title: '不妥协的桌面级创作工作流',
      sub: '摒弃移动端绘画软件常见的阉割与简化，把核心参数控制权完整交还给画师',
      blocks: [
        {
          id: 'bench',
          kicker: '笔刷工坊',
          title: '深植 Krita 原生内核，自由掌控每一道笔触',
          body: '直接复用 Krita 核心笔刷渲染引擎，提供真实的物理笔触与颜料混合模拟，笔尖形状印记、色彩涂抹混合、动态阻尼与压感曲线全开，支持保存为个人专属笔刷预设',
          points: [
            '复用 Krita 官方图像与物理颜料模拟内核',
            '圆形、方形与自定义笔尖贴图导入',
            '完整保留压感动态曲线与参数微调'
          ],
          alt: '笔刷工作台，左侧为参数分类，右侧为笔尖贴图选择、边缘羽化、抗锯齿与随机翻转设置'
        },
        {
          id: 'pen',
          kicker: '手写笔适配',
          title: '硬件级压感调校，深度适配多品牌手写笔',
          body: '针对多品牌手写笔以及标准 Android 触控笔协议提供全方位底层调校，内置自定义压力过渡曲线与悬空光标预览，彻底告别断触与延迟',
          points: [
            '华为 M-Pencil 星闪 16K 压感与侧键手势',
            'OPPO / 一加笔身触控滑动与真实纸感微震',
            '三星 S Pen 与通用 Android 协议深度支持',
            '多控制点自定义压力曲线与实时试笔区'
          ],
          alt: '手写笔设置页，包含多品牌手写笔专属适配与自定义压力曲线微调'
        },
        {
          id: 'lasso',
          kicker: '精准选区',
          title: '逐点可控的多段折线套索',
          body: '专为复杂插画构图打造的折线选区系统，节点落位精准，支持单点独立撤销与无缝闭合，协同加选、减选、反选与实时边缘羽化，让局部精修和构图微调精确到每一个像素',
          points: [
            '逐点精确落位与独立单点回溯撤销',
            '支持加选、减选、反选与实时羽化',
            '自由手绘与折线节点无缝混合'
          ],
          alt: '多段折线套索正在画布上框选区域，下方悬浮工具条提供闭合、撤销与羽化操作'
        },
        {
          id: 'reference',
          kicker: '悬浮参考',
          title: '双模式悬浮参考窗，全局构图尽在掌控',
          body: '画布上方自由悬浮、平移与缩放，不仅支持载入高分辨率外部参考图，更支持将当前主画布实时镜像投影，随时比对整体构图、翻转检查比例与局部明暗',
          points: [
            '外部参考图片与主画布镜像双模式',
            '任意拖曳、双指缩放与独立锁定',
            '零遮挡主工作区，保持沉浸心流'
          ],
          alt: '画布界面，悬浮参考窗口显示参考图像，主画布正在绘制人物线稿'
        }
      ],
      pills: [
        {
          title: '35 种实时滤镜',
          desc: '色彩调整、模糊平滑、边缘增强、通道映射、艺术效果与空间扭曲，实时渲染预览'
        },
        {
          title: '25 种混合模式',
          desc: '正片叠底、滤色、叠加、柔光、强光、颜色减淡等完整支持，图层效果直观可视'
        },
        {
          title: '自由定制工具栏',
          desc: '按个人绘画习惯随心布置 28 个常用工具位，画布界面干净纯粹'
        }
      ]
    },
    toolkit: {
      eyebrow: '色彩工坊',
      title: '直觉与法则并存的调色体验',
      sub: '从经典色轮到 3D 受光球，让每一次取色都有据可循',
      colors: [
        {
          title: 'SAI 经典 V-HSV 色轮',
          desc: '还原 PaintTool SAI 标志性的取色模式：外侧色相环取色，内侧方形区域精准调节饱和度与明度，支持滑杆数值精确微调',
          alt: 'PaintTool SAI 经典 V-HSV 色轮，色相环搭配方形饱和明度区域与 H/S/V 滑杆'
        },
        {
          title: '色彩调和助手',
          desc: '内置互补色、分裂互补、类似色、三等分等色彩理论法则，在色环上智能标定关联色彩，一键归档至工程色卡',
          alt: '和谐色轮，在色环上渲染出关联色点'
        },
        {
          title: '3D 光影受光球',
          desc: '模拟球体物理受光环境，拖曳光源光标即可即时提取受光点的高光、固有色、明暗交界与环境反光暗部',
          alt: '3D 光影球取色面板，球体上指示受光点，标出高光、固有色与暗部'
        },
        {
          title: '智能色卡与图片拾色',
          desc: '内置基础调色板与莫兰迪精选色系，支持直接从导入的参考图片中批量提炼高质感专属色板',
          alt: '色卡面板，含基本色、莫兰迪配色与从图片提取的色卡'
        }
      ],
      specsEyebrow: '架构矩阵',
      specsTitle: '专业、现代、可靠的底层架构',
      specsSub: '基于现代 Android 与 Krita C++ 深度工程整合，带来前所未有的创作流畅度',
      specs: [
        {
          title: '图层与图层组管理',
          desc: '动态稀疏瓦片内存管理，百层大画布轻盈顺畅；支持图层组嵌套折叠、剪贴蒙版、Alpha 锁定与 25 种混合模式'
        },
        {
          title: '动画与悬浮创作辅助',
          desc: '内置逐帧手绘动画时间轴与洋葱皮透视辅助；支持画布悬浮参考窗、自由双指视口变换与无损高精度裁剪'
        },
        {
          title: '全流程事件流延时摄影',
          desc: '零性能额外损耗记录所有笔迹、图层演变与滤镜变迁；随 .revp 独立工程文件完整归档，支持 0.5x–4x 倍速无缝拖动回放'
        },
        {
          title: '纸感触觉与莫兰迪美学',
          desc: '集成真实纸张微摩擦音效与手写笔震动反馈；原生支持 Material You 动态取色与自由工作区底色定制'
        },
        {
          title: '触控手势与视口变换',
          desc: '双指捏合流畅平移、缩放与任意角度旋转画布；双指点击撤销、三指点击重做与长按快捷吸色，丝滑跟手'
        },
        {
          title: '独立工程与离线安全',
          desc: '基于 .revp 独立工程文件打包归档，支持多档后台静默自动保存与意外恢复机制，离线可用且不收集任何数据'
        }
      ]
    },
    origin: {
      eyebrow: '设计理念',
      title: '纯粹、专注、不妥协的创作体验',
      sub: '为真正热爱画画的人而打造，让工具成为双手的自然延伸',
      pillars: [
        {
          num: '01',
          title: '拒绝功能阉割',
          desc: '不以移动端为借口简化核心参数，完整保留桌面级图层混合、物理颜料计算与深度压感微调，让专业画师在平板上同样拥有无妥协的创作上限'
        },
        {
          num: '02',
          title: '沉浸心流状态',
          desc: '零商业广告、零内购弹窗、完全离线可用，毫秒级自动保活与草稿恢复，界面与辅助工具静默退至画布之后，让注意力全然聚焦于画作本身'
        },
        {
          num: '03',
          title: '纯粹开源基石',
          desc: '基于 GPL-3.0 协议全量开源，自研 .revp 独立工程与笔迹事件流开放归档，代码属于全球创作者社区，永不设限、永不捆绑'
        }
      ],
      quote: '让复杂的技术在画布背后无声运转，把最纯粹的掌控感交还给创作者'
    },
    get: {
      eyebrow: '获取应用',
      title: '自由创作，现已就绪',
      sub: '完全免费开源，不含任何商业广告与应用内购，随时随地开启专业创作',
      meta: [
        { k: '系统要求', v: 'Android 7.0+（API 24）' },
        { k: '芯片架构', v: '仅 64 位 arm64-v8a' },
        { k: '开源协议', v: 'GPL-3.0 开放源码' },
        { k: '交流社群', v: 'QQ 群 729283213' }
      ],
      ways: [
        {
          title: '获取安装包',
          body: 'ReveriePaint 完全免费开源，可直接访问 GitHub Releases 获取官方正式构建包，或通过第三方镜像通道下载',
          links: [
            { text: 'GitHub Releases 下载', href: 'https://github.com/LanRhyme/ReveriePaint/releases', primary: true },
            { text: '官方使用文档', href: '/docs/', primary: false },
            { text: 'Mirror酱下载通道', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android', primary: false }
          ]
        },
        {
          title: '交流群',
          body: '欢迎加入 ReveriePaint 创作者交流群，交流平板手绘体验、反馈功能建议与获取最新构建',
          links: [
            { text: '跳转加群', href: 'https://qm.qq.com/q/729283213', primary: false }
          ]
        },
        {
          title: '源码与共建',
          body: '基于 Kotlin + Jetpack Compose 响应式架构与 C++ Krita 内核，欢迎提交 Issue 反馈与 PR 贡献代码',
          links: [
            { text: '浏览 GitHub 仓库', href: 'https://github.com/LanRhyme/ReveriePaint', primary: false },
            { text: '提交 Issue 反馈', href: 'https://github.com/LanRhyme/ReveriePaint/issues', primary: false }
          ]
        }
      ],
      copyQQ: '复制群号: 729283213',
      copiedQQ: '已复制群号 729283213'
    },
    footer: {
      tagline: 'Android 原生数字绘画',
      links: [
        { label: '使用文档', href: '/docs/' },
        { label: 'GitHub', href: 'https://github.com/LanRhyme/ReveriePaint' },
        { label: 'Releases', href: 'https://github.com/LanRhyme/ReveriePaint/releases' },
        { label: 'Mirror酱下载', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android' },
        { label: 'QQ群 729283213', href: 'https://qm.qq.com/q/729283213' },
        { label: 'Issues 反馈', href: 'https://github.com/LanRhyme/ReveriePaint/issues' },
        { label: 'GPL-3.0 协议', href: 'https://www.gnu.org/licenses/gpl-3.0.html' }
      ],
      copyright: '© {year} LanRhyme · 基于 GPL-3.0 协议开源',
      disclaimer: 'Krita 为其各自所有者的商标，本项目与 KDE 无隶属关系'
    },
    docsNav: {
      brandTag: '文档手册',
      searchPlaceholder: '搜索章节或关键字（Ctrl+K）',
      home: '官网首页',
      toc: '目录',
      collapse: '收起',
      copiedGroup: '群号已复制',
      qqGroup: 'QQ 群 729283213'
    }
  },
  'zh-TW': {
    header: {
      tagline: 'Android 原生數位繪畫',
      nav: {
        features: '核心特性',
        toolkit: '色彩工坊',
        origin: '設計理念',
        get: '取得應用',
        docs: '使用手冊'
      },
      download: '下載',
      mobileDownload: '前往 Releases 下載 APK',
      menu: '導航選單',
      langTitle: '介面語言'
    },
    hero: {
      eyebrow: 'Android 平板專業創作 · GPL-3.0 開源 · QQ群 729283213',
      titleLine1: '把桌面級圖像核心，',
      titleLine2: '裝進安卓平板',
      sub: '融合 Krita C++ 原生圖像處理核心與現代化觸控互動，具備 240+ 官方筆刷預設、動態稀疏瓦片圖層、多協議壓感手寫筆專屬調校與全流程事件流延時回放，讓專業創作在行動端徹底擺脫妥協',
      downloadApk: '下載 APK',
      docs: '使用手冊',
      source: 'GitHub 源碼',
      statBrushes: '官方物理筆刷',
      statBlend: '圖層混合模式',
      statFilters: '無損即時濾鏡',
      statLicense: '永久免費開源',
      unitKinds: ' 種',
      deviceAlt: 'ReveriePaint 畫布上繪製的飛龍與貓的線稿',
      deviceNote: '實機介面展示 · Android 平板專業創作體驗'
    },
    features: {
      eyebrow: '核心特性',
      title: '不妥協的桌面級創作工作流',
      sub: '摒棄行動端繪畫軟體常見的閹割與簡化，把核心參數控制權完整交還給畫師',
      blocks: [
        {
          id: 'bench',
          kicker: '筆刷工坊',
          title: '深植 Krita 原生核心，自由掌控每一道筆觸',
          body: '直接複用 Krita 核心筆刷渲染引擎，提供真實的物理筆觸與顏料混合模擬，筆尖形狀印記、色彩塗抹混合、動態阻尼與壓感曲線全開，支援儲存為個人專屬筆刷預設',
          points: [
            '複用 Krita 官方圖像與物理顏料模擬核心',
            '圓形、方形與自訂筆尖貼圖匯入',
            '完整保留壓感動態曲線與參數微調'
          ],
          alt: '筆刷工作台，左側為參數分類，右側為筆尖貼圖選擇、邊緣羽化、抗鋸齒與隨機翻轉設定'
        },
        {
          id: 'pen',
          kicker: '手寫筆適配',
          title: '硬體級壓感調校，深度適配多品牌手寫筆',
          body: '針對多品牌手寫筆以及標準 Android 觸控筆協議提供全方位底層調校，內建自訂壓力過渡曲線與懸空游標預覽，徹底告別斷觸與延遲',
          points: [
            '華為 M-Pencil 星閃 16K 壓感與側鍵手勢',
            'OPPO / 一加筆身觸控滑動與真實紙感微震',
            '三星 S Pen 與通用 Android 協議深度支援',
            '多控制點自訂壓力曲線與即時試筆區'
          ],
          alt: '手寫筆設定頁，包含多品牌手寫筆專屬適配與自訂壓力曲線微調'
        },
        {
          id: 'lasso',
          kicker: '精準選區',
          title: '逐點可控的多段折線套索',
          body: '專為複雜插畫構圖打造的折線選區系統，節點落位精準，支援單點獨立復原與無縫閉合，協同加選、減選、反選與即時邊緣羽化，讓局部精修和構圖微調精確到每一個像素',
          points: [
            '逐點精確落位與獨立單點回溯復原',
            '支援加選、減選、反選與即時羽化',
            '自由手繪與折線節點無縫混合'
          ],
          alt: '多段折線套索正在畫布上框選區域，下方懸浮工具列提供閉合、復原與羽化操作'
        },
        {
          id: 'reference',
          kicker: '懸浮參考',
          title: '雙模式懸浮參考窗，全域構圖盡在掌控',
          body: '畫布上方自由懸浮、平移與縮放，不僅支援載入高解析度外部參考圖，更支援將當前主畫布即時鏡像投影，隨時比對整體構圖、翻轉檢查比例與局部明暗',
          points: [
            '外部參考圖片與主畫布鏡像雙模式',
            '任意拖曳、雙指縮放與獨立鎖定',
            '零遮擋主工作區，保持沉浸心流'
          ],
          alt: '畫布介面，懸浮參考視窗顯示參考圖像，主畫布正在繪製人物線稿'
        }
      ],
      pills: [
        {
          title: '35 種即時濾鏡',
          desc: '色彩調整、模糊平滑、邊緣增強、色版映射、藝術效果與空間扭曲，即時渲染預覽'
        },
        {
          title: '25 種混合模式',
          desc: '正片疊底、濾色、疊加、柔光、強光、顏色減淡等完整支援，圖層效果直觀可視'
        },
        {
          title: '自由自訂工具列',
          desc: '按個人繪畫習慣隨心佈置 28 個常用工具位，畫布介面乾淨純粹'
        }
      ]
    },
    toolkit: {
      eyebrow: '色彩工坊',
      title: '直覺與法則並存的調色體驗',
      sub: '從經典色輪到 3D 受光球，讓每一次取色都有據可循',
      colors: [
        {
          title: 'SAI 經典 V-HSV 色輪',
          desc: '還原 PaintTool SAI 標誌性的取色模式：外側色相環取色，內側方形區域精準調節飽和度與明度，支援滑桿數值精確微調',
          alt: 'PaintTool SAI 經典 V-HSV 色輪，色相環搭配方形飽和明度區域與 H/S/V 滑桿'
        },
        {
          title: '色彩調和助手',
          desc: '內建互補色、分裂互補、類似色、三等分等色彩理論法則，在色環上智慧標定關聯色彩，一鍵歸檔至工程色卡',
          alt: '和諧色輪，在色環上渲染出關聯色點'
        },
        {
          title: '3D 光影受光球',
          desc: '模擬球體物理受光環境，拖曳光源游標即可即時提取受光點的高光、固有色、明暗交界與環境反光暗部',
          alt: '3D 光影球取色面板，球体上指示受光點，標出高光、固有色與暗部'
        },
        {
          title: '智慧色卡與圖片拾色',
          desc: '內建基礎調色盤與莫蘭迪精選色系，支援直接從匯入的參考圖片中批量提煉高質感專屬色板',
          alt: '色卡面板，含基本色、莫蘭迪配色與從圖片提取的色卡'
        }
      ],
      specsEyebrow: '架構矩陣',
      specsTitle: '專業、現代、可靠的底層架構',
      specsSub: '基於現代 Android 與 Krita C++ 深度工程整合，帶來前所未有的創作流暢度',
      specs: [
        {
          title: '圖層與圖層組管理',
          desc: '動態稀疏瓦片記憶體管理，百層大畫布輕盈順暢；支援圖層組嵌套折疊、剪貼蒙版、Alpha 鎖定與 25 種混合模式'
        },
        {
          title: '動畫與懸浮創作輔助',
          desc: '內建逐幀手繪動畫時間軸與洋蔥皮透視輔助；支援畫布懸浮參考窗、自由雙指視口變換與無損高精度裁剪'
        },
        {
          title: '全流程事件流延時攝影',
          desc: '零性能額外損耗記錄所有筆跡、圖層演變與濾鏡變遷；隨 .revp 獨立工程文件完整歸檔，支援 0.5x–4x 倍速無縫拖動回放'
        },
        {
          title: '紙感觸覺與莫蘭迪美學',
          desc: '整合真實紙張微摩擦音效與手寫筆震動反饋；原生支援 Material You 動態取色與自由工作區底色自訂'
        },
        {
          title: '觸控手勢與視口變換',
          desc: '雙指捏合流暢平移、縮放與任意角度旋轉畫布；雙指點擊復原、三指點擊重做與長按快捷吸色，絲滑跟手'
        },
        {
          title: '獨立工程與離線安全',
          desc: '基於 .revp 獨立工程文件打包歸檔，支援多檔後台靜默自動儲存與意外恢復機制，離線可用且不收集任何數據'
        }
      ]
    },
    origin: {
      eyebrow: '設計理念',
      title: '純粹、專注、不妥協的創作體驗',
      sub: '為真正熱愛畫畫的人而打造，讓工具成為雙手的自然延伸',
      pillars: [
        {
          num: '01',
          title: '拒絕功能閹割',
          desc: '不以行動端為藉口簡化核心參數，完整保留桌面級圖層混合、物理顏料計算與深度壓感微調，讓專業畫師在平板上同樣擁有無妥協的創作上限'
        },
        {
          num: '02',
          title: '沉浸心流狀態',
          desc: '零商業廣告、零內購彈窗、完全離線可用，毫秒級自動保活與草稿恢復，介面與輔助工具靜默退至畫布之後，讓注意力全然聚焦於畫作本身'
        },
        {
          num: '03',
          title: '純粹開源基石',
          desc: '基於 GPL-3.0 協議全量開源，自研 .revp 獨立工程與筆跡事件流開放歸檔，程式碼屬於全球創作者社群，永不設限、永不捆綁'
        }
      ],
      quote: '讓複雜的技術在畫布背後無聲運轉，把最純粹的掌控感交還給創作者'
    },
    get: {
      eyebrow: '取得應用',
      title: '自由創作，現已就緒',
      sub: '完全免費開源，不含任何商業廣告與應用內購，隨時隨地開啟專業創作',
      meta: [
        { k: '系統要求', v: 'Android 7.0+（API 24）' },
        { k: '晶片架構', v: '僅 64 位元 arm64-v8a' },
        { k: '開源協議', v: 'GPL-3.0 開放源碼' },
        { k: '交流社群', v: 'QQ 群 729283213' }
      ],
      ways: [
        {
          title: '取得安裝包',
          body: 'ReveriePaint 完全免費開源，可直接造訪 GitHub Releases 取得官方正式構建包，或透過第三方鏡像通道下載',
          links: [
            { text: 'GitHub Releases 下載', href: 'https://github.com/LanRhyme/ReveriePaint/releases', primary: true },
            { text: '官方使用手冊', href: '/docs/', primary: false },
            { text: 'Mirror醬下載通道', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android', primary: false }
          ]
        },
        {
          title: '交流群',
          body: '歡迎加入 ReveriePaint 創作者交流群，交流平板手繪體驗、回饋功能建議與取得最新構建',
          links: [
            { text: '跳轉加群', href: 'https://qm.qq.com/q/729283213', primary: false }
          ]
        },
        {
          title: '源碼與共建',
          body: '基於 Kotlin + Jetpack Compose 響應式架構與 C++ Krita 核心，歡迎提交 Issue 回饋與 PR 貢獻程式碼',
          links: [
            { text: '瀏覽 GitHub 倉庫', href: 'https://github.com/LanRhyme/ReveriePaint', primary: false },
            { text: '提交 Issue 回饋', href: 'https://github.com/LanRhyme/ReveriePaint/issues', primary: false }
          ]
        }
      ],
      copyQQ: '複製群號: 729283213',
      copiedQQ: '已複製群號 729283213'
    },
    footer: {
      tagline: 'Android 原生數位繪畫',
      links: [
        { label: '使用手冊', href: '/docs/' },
        { label: 'GitHub', href: 'https://github.com/LanRhyme/ReveriePaint' },
        { label: 'Releases', href: 'https://github.com/LanRhyme/ReveriePaint/releases' },
        { label: 'Mirror醬下載', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android' },
        { label: 'QQ群 729283213', href: 'https://qm.qq.com/q/729283213' },
        { label: 'Issues 回饋', href: 'https://github.com/LanRhyme/ReveriePaint/issues' },
        { label: 'GPL-3.0 協議', href: 'https://www.gnu.org/licenses/gpl-3.0.html' }
      ],
      copyright: '© {year} LanRhyme · 基於 GPL-3.0 協議開源',
      disclaimer: 'Krita 為其各自所有者的商標，本專案與 KDE 無隸屬關係'
    },
    docsNav: {
      brandTag: '文件手冊',
      searchPlaceholder: '搜尋章節或關鍵字（Ctrl+K）',
      home: '官網首頁',
      toc: '目錄',
      collapse: '收起',
      copiedGroup: '群號已複製',
      qqGroup: 'QQ 群 729283213'
    }
  },
  'en': {
    header: {
      tagline: 'Native Android Digital Painting',
      nav: {
        features: 'Features',
        toolkit: 'Color Studio',
        origin: 'Philosophy',
        get: 'Get App',
        docs: 'Documentation'
      },
      download: 'Download',
      mobileDownload: 'Download APK from Releases',
      menu: 'Menu',
      langTitle: 'Language'
    },
    hero: {
      eyebrow: 'Android Tablet Painting · GPL-3.0 Open Source · QQ Group 729283213',
      titleLine1: 'Desktop-class raster engine,',
      titleLine2: 'built for Android tablets',
      sub: 'Powered by the Krita C++ native raster engine with modern touch interactions, featuring 240+ official brush presets, dynamic sparse-tile layers, multi-protocol stylus tuning, and event-stream time-lapse replay, bringing uncompromised professional creation to mobile devices',
      downloadApk: 'Download APK',
      docs: 'Documentation',
      source: 'GitHub Source',
      statBrushes: 'Official Brushes',
      statBlend: 'Blend Modes',
      statFilters: 'Live Filters',
      statLicense: 'Free & Open Source',
      unitKinds: '',
      deviceAlt: 'Line art of dragon and cat drawn on ReveriePaint canvas',
      deviceNote: 'Real Device Capture · Professional Android Tablet Creation'
    },
    features: {
      eyebrow: 'Core Features',
      title: 'Uncompromising Desktop-Grade Workflow',
      sub: 'Discarding mobile simplifications and giving full creative parameter control back to artists',
      blocks: [
        {
          id: 'bench',
          kicker: 'Brush Studio',
          title: 'Rooted in Krita Core, Master Every Stroke',
          body: 'Directly reusing the core Krita brush engine, providing authentic physical strokes and paint mixing. Brush tips, smudge blending, dynamic damping, and pressure curves are fully configurable and exportable as custom presets',
          points: [
            'Krita official raster and physical paint simulation engine',
            'Round, square, and custom brush tip texture imports',
            'Full pressure dynamic curves and parameter fine-tuning'
          ],
          alt: 'Brush studio with parameter categories on the left and brush tip textures, feathering, and antialiasing on the right'
        },
        {
          id: 'pen',
          kicker: 'Stylus Tuning',
          title: 'Hardware-level Pressure Tuning, Tailored for Multi-brand Styluses',
          body: 'Low-level optimizations for multi-brand styluses and standard Android stylus protocols. Features custom pressure curves and hover cursor preview, eliminating jitter and latency',
          points: [
            'HUAWEI M-Pencil NearLink 16K pressure & side-key shortcuts',
            'OPPO / OnePlus touch slide gestures and paper-like haptic vibration',
            'Deep support for Samsung S Pen and universal Android protocols',
            'Multi-point custom pressure curves and live scratchpad'
          ],
          alt: 'Stylus settings page with multi-brand profiles and custom pressure curve tuning'
        },
        {
          id: 'lasso',
          kicker: 'Precision Selection',
          title: 'Point-by-point Multi-segment Polygonal Lasso',
          body: 'Designed for complex illustration compositions, featuring precise nodal snapping, single-point undo, seamless closing, add/subtract/invert modes, and live feathering down to each pixel',
          points: [
            'Precise point placement with independent single-node undo',
            'Add, subtract, invert modes with live edge feathering',
            'Seamless blending of freehand drawing and polygon nodes'
          ],
          alt: 'Polygonal lasso selecting an area on canvas with floating toolbar for closing, undoing, and feathering'
        },
        {
          id: 'reference',
          kicker: 'Floating Reference',
          title: 'Dual-mode Floating Reference Window, Complete Compositional Control',
          body: 'Freely floating, panning, and zooming above the canvas. Supports loading high-res external reference images or live mirroring the main canvas to check composition, symmetry, and values anytime',
          points: [
            'External reference image and canvas mirroring dual modes',
            'Free drag, pinch zoom, and independent lock',
            'Zero obstruction to main workspace, maintaining creative flow'
          ],
          alt: 'Canvas interface with floating reference window displaying reference image while main canvas shows linework'
        }
      ],
      pills: [
        {
          title: '35 Real-time Filters',
          desc: 'Color adjustments, blurs, edge enhancements, channel mapping, artistic effects, and warping with instant preview'
        },
        {
          title: '25 Blend Modes',
          desc: 'Full support for Multiply, Screen, Overlay, Soft Light, Hard Light, Color Dodge, and more'
        },
        {
          title: 'Customizable Toolbar',
          desc: 'Arrange up to 28 frequently used tool slots to match your habits, keeping the workspace clean'
        }
      ]
    },
    toolkit: {
      eyebrow: 'Color Studio',
      title: 'Intuitive & Methodical Color Experience',
      sub: 'From classic color wheels to 3D lighting spheres, grounding every color choice',
      colors: [
        {
          title: 'SAI Classic V-HSV Wheel',
          desc: 'Recreates the iconic PaintTool SAI color picker: outer hue ring paired with an inner saturation/value square, with slider precision',
          alt: 'PaintTool SAI classic V-HSV wheel with square saturation/value box and H/S/V sliders'
        },
        {
          title: 'Color Harmony Assistant',
          desc: 'Built-in color theory rules including complementary, split-complementary, analogous, and triadic, marking related colors directly on the ring',
          alt: 'Color harmony wheel displaying linked harmonious color markers'
        },
        {
          title: '3D Lighting Sphere',
          desc: 'Simulates physical light on a sphere; drag the light cursor to instantly extract highlight, base color, terminator, and ambient bounce',
          alt: '3D sphere color panel showing light source, highlights, base colors, and shadow values'
        },
        {
          title: 'Smart Palette & Image Extraction',
          desc: 'Built-in essential palettes and Morandi themes, with batch color extraction directly from imported reference pictures',
          alt: 'Palette panel with basic swatches, Morandi colors, and extracted palettes'
        }
      ],
      specsEyebrow: 'Tech Matrix',
      specsTitle: 'Professional, Modern, and Resilient Architecture',
      specsSub: 'Engineered with modern Android architectures and Krita C++ integration for unparalleled creative smoothness',
      specs: [
        {
          title: 'Layers & Group Management',
          desc: 'Dynamic sparse-tile memory management keeping 100+ layer canvases fluid; supports group nesting, clipping masks, alpha lock, and 25 blend modes'
        },
        {
          title: 'Animation & Floating Aids',
          desc: 'Built-in frame-by-frame animation timeline and onion skinning; floating reference window, smooth viewport transforms, and lossless cropping'
        },
        {
          title: 'Event-Stream Time-Lapse',
          desc: 'Records all strokes, layers, and filters with zero performance overhead; bundled within .revp files with 0.5x–4x playback'
        },
        {
          title: 'Paper Acoustics & Aesthetics',
          desc: 'Integrated paper friction acoustic feedback and stylus haptic vibration; native Material You dynamic colors and custom canvas background tones'
        },
        {
          title: 'Touch Gestures & Transforms',
          desc: 'Fluid two-finger pan, zoom, and rotate; two-finger tap undo, three-finger redo, and long-press eyedropper with instant responsiveness'
        },
        {
          title: 'Standalone Project & Security',
          desc: 'Packaged into self-contained .revp project files with multi-tier background auto-save and draft recovery; works completely offline with zero data collection'
        }
      ]
    },
    origin: {
      eyebrow: 'Philosophy',
      title: 'Pure, Focused, Uncompromised Experience',
      sub: 'Built for passionate artists, making the tool a natural extension of your hands',
      pillars: [
        {
          num: '01',
          title: 'No Feature Cuts',
          desc: 'No simplifying core features under the pretext of being mobile. Desktop-grade layer blending, physical paint calculation, and deep pressure tuning remain intact'
        },
        {
          num: '02',
          title: 'Immersive Creative Flow',
          desc: 'Zero ads, zero in-app purchases, completely offline, with millisecond-level auto-save and recovery, keeping attention entirely focused on the artwork'
        },
        {
          num: '03',
          title: 'Pure Open-Source Foundation',
          desc: 'Fully open source under GPL-3.0 with open .revp project files and event streams. Belonging to the global creative community, never locked in'
        }
      ],
      quote: 'Letting complex technology run silently behind the canvas, handing pure creative control back to the artist'
    },
    get: {
      eyebrow: 'Get App',
      title: 'Create Freely, Ready Now',
      sub: 'Completely free and open-source, without ads or in-app purchases. Professional digital painting anywhere, anytime',
      meta: [
        { k: 'OS Requirement', v: 'Android 7.0+ (API 24)' },
        { k: 'Architecture', v: '64-bit arm64-v8a only' },
        { k: 'License', v: 'GPL-3.0 Open Source' },
        { k: 'Community', v: 'QQ Group 729283213' }
      ],
      ways: [
        {
          title: 'Get Installation Package',
          body: 'ReveriePaint is completely free and open source. Download the official release directly from GitHub Releases or via third-party mirrors',
          links: [
            { text: 'Download on GitHub Releases', href: 'https://github.com/LanRhyme/ReveriePaint/releases', primary: true },
            { text: 'Documentation', href: '/docs/', primary: false },
            { text: 'MirrorChyan Fast Channel', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android', primary: false }
          ]
        },
        {
          title: 'Community Group',
          body: 'Join the ReveriePaint creators group to share tablet drawing experiences, provide suggestions, and receive update notifications',
          links: [
            { text: 'Join Group', href: 'https://qm.qq.com/q/729283213', primary: false }
          ]
        },
        {
          title: 'Source & Contributing',
          body: 'Built with Kotlin, Jetpack Compose, and the C++ Krita engine. Issues and pull requests are warmly welcomed',
          links: [
            { text: 'Browse GitHub Repo', href: 'https://github.com/LanRhyme/ReveriePaint', primary: false },
            { text: 'Submit Issue', href: 'https://github.com/LanRhyme/ReveriePaint/issues', primary: false }
          ]
        }
      ],
      copyQQ: 'Copy Group ID: 729283213',
      copiedQQ: 'Copied Group ID 729283213'
    },
    footer: {
      tagline: 'Native Android Digital Painting',
      links: [
        { label: 'Documentation', href: '/docs/' },
        { label: 'GitHub', href: 'https://github.com/LanRhyme/ReveriePaint' },
        { label: 'Releases', href: 'https://github.com/LanRhyme/ReveriePaint/releases' },
        { label: 'MirrorChyan Download', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android' },
        { label: 'QQ Group 729283213', href: 'https://qm.qq.com/q/729283213' },
        { label: 'Issues & Feedback', href: 'https://github.com/LanRhyme/ReveriePaint/issues' },
        { label: 'GPL-3.0 License', href: 'https://www.gnu.org/licenses/gpl-3.0.html' }
      ],
      copyright: '© {year} LanRhyme · Open sourced under GPL-3.0',
      disclaimer: 'Krita is a trademark of its respective owners; this project is not affiliated with KDE'
    },
    docsNav: {
      brandTag: 'Documentation',
      searchPlaceholder: 'Search sections or keywords (Ctrl+K)',
      home: 'Home',
      toc: 'Contents',
      collapse: 'Collapse',
      copiedGroup: 'Copied Group ID',
      qqGroup: 'QQ Group 729283213'
    }
  },
  'ja': {
    header: {
      tagline: 'Android ネイティブ デジタルペイント',
      nav: {
        features: 'コア機能',
        toolkit: 'カラー工房',
        origin: '設計思想',
        get: 'アプリを入手',
        docs: 'ドキュメント'
      },
      download: 'ダウンロード',
      mobileDownload: 'Releases から APK をダウンロード',
      menu: 'メニュー',
      langTitle: '表示言語'
    },
    hero: {
      eyebrow: 'Android タブレット プロ制作 · GPL-3.0 オープンソース · QQグループ 729283213',
      titleLine1: 'デスクトップ級の画像処理エンジンを、',
      titleLine2: 'Android タブレットへ',
      sub: 'Krita C++ ネイティブ画像処理エンジンと最新のタッチ操作を融合。240以上の公式ブラシプリセット、動的スパースタイルレイヤー、各社スタイラスペン対応の筆圧調整、イベント記録によるタイムラプス再生を備え、妥協のないプロの制作環境を実現します',
      downloadApk: 'APK をダウンロード',
      docs: 'ドキュメント',
      source: 'GitHub ソース',
      statBrushes: '公式フィジカルブラシ',
      statBlend: 'レイヤー描画モード',
      statFilters: 'リアルタイムフィルター',
      statLicense: '完全無料・オープンソース',
      unitKinds: ' 種類',
      deviceAlt: 'ReveriePaint キャンバスで描かれたドラゴンと猫の線画',
      deviceNote: '実機画面 · Android タブレットでのプロ創作体験'
    },
    features: {
      eyebrow: 'コア機能',
      title: '妥協なきデスクトップ級の創作環境',
      sub: 'モバイル特有の機能制限を排し、細部まで思い通りのコントロールを創作者へ',
      blocks: [
        {
          id: 'bench',
          kicker: 'ブラシ工房',
          title: 'Krita ネイティブコアを採用、自在なストローク表現',
          body: 'Krita のコアブラシ描画エンジンを直接採用し、リアルな筆致と混色シミュレーションを提供。ブラシ先端テクスチャ、混色・にじみ、動的ダンピング、筆圧カーブを自由に微調整し、プリセットとして保存可能',
          points: [
            'Krita 公式画像処理と絵の具シミュレーションコア',
            '円形・四角形およびカスタムブラシ先端テクスチャの読み込み',
            '筆圧ダイナミックカーブと各種パラメータの精密調整'
          ],
          alt: 'ブラシ工房。左側にパラメータ分類、右側にブラシ先端テクスチャ選択やアンチエイリアス設定'
        },
        {
          id: 'pen',
          kicker: 'スタイラスペン最適化',
          title: 'ハードウェア級の筆圧調整、各社スタイラスに深層対応',
          body: '各社スタイラスペンおよび Android 標準プロトコル向けに深層チューニング。カスタム筆圧レスポンス曲線とホバーカーソルプレビューを搭載し、遅延や途切れを徹底排除',
          points: [
            'HUAWEI M-Pencil NearLink 16K筆圧およびサイドキー操作',
            'OPPO / OnePlus スライド操作および紙の質感を模した微振動フィードバック',
            'Samsung S Pen および汎用 Android プロトコルの完全サポート',
            'マルチポイントカスタム筆圧カーブとリアルタイム試し書きエリア'
          ],
          alt: 'スタイラスペン設定画面。ブランド別最適化とカスタム筆圧カーブ微調整'
        },
        {
          id: 'lasso',
          kicker: '高精度選択範囲',
          title: '1点ずつ制御可能なポリラインなげなわ',
          body: '複雑な構図向けに設計された折れ線選択ツール。正確な頂点配置、1点ごとの取り消し、シームレスなパス閉じ、追加・削除・反転およびリアルタイムぼかしに対応',
          points: [
            '正確な頂点配置とステップごとの取り消し',
            '追加・一部除外・反転とリアルタイム境界ぼかし',
            'フリーハンド描画と多角形ノードのシームレスな切り替え'
          ],
          alt: 'キャンバス上でポリラインなげなわが範囲選択中、下部のフローティングバーで結合・取り消し・ぼかしを操作'
        },
        {
          id: 'reference',
          kicker: 'フローティング参照',
          title: 'デュアルモード参照ウィンドウ、全体の構図を自在に俯瞰',
          body: 'キャンバス上に自由に浮かべ、移動・拡大縮小が可能。高解像度の外部画像読み込みはもちろん、メインキャンバスのリアルタイム左右反転・ミラー投影に対応',
          points: [
            '外部参照画像とキャンバス反転ミラーの2モード',
            '自由ドラッグ、2本指ピンチ拡大縮小、独立ロック',
            'メイン作業領域を邪魔せず、没入感を持続'
          ],
          alt: 'キャンバス画面。フローティング参照ウィンドウが表示され、メイン画面で人物線画を制作中'
        }
      ],
      pills: [
        {
          title: '35 種類のリアルタイムフィルター',
          desc: '色調補正、ぼかし、輪郭強調、チャンネル操作、アート効果、変形などリアルタイムプレビューに対応'
        },
        {
          title: '25 種類の描画モード',
          desc: '乗算、スクリーン、オーバーレイ、ソフトライト、ハードライト、覆い焼きなど多彩な描画モードを網羅'
        },
        {
          title: 'カスタマイズ可能なツールバー',
          desc: '描画スタイルに合わせて28箇所のツールスロットを自由配置、すっきりとした作業空間をキープ'
        }
      ]
    },
    toolkit: {
      eyebrow: 'カラー工房',
      title: '直感と理論が調和する配色システム',
      sub: '定番のカラーサークルから3D陰影球まで、色彩選びを的確にサポート',
      colors: [
        {
          title: 'SAI スタイル V-HSV カラーサークル',
          desc: 'PaintTool SAI 伝統のカラーピッカーを再現。外周の色相環と内側の彩度・明度スクエア、さらに数値スライダーで精密に調整可能',
          alt: 'SAI クラシック V-HSV カラーホイール'
        },
        {
          title: 'ハーモニー配色アシスタント',
          desc: '補色、分裂補色、類似色、トライアドなど色彩理論に基づく配色パターンをサークル上に自動表示し、パレットへ一括保存',
          alt: 'サークル上に関連色を表示する調和カラーサークル'
        },
        {
          title: '3D 陰影ライティング球',
          desc: '球体の立体的な受光環境をシミュレート。光源カーソルをドラッグするだけで、ハイライト、固有色、明暗境界線、反射光を即座にサンプリング',
          alt: '3D陰影球カラーパネル。受光点やハイライト、陰影の色を抽出'
        },
        {
          title: 'スマートパレット＆画像カラー抽出',
          desc: '基本カラーやモランディパレットを内蔵。読み込んだ参考画像から高品位な配色を一括抽出することも可能',
          alt: '基本色や画像抽出パレットが並ぶカラーパレットパネル'
        }
      ],
      specsEyebrow: 'アーキテクチャ',
      specsTitle: 'プロフェッショナルで堅牢な基盤設計',
      specsSub: '最新の Android と Krita C++ の深層統合により、比類なき快適さを実現',
      specs: [
        {
          title: 'レイヤー＆グループ管理',
          desc: '動的スパースタイルメモリ管理により100枚を超えるレイヤーも軽快に動作。グループの階層化、クリッピングマスク、不透明度ロック、25種類の描画モードに対応'
        },
        {
          title: 'アニメーション＆制作補助',
          desc: '手描きコマ打ちアニメーションタイムラインとオニオンスキン機能を内蔵。キャンバス参照ウィンドウや自由な2本指視点変換、高精度トリミングを搭載'
        },
        {
          title: '全プロセス イベント記録タイムラプス',
          desc: '描画処理に負荷をかけることなくストロークやレイヤー、フィルターの変遷を記録。.revp 形式に完全保存され、0.5x〜4x の可変速再生が可能'
        },
        {
          title: '紙の触覚とモランディの美学',
          desc: '紙との摩擦音やペン先の微振動フィードバックを統合。Material You 動的カラーと作業領域のカスタム背景色に対応'
        },
        {
          title: 'タッチジェスチャーと視点変換',
          desc: '2本指ピンチで滑らかに移動・拡大・回転。2本指タップで取り消し、3本指タップでやり直し、長押しスポイトなど直感的な操作感'
        },
        {
          title: 'スタンドアロンプロジェクト＆安全保存',
          desc: '完全自己完結の .revp 形式で保存。バックグラウンド自動保存と不意のクラッシュ復旧に対応し、完全オフライン動作でプライバシーを保護'
        }
      ]
    },
    origin: {
      eyebrow: '設計思想',
      title: '純粋・集中・妥協のない創作体験',
      sub: '絵を愛するすべての人のために、ツールを手の一部のようになじませる',
      pillars: [
        {
          num: '01',
          title: '機能の簡略化を排す',
          desc: 'モバイルだからとコア機能を削ることなく、デスクトップ級のレイヤー合成、絵の具シミュレーション、細やかな筆圧微調整をそのまま搭載'
        },
        {
          num: '02',
          title: '没入できるクリエイティブフロー',
          desc: '広告や課金表示は一切なし、完全オフライン動作。ミリ秒単位の自動保存と復元を備え、余計なUIを極力省いて創作に没頭できます'
        },
        {
          num: '03',
          title: '揺るぎないオープンソース基盤',
          desc: 'GPL-3.0 ライセンスに基づく完全オープンソース。独自形式 .revp とストロークイベントを公開し、特定の囲い込みを行わない自由な創作を支えます'
        }
      ],
      quote: '複雑な技術はキャンバスの裏側に隠し、描く歓びと確かな手応えを創作者へ'
    },
    get: {
      eyebrow: 'アプリを入手',
      title: '自由な創作を、今すぐ',
      sub: '完全無料かつオープンソース。広告や課金は一切なし、いつでもプロレベルの創作を',
      meta: [
        { k: 'システム要件', v: 'Android 7.0+（API 24）' },
        { k: 'アーキテクチャ', v: '64-bit arm64-v8a 専用' },
        { k: 'ライセンス', v: 'GPL-3.0 オープンソース' },
        { k: 'コミュニティ', v: 'QQ グループ 729283213' }
      ],
      ways: [
        {
          title: 'インストールパッケージの入手',
          body: 'ReveriePaint は完全無料かつオープンソースです。GitHub Releases より公式ビルドを入手するか、高速ミラー配信をご利用ください',
          links: [
            { text: 'GitHub Releases からダウンロード', href: 'https://github.com/LanRhyme/ReveriePaint/releases', primary: true },
            { text: '公式ドキュメント', href: '/docs/', primary: false },
            { text: 'MirrorChyan 高速ダウンロード', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android', primary: false }
          ]
        },
        {
          title: 'コミュニティグループ',
          body: 'ReveriePaint クリエイター交流グループへ参加し、タブレットでの描き味やご要望を共有しましょう',
          links: [
            { text: 'グループに参加', href: 'https://qm.qq.com/q/729283213', primary: false }
          ]
        },
        {
          title: 'ソースコードと開発参加',
          body: 'Kotlin + Jetpack Compose および C++ Krita エンジンで構築。Issue や Pull Request でのご参加を歓迎します',
          links: [
            { text: 'GitHub リポジトリを見る', href: 'https://github.com/LanRhyme/ReveriePaint', primary: false },
            { text: 'フィードバック・Issue を投稿', href: 'https://github.com/LanRhyme/ReveriePaint/issues', primary: false }
          ]
        }
      ],
      copyQQ: 'グループ番号をコピー: 729283213',
      copiedQQ: 'コピーしました: 729283213'
    },
    footer: {
      tagline: 'Android ネイティブ デジタルペイント',
      links: [
        { label: 'ドキュメント', href: '/docs/' },
        { label: 'GitHub', href: 'https://github.com/LanRhyme/ReveriePaint' },
        { label: 'Releases', href: 'https://github.com/LanRhyme/ReveriePaint/releases' },
        { label: 'MirrorChyan ダウンロード', href: 'https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android' },
        { label: 'QQグループ 729283213', href: 'https://qm.qq.com/q/729283213' },
        { label: 'フィードバック', href: 'https://github.com/LanRhyme/ReveriePaint/issues' },
        { label: 'GPL-3.0 ライセンス', href: 'https://www.gnu.org/licenses/gpl-3.0.html' }
      ],
      copyright: '© {year} LanRhyme · GPL-3.0 ライセンスに基づき公開',
      disclaimer: 'Krita は各権利者の商標であり、本プロジェクトは KDE と提携関係にあるものではありません'
    },
    docsNav: {
      brandTag: 'ドキュメント',
      searchPlaceholder: 'セクションやキーワードを検索 (Ctrl+K)',
      home: 'ホーム',
      toc: '目次',
      collapse: '閉じる',
      copiedGroup: 'コピーしました',
      qqGroup: 'QQ グループ 729283213'
    }
  }
}

export function setLang(lang) {
  const normalized = normalizeLang(lang)
  if (!SUPPORTED_LANGS.some(l => l.id === normalized)) return
  currentLang.value = normalized
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, normalized)
    document.documentElement.lang = normalized
  }
}

export function toggleLang() {
  const nextMap = {
    'zh-CN': 'zh-TW',
    'zh-TW': 'en',
    'en': 'ja',
    'ja': 'zh-CN'
  }
  setLang(nextMap[currentLang.value] || 'zh-CN')
}

// 初始化时设定 document.documentElement.lang
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLang.value
}

export function useI18n() {
  const t = (path) => {
    const keys = path.split('.')
    let current = messages[currentLang.value] || messages['zh-CN']
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        // fallback to zh-CN
        let fallback = messages['zh-CN']
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey]
          } else {
            return path
          }
        }
        return fallback
      }
    }
    return current
  }

  const locale = computed(() => currentLang.value)
  const isEn = computed(() => currentLang.value === 'en')
  const isZh = computed(() => currentLang.value === 'zh-CN' || currentLang.value === 'zh-TW')
  const currentLangInfo = computed(() => SUPPORTED_LANGS.find(l => l.id === currentLang.value) || SUPPORTED_LANGS[0])

  return {
    t,
    currentLang,
    locale,
    isEn,
    isZh,
    currentLangInfo,
    supportedLangs: SUPPORTED_LANGS,
    setLang,
    toggleLang,
    messages: computed(() => messages[currentLang.value] || messages['zh-CN'])
  }
}
