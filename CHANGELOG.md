# Changelog

## 未发布

### 工程
- 新增 `.github/workflows/release.yml`：推送 `v*` tag 时校验版本号、`npm pack`
  打包成 `dsh-cyberdeck.tgz` 并创建/更新对应 Release；支持 `release-notes/<tag>.md`
  自定义发布说明。

## v0.1.1 — 2026-11-10

纯文档 / 元数据版本，皮肤本身没有改动。

### 文档 / 元数据
- 安装说明改成 `plugin_manager install_bundle` 的真实用法：`target` 是本仓库绝对路径，
  或 GitHub Release 的 tarball 直达链接。
- 补充大陆网络下从 Release 安装失败的排查：`release-assets.githubusercontent.com`
  常被解析成 `127.0.0.1`，pnpm 报 `fetch failed`；给了代理、本地目录、GitHub 代理镜像
  三条替代路径（附本包的 SHA-256）。
- `package.json` 声明 `engines.dsh >= 0.2.0-rc.1`，插件市场与 `plugin_manager` 可以据此
  判断兼容性。

## v0.1.0 — 2026-11-07

首个公开版本。

### 主题
- 恒定夜间配色，覆盖 `--dsw-alias-*`（114 个）与 `--dsw-specific-*`。
- 修复白输入框 / 白气泡 / 白文档卡 / 白「预览版」胶囊。
- 覆盖菜单专用 token `--dsw-menu-surface-fill` / `--dsw-menu-backdrop-filter`，修复下拉菜单灰白底。
- 深色菜单加 0.5px 青色描边与阴影。

### 零态雷达
- 空会话时自上而下的扫描线，扫过的位置渐显点阵世界地图（Natural Earth 110m 海岸线，2° 网格 4000+ 点）。
- 58 个城市节点（8 个枢纽带双环与十字准星）、15 条贝塞尔航线，按纬度延迟逐条绘出。
- 显示渐变 96px、消失渐变 480px，两者都贴合扫描线。
- 相位锁定在 `Date.now() - radarBorn`，只在建层时写一次，避免扫描线跳动。
- 有对话后彻底移除（消息节点检测 + Enter 发送兜底）。

### 数据监控
- 左下角 `SCAN / SIG / LOAD / NODES` 横条读数，扫描线到达后先播信号干扰再渐显。
- 干扰为 RGB 色散 + **按行独立**抖动（每行独立幅度与延迟）。

### 其它
- 尊重 `prefers-reduced-motion`。
