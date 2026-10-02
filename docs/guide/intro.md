# 软件架构与安装授权

ReveriePaint 深度整合 Krita 核心图形内核，专为 Android 触控与平板设备优化打造，提供流畅跟手的原生绘画体验

## 核心系统基准

- **系统要求**：适用于 Android 7.0 及以上版本（API Level 24+），推荐 64 位 ARM64 架构芯片
- **内存调度**：无硬编码图层上限，系统依照设备当前可用内存动态评估最大安全图层深度
- **系统兼容提示**：由于图形驱动与动态库限制，HarmonyOS NEXT 纯血架构兼容性较弱，推荐在标准 Android 设备上使用

## 获取 APK 安装包

ReveriePaint 遵循 GPL-3.0 协议开源，官方优先推荐通过 GitHub Releases 获取正版构建，国内网络环境可通过 Mirror酱 镜像加速下载

![GitHub Releases 下载入口](/docs/doc-install-repo.webp)

::: info 架构包说明
推荐优先下载体积较小、专为当代 64 位平板与手机优化的 `arm64-v8a` 架构包，若在老旧 32 位设备上安装失败再下载 `armeabi-v7a` 通用兼容包
:::

![Releases 安装包列表](/docs/doc-install-release.webp)

- [前往 GitHub Releases 下载官方安装包](https://github.com/LanRhyme/ReveriePaint/releases)
- [前往 Mirror酱 镜像站点高速下载](https://mirrorchyan.com/zh/projects?rid=ReveriePaint&os=android)
