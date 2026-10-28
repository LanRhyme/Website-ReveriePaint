# ReveriePaint 使用手册

ReveriePaint 是基于 **Krita 渲染内核** 的 Android 原生绘画应用：笔画、图层、混合模式、滤镜与动画都跑在同一套 Krita 引擎上，界面则完全按触控重写 —— 没有桌面软件的菜单树，所有高频操作都在画布周围两指可及的位置。

::: tip 这份文档怎么用
- 第一次用：从 [安装与第一次作画](/guide/install) 开始，十分钟内能画上第一笔并保存
- 已经会画：直接跳到 [图层](/guide/layers)、[剪贴蒙版](/guide/clipping)、[3D 参考图层](/guide/layer-3d)、[动画](/guide/animation)
- 查具体操作：右上角搜索，或按 `Ctrl + K` / `⌘K`
:::

## 文档地图

| 模块 | 内容 | 常用入口 |
| :--- | :--- | :--- |
| **开始** | 安装、首次作画、界面构成、手势与快捷键 | [界面导览](/guide/interface) · [手势与快捷键](/guide/gestures) |
| **绘画** | 画笔参数、压感、笔刷工坊、色彩、形状与辅助线、选区与滤镜 | [画笔与压感](/guide/brush) · [笔刷工坊](/guide/brush-studio) |
| **图层** | 图层类型、混合模式、剪贴蒙版、Alpha 锁定、3D 参考图层 | [图层体系](/guide/layers) · [3D 参考图层](/guide/layer-3d) |
| **动画** | 逐帧时间轴、洋葱皮、动画与回放导出 | [逐帧动画](/guide/animation) · [导出与回放](/guide/export) |
| **工程** | `.revp` 工程、自动保存与快照恢复、WebDAV 同步、设置项 | [工程与备份](/guide/project) · [设置与性能](/guide/settings) |
| **参考** | 常见问题、问题反馈、文档贡献 | [常见问题](/guide/faq) |

## 软件基准

| 项 | 要求 |
| :--- | :--- |
| 系统版本 | Android 7.0（API 24）及以上 |
| CPU 架构 | 推荐 arm64-v8a；老的 32 位设备可用 armeabi-v7a 包 |
| 手写笔 | 支持 Wacom EMR 无源笔（三星 S Pen 等）、主流主动式电容笔、外接数位板 |
| 图层上限 | 不写死，按设备可用内存与画布尺寸动态评估 |
| 授权 | GPL-3.0 开源，无账号、无联网强制 |

## 能力一览

- **绘画**：Krita 笔刷引擎（含 MyPaint 类笔刷、像素笔、水彩类混合笔刷）、35 种滤镜、抖动修正与 Krita 加权平滑
- **图层**：分组嵌套、20+ 混合模式、剪贴蒙版、继承透明度、Alpha 锁定、透明蒙版、描边层、填充层、调整层、克隆层
- **参考**：3D 参考图层（人体/头部/猫等模型，可摆骨骼、调打光、提线稿）、参考窗口、透视与对称辅助
- **动画**：逐帧时间轴、洋葱皮、动画导出（GIF / MP4 / PNG 序列）
- **工程**：原生 `.revp`、Krita `.kra`、PSD 分层导入导出、自动保存与崩溃快照恢复、WebDAV 云同步
- **回放**：录制作画过程，可导出延时摄影视频分享

## 界面速览

![绘画页总览](/docs/doc-ui-main.webp)

四块区域：左侧工具栏与笔刷条、中间画布、右侧浮动面板（图层 / 画笔 / 色彩）、顶栏（撤销、重做、新建图层、删除、复制、设置、关闭）。每个面板都能拖动、固定或收起，详见 [界面导览](/guide/interface)。

## 获取与反馈

- 下载：[GitHub Releases](https://github.com/LanRhyme/ReveriePaint/releases) · [Mirror 酱镜像](https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android)
- 反馈：[GitHub Issues](https://github.com/LanRhyme/ReveriePaint/issues/new/choose)（附日志最快，见 [常见问题](/guide/faq)）
- 源码：[LanRhyme/ReveriePaint](https://github.com/LanRhyme/ReveriePaint)
