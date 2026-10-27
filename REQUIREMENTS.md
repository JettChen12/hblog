# hblog 个人技术博客 — 需求文档

| 项 | 内容 |
| --- | --- |
| 版本 | v1.1（冻结） |
| 日期 | 2026-10-27 |
| 状态 | **已实现并本地验收**；服务器部署挂起（待域名与备案） |
| 需求来源 | 与站长当面确认的 4 项关键决策（见 §2.1）+ §11.2 六项补充确认 |
| 设计依据 | Hallmark v2.0.0（整体设计与验收门）、Emil Kowalski 设计工程 skill（动效与微交互） |
| 实现仓库 | https://github.com/JettChen12/hblog |

**v1.1 变更记录**（相对 v1.0）：

1. 站长信息落地：站名 **H-BLOG**、站训「千里之行，始于足下」、GitHub 仓库
   `JettChen12/hblog`（public，giscus 可用）、个人简介与头像以占位形式提供
   （`src/config.ts` 可改），不接访问统计（FR-36 生效）。
2. 部署策略调整：服务器（阿里云，大陆）与域名**暂不上线**，M5 改为本地验收
   （`pnpm build && pnpm preview`）；Nginx/HTTPS/CI 流程保留在 README 供就绪后启用。
3. 技术决策变更：D5 由 Tailwind CSS 改为**纯 CSS + 设计 token**——全站组件
   均为定制像素样式，Tailwind 的原始长度工具类与 H 规则（间距必须走 token）冲突，
   移除后 sloplint 门禁可严格执行。
4. 字体方案细化：中文像素字体选型定为 Fusion Pixel 12px 等宽 zh_hans（OFL），
   cn-font-split 分包已落地（58 切片，首页实测下载约 2KB）；JetBrains Mono
   可变字重经 npm 自托管。
5. 验收结果摘录：构建通过；Pagefind 中文索引可用；浏览器双主题/移动端走查
   两轮共修复 14 项视觉问题；sloplint 0 FAIL / 0 WARN / 1 DISMISSED（豁免与
   撤销记录见 `src/styles/tokens.css` stamp 与 design.md）；首页外部 JS 0 个、
   首屏字体约 2KB，全部预算超额达标。

**优先级约定**：
- **P0**：首次上线必须完成，缺失即不可发布；
- **P1**：首版应包含，允许上线后一周内补齐；
- **P2**：明确记录、按需排期，不影响首版验收。

---

## 1. 项目概述

### 1.1 一句话定位

一个部署在自有轻量服务器上的**纯静态中文个人技术博客**：站长用 Markdown 本地写作、Git 推送即发布；视觉上是克制、现代的像素风格——简约但有记忆点。

### 1.2 目标与成功标准

| 目标 | 成功标准 |
| --- | --- |
| 写作体验顺畅 | 从「写完 md 文件」到「线上可见」只需一次 `git push`，全程 ≤ 3 分钟 |
| 阅读体验一流 | 移动端 Lighthouse Performance ≥ 95，LCP < 2.0s，正文可读性不受像素风格损害 |
| 设计有辨识度 | 站点截图混在十个技术博客里能被一眼认出（像素设计语言统一且克制） |
| 运维近零成本 | 服务器上只有 Nginx + 静态文件；无数据库、无常驻应用进程、无安全补丁负担 |

### 1.3 目标读者

中文开发者与技术人员。读者设备以移动端浏览器为主（预期 ≥ 60% 流量）、桌面端次之；网络环境包含中国大陆直连，因此**所有静态资源自托管**（不依赖 Google Fonts 等境外 CDN）。

### 1.4 核心原则（冲突时按序取舍）

1. **内容为王**：正文可读性 > 视觉风格。像素元素是外壳，文章排版是内核。
2. **静态优先**：能用构建期解决的绝不放到运行期；无后端、无数据库。
3. **性能即设计**：卡顿会毁掉任何像素动效；性能预算（§8.1）与视觉验收同级。
4. **不编造**：站点上出现的每一个数字、经历、引用都必须真实来自站长（§6.2 H7）。

---

## 2. 关键决策记录

### 2.1 站长已确认的决策

| # | 决策点 | 结论 |
| --- | --- | --- |
| D1 | 发布方式 | 本地 Markdown 写作 + Git 推送自动构建部署，无在线后台 |
| D2 | 技术栈 | Astro 静态站生成（SSG） |
| D3 | 互动功能 | 站内搜索 + giscus 评论（基于 GitHub Discussions） |
| D4 | 语言 | 仅中文 |

### 2.2 由上表推导的技术决策（含理由）

| # | 决策 | 理由 |
| --- | --- | --- |
| D5 | 样式方案：Tailwind CSS v4 + `:root` CSS 变量 token | Tailwind 与 Astro 集成成熟；所有颜色/字体仍强制走 token（H1），两层不冲突 |
| D6 | 搜索：Pagefind，构建后生成静态索引 | 为静态站设计、零后端、按需分片加载；中文分词需在 M4 验证（风险 R3，备选 FlexSearch 自建索引） |
| D7 | 代码高亮：Shiki（Astro 内置） | 构建期高亮、零运行时 JS，支持自定义主题以匹配明暗双模式 |
| D8 | 代码仓库：GitHub **公开**仓库 | giscus 硬性要求（仓库必须 public 且开启 Discussions）；文章源码公开对技术博客是加分项 |
| D9 | 部署：GitHub Actions 构建 → SSH rsync 到服务器 → Nginx 提供服务 | 构建负载留给 CI（免费），服务器零构建依赖；Docker 可选（§7.4） |
| D10 | 字体全部自托管并子集化 | 大陆读者直连访问，境外字体 CDN 不可靠；中文像素字体体积大，必须分包（§6.4） |
| D11 | 像素字体选型：Fusion Pixel Font（缝合像素字体，OFL-1.1 开源） | 开源协议干净、简体中文覆盖完整、提供 8/10/12px 等宽与比例字重；备选 Zpix（仅个人免费） |
| D12 | 明暗双模式，默认跟随系统 | 像素风天然亲和暗色（CRT 质感），但亮色下同样成立；由用户手动切换并持久化 |

---

## 3. 信息架构与页面需求

### 3.1 路由表（全部为静态生成）

| 路由 | 页面 | 优先级 |
| --- | --- | --- |
| `/` | 首页：签名区 + 最新文章 | P0 |
| `/posts/[slug]/` | 文章详情页 | P0 |
| `/archive/` | 归档时间线（按年分组） | P0 |
| `/tags/`、`/tags/[tag]/` | 标签索引与标签筛选 | P0 |
| `/about/` | 关于我（个人简介） | P0 |
| `/404`（404.html） | 像素风 404 页 | P0 |
| `/rss.xml`、`/sitemap.xml`、`/robots.txt` | 订阅与 SEO 基础设施 | P0 |
| `/friends/` | 友情链接（静态配置文件驱动） | P2 |

URL 规则：slug 用英文 kebab-case（如 `/posts/astro-content-collections/`），**不带日期前缀**，日期信息只存在于 frontmatter 与页面元信息中——保证未来调整发文频率不污染 URL。

### 3.2 首页 `/`

- **FR-1** 首屏（1280×800 无滚动）完整呈现三件事：站名（像素字体大标题）、一句话自我介绍、一个主行动入口（最新文章）。首屏宣言性文字总量 ≤ 80 汉字。
- **FR-2** 首屏之下展示最新 5 篇文章：标题、发布日期、标签、一句摘要（取 frontmatter `description`）。
- **FR-3** 首页结构与「签名瞬间」（§6.1）的具体形态在实现期由 Hallmark 设计流程决定，本文档只锁定约束不锁定布局。
- 站名暂用 `hblog`，正式站名见 §11 待确认项 T1。

### 3.3 文章详情页 `/posts/[slug]/`（核心页面，需求最重）

- **FR-4** 文章头部：标题（可换行、`overflow-wrap: break-word`）、发布日期、更新日期（如有）、标签链接、阅读时长（按中文 400 字/分钟估算）。
- **FR-5** 正文排版：正文栏宽约 60–68 字符（中文约 34–38 字/行），字号 ≥ 16px（建议 17px），行高 1.8±0.1；引用块、表格、任务列表、脚注、行内代码均有像素风样式。
- **FR-6** 目录（TOC）：桌面端右侧 sticky 侧栏，移动端折叠为 `<details>`；滚动时高亮当前小节；锚点跳转带 `scroll-margin-top` 预留吸顶导航高度。
- **FR-7** 代码块：Shiki 高亮（明暗两套主题随站点模式切换）；支持语言标注、可选文件名、行高亮；右上角「复制」按钮，按下有 100–160ms 反馈，成功后文案短暂变为「已复制」。
- **FR-8** 文章内图片：经 `astro:assets` 构建期优化（输出 AVIF/WebP、生成宽高属性防 CLS）；像素图（sprite、截图中的像素画）单独标记，输出原始 PNG 并加 `image-rendering: pixelated`，不做有损压缩。点击放大为 P1。
- **FR-9** 文末：上一篇/下一篇导航 + giscus 评论区。
- **FR-10** giscus 评论**懒加载**：滚入视口或点击「加载评论」时才注入 iframe；加载失败显示「评论暂不可用」降级文案，不阻塞、不报错弹窗（风险 R4）。
- **FR-11** 元信息（日期、标签、阅读时长）的分隔使用间距或细边框，**不用中点 `·` 串联三项以上**（H9）。

### 3.4 归档页 `/archive/`

- **FR-12** 按年份分组的时间线列表：每项含日期、标题、标签；当前年份之外可折叠。初期（≤ 100 篇）不分页，全量输出；超出后启用简单分页（P2）。

### 3.5 标签页 `/tags/`

- **FR-13** `/tags/` 展示全部标签及文章数；`/tags/[tag]/` 展示该标签下文章（按日期倒序）。空标签不生成页面。

### 3.6 关于页 `/about/`

- **FR-14** 内容由数据文件驱动（§4.2 profile 数据），包含：像素头像、姓名/昵称、一段简介、技能/兴趣标签、社交链接（GitHub、邮箱等）。
- **FR-15** 头像与个人经历素材由站长提供；未提供前使用明确的占位样式并在交付时列出替换清单，**不得编造**履历、数字、引用（H7）。

### 3.7 404 页

- **FR-16** 像素风 404：一句文案 + 返回首页入口；确保 Nginx `error_page` 正确指向。

### 3.8 全站导航与页脚

- **FR-17** 吸顶导航：站名（回首页）、归档、标签、关于、搜索入口、明暗切换；移动端收纳为抽屉或折叠菜单。
- **FR-18** 页脚：版权年份（自动计算）、RSS 入口、社交链接、源码仓库链接；不堆砌装饰性内容。

---

## 4. 内容管理需求

### 4.1 写作 → 发布流程

- **FR-19** 流程：本地写 `src/content/blog/<slug>.md` → `git push` → GitHub Actions 自动构建并部署 → 约 1–3 分钟后线上可见。
- **FR-20** 提供 `pnpm new "文章标题"` 脚本：生成带当日日期与完整 frontmatter 的模板文件（P1）。
- **FR-21** 草稿：frontmatter `draft: true` 的文章不进入生产构建；本地 dev 可预览。

### 4.2 内容模型（Astro Content Collections + Zod 校验）

文章 frontmatter：

```yaml
title: string        # 必填，中文标题
description: string  # 必填，一句摘要（列表页与 SEO description 共用）
pubDate: date        # 必填，发布日期
updatedDate: date    # 可选，重要更新日期
tags: string[]       # 必填，1–4 个，全站小写统一
draft: boolean       # 可选，默认 false
heroImage: string    # 可选，头图路径（引用 src/assets）
```

关于页数据 `src/data/profile.ts`（YAML/TS 均可）：`name`、`tagline`、`bio`、`skills[]`、`links[{label,url,icon}]`、`avatar`。

友链数据（P2）：`links[{name,url,avatar,desc}]`。

- **FR-22** frontmatter 不合法时构建**直接失败**并给出明确错误定位（类型安全由 Zod schema 保证）。

### 4.3 图片与资源

- **FR-23** 文章配图存放 `src/assets/`（走构建优化）；像素素材（sprite、像素图标）存放 `public/pixel/`，构建时原样复制并全局声明 `image-rendering: pixelated` 的适用类。
- **FR-24** 单图体积建议 ≤ 300KB（优化后），单篇文章配图 ≤ 20 张（超出时提醒拆分系列）。

### 4.4 内容量假设（架构与性能的依据）

- 首年文章 ≤ 100 篇，单篇 ≤ 2 万字；归档与标签页初期全量渲染不分页。

---

## 5. 全站功能需求（非页面类）

### 5.1 站内搜索

- **FR-25** 入口：导航栏搜索按钮 + 快捷键 `Ctrl/⌘ + K` 与 `/`（处于输入态时除外）；键盘唤起的面板**不做开合动画**（高频操作零动画，E8）。
- **FR-26** 实现：Pagefind 构建期索引；结果面板像素风定制样式；命中词高亮。
- **FR-27** 中文检索验收：构建后实测中文分词与命中排序可用；不达标则切换备选方案（FlexSearch + 构建期生成 JSON 索引），功能行为不变。

### 5.2 评论（giscus）

- **FR-28** giscus 配置：公开仓库 Discussions + giscus App；主题跟随站点明暗模式切换；语言 zh-CN。
- **FR-29** 行为要求见 FR-10（懒加载 + 失败降级）。

### 5.3 RSS 与订阅

- **FR-30** `/rss.xml` 输出**全文**（技术博客惯例），含 `@rss` 自动发现标签。

### 5.4 明暗双模式

- **FR-31** 默认跟随系统 `prefers-color-scheme`；手动切换后写入 `localStorage` 持久化；`<head>` 内联一段 ≤ 1KB 的防闪烁脚本在任何像素渲染前设定主题；`<meta name="theme-color">` 双值同步。
- **FR-32** 两套模式均为一等公民：像素风格在亮色下不降级为「灰白页面」。

### 5.5 SEO

- **FR-33** 每页唯一 `<title>`（模板：`文章标题 · 站名`）、meta description、canonical。
- **FR-34** Open Graph / Twitter Card 基础卡（P0 文本卡；og:image 自动生成为 P2）。
- **FR-35** `sitemap.xml`、`robots.txt`；文章页 JSON-LD `BlogPosting` / 站级 `Person`（P1）。

### 5.6 访问统计

- **FR-36** 默认**不接入**任何统计（隐私优先、保持零第三方脚本）；若后续需要，仅允许自托管 Umami（P2，需站长确认，见 §11 T6）。

### 5.7 明确不做（Out of Scope）

多语言切换、在线后台编辑器、点赞/浏览计数（需后端）、邮件订阅、数学公式渲染（需要时另立需求）、评论邮箱提醒。

---

## 6. 设计需求 — 像素风格设计系统

> 本章是「像素风 + 前沿 + 简约美观」的可执行定义。§6.2 与 §6.6 是**硬约束**，实现期由 Hallmark 流程负责整体设计（形状、签名、首屏），由 Emil 设计工程原则负责动效与手感，二者在实现时通过各自 skill 加载执行。

### 6.1 设计基调与「签名瞬间」

- **基调一句话**：*现代复古终端*——像一台保养良好的 CRT 机器运行着当代排版系统；克制、清晰、有一处让人记住的东西。
- **DR-1 签名瞬间**：全站必须存在**一个**可被记住的像素元素（候选：首页像素头像 sprite 动画、标题打字机 + 闪烁光标、像素风景横幅），在首屏呈现。具体选型由 Hallmark 设计阶段决定并在 Picks block 记录；**只允许一个**签名，其余像素装饰全部退后。
- **DR-2 克制条款**：CRT 扫描线、噪点、抖动等氛围效果**不得同时使用两种以上**；正文阅读区（文章正文栏内）禁止任何持续动画效果。

### 6.2 硬性设计约束（源自 Hallmark Floor，编号 H1–H16，博客场景适配）

- **H1** 每个颜色、每个字体必须经过 `:root`（或主题块）声明的 token 引用；token 块之后不允许出现字面量颜色或 `font-family`。
- **H2** 禁止 `transition: all`；禁止动画 `width` / `height` / `top` / `left`（允许 transform、opacity、clip-path）。
- **H3** `html` 与 `body` 均为 `overflow-x: clip`（不是 `hidden`）；禁止 `100vw`。
- **H4** 含图片的网格轨道使用 `minmax(0, 1fr)`；大标题容器带 `overflow-wrap: break-word; min-width: 0`。
- **H5** 每个交互元素都有即时出现的 `:focus-visible` 样式（像素风可用外扩 2–3px 的实线边框）。
- **H6** 每个动画都有 `prefers-reduced-motion: reduce` 降级；无 JS 时全部内容可读（Astro SSG 天然满足，搜索/评论等功能允许不可用）。
- **H7** 不编造任何数字、引用、logo、案例统计；素材未到位就留明确的占位槽位并记录待替换清单。
- **H8** 标签、导航链接、表头、元信息：使用正文字体小一号、正常字距，不使用全大写/小型大写/字距拉开（中文场景：不用加大字距模拟「英文小标题感」）。
- **H9** 元信息不用中点 `·` 串联；用间距、细边框或独立行分隔。
- **H10** 禁止：紫→蓝渐变、卡片套卡片、emoji 充当图标、手绘浏览器/系统窗口装饰。
- **H11** 首页与关于页的首屏在 1280×800 下完整呈现核心内容（站名、一句话、主行动），无需滚动。
- **H12** 首屏宣言性文字 ≤ 80 汉字。注：此条约束首页/关于页首屏，**不约束**文章正文与列表页（长文档密度是内容本身）。
- **H13** 页面容器定宽居中（建议 max-width 72rem）；1920px 以上只增长左右留白，不拉伸内容栅格；正文栏 ~65ch。
- **H14** 构建产出的 CSS 首行写入 Hallmark stamp（由 Hallmark 脚手架生成），随后是 critique 行与任何 waiver。
- **H15** 页面级不变量：全站一种主按钮风格；一个嵌套层级的圆角体系（本项目默认圆角为 **0**——像素硬边缘，见 §6.5）；居中标题组数量 ≤ 左对齐标题组。
- **H16** 交付前运行 `sloplint --render` 检查，所有 `FAIL` 清零；`REFLEX` 项逐条修复或在记录中豁免。

### 6.3 设计 Token 结构（结构冻结，具体色值由设计阶段产出）

`src/styles/tokens.css` 必须声明以下 token（明暗两套值）：

```css
:root / [data-theme="dark"] / [data-theme="light"] {
  /* 颜色 */
  --bg, --bg-elevated, --surface;          /* 背景三层 */
  --fg, --fg-muted, --fg-faint;            /* 前景三级 */
  --accent, --accent-fg;                   /* 唯一信号色（前景色不超过一种强调色） */
  --border-pixel;                          /* 像素边框色 */
  --code-bg, --code-fg;                    /* 代码块 */
  --selection-bg, --selection-fg;          /* 文本选择 */
  --focus-ring;                            /* 焦点环 */
  /* 字体 */
  --font-pixel;   /* 像素字体：标题/logo/按钮/标签 */
  --font-body;    /* 正文：系统字体栈 + Noto Sans SC 兜底 */
  --font-mono;    /* 代码：等宽栈，中文注释回退 --font-body */
  /* 尺寸与节奏（8px 网格） */
  --space-1..--space-8;                    /* 4/8/16/24/32/48/64/96 */
  --container-max; --measure-body;         /* 72rem / 65ch */
  /* 像素原语 */
  --pixel-unit: 2px;                       /* 像素画的基本格，全站唯一 */
  --border-pixel-w: 2px;                   /* 像素边框宽度 */
  /* 动效 */
  --ease-out, --ease-in-out, --dur-fast, --dur-base;
}
```

- **DR-3** 对比度：正文前景/背景对比 ≥ 4.5:1，大字号与 UI 组件 ≥ 3:1；信号色在明暗两套主题中均需实测达标。

### 6.4 字体策略（本项目最大的工程风险点，见 R2）

| 角色 | 字体 | 用法 | 约束 |
| --- | --- | --- | --- |
| 像素字体 | Fusion Pixel 12px（比例或等宽按设计定） | 站名、文章大标题、按钮、标签、导航 | 字号必须是 12 的整数倍（12/24/36/48px），保证像素锐利不糊 |
| 正文字体 | 系统字体栈（`system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`） | 文章正文、摘要、表单 | 不加载外部字体文件，零请求；≥ 16px |
| 代码字体 | JetBrains Mono / Cascadia / Maple Mono 任选（OFL，自托管子集） | 代码块、行内代码 | 中文注释回退到正文字体；子集含拉丁 + 常用符号 |

- **DR-4** 中文像素字体体积巨大（全量数 MB 级），**必须**用 cn-font-split（或等价工具）在构建期分包为 `unicode-range` 切片的 woff2：首屏实际下载量目标 ≤ 150KB（§8.1），其余字形按需加载。
- **DR-5** 全部字体自托管于本站域名（D10），禁止引入境外字体 CDN。

### 6.5 像素风视觉语言

- **DR-6 8px 网格**：全部间距、尺寸落在 8px 网格上（4px 允许用于微调）；像素画内部使用 `--pixel-unit`（2px）网格。
- **DR-7 像素边框**：组件边框为实色 2px 硬边（`--border-pixel-w`），不用圆角、不用阴影做柔化；需要立体感时用「亮边 + 暗边」双色边或阶梯 `box-shadow`（经典 8-bit 凸起/凹陷按钮语言）。
- **DR-8 图标**：全站图标使用统一的像素图标集（自绘 SVG，网格对齐到 `--pixel-unit`），或高质量开源像素图标库；禁止 emoji 当图标（H10）。
- **DR-9 渐变与过渡区域**：像素风下不用平滑渐变；需要面积过渡时使用抖动（dither，checkerboard 图案）或分段色带。
- **DR-10 位图渲染**：所有像素位图资源统一 `image-rendering: pixelated`；禁止对像素图做模糊/缩放抗锯齿。
- **DR-11 圆角默认 0**；唯一允许的非零圆角场景：系统原生控件（滚动条、`<select>` 弹层）不可控部分。

### 6.6 动效与微交互规范（源自 Emil 设计工程原则，编号 E1–E11）

- **E1 属性白名单**：只动画 `transform` / `opacity` / `clip-path`（clip-path 用于像素风的阶梯揭示）；禁 `width/height/top/left`、禁 `transition: all`（与 H2 一致）。
- **E2 时长**：按压反馈 100–160ms；tooltip 125–200ms；下拉/搜索面板 150–250ms；页面级过渡 200–300ms。**UI 动效硬上限 300ms**；例外仅限叙事性动效（打字机、签名动画），且必须遵守 E7。
- **E3 缓动**：入场用自定义 `cubic-bezier(0.23, 1, 0.32, 1)`（强 ease-out）；屏幕内移动用 `cubic-bezier(0.77, 0, 0.175, 1)`；hover/颜色过渡用 `ease`；**禁止 UI 入场使用 ease-in**。像素 sprite 逐帧动画用 `steps(N)` 线性步进——这是像素风专属例外，仅用于装饰元素。
- **E4 按压反馈**：所有可点元素（按钮、卡片链接、图标按钮）`:active` 时 `scale(0.97)`，160ms ease-out。
- **E5 入场起点**：元素进入从 `scale(0.95) + opacity: 0` 开始，禁止从 `scale(0)` 出现。
- **E6 hover 门控**：所有 hover 动效包在 `@media (hover: hover) and (pointer: fine)` 中，避免移动端点按触发粘滞 hover。
- **E7 无障碍降级**：`prefers-reduced-motion: reduce` 时移除位移/缩放/sprite 动画（sprite 停在首帧静态图），保留有助于理解的透明度与颜色过渡。
- **E8 键盘零动画**：快捷键唤起的切换（搜索面板、Esc 关闭）不做开合动画——高频键盘操作动画只会显得迟钝。
- **E9 列表入场**：列表项 stagger 30–80ms 逐项进入，总时长 ≤ 500ms，且不阻塞任何交互。
- **E10 懒加载第三方**：giscus 与搜索索引滚入视口才加载（FR-10/FR-26），首屏 JS 与评论互不影响。
- **E11 主题切换**：颜色过渡 200ms `ease`，配合防闪烁脚本（FR-31）无白屏闪动。

### 6.7 可访问性

- **DR-12** 全站键盘可完整操作：导航、搜索、评论、目录、主题切换均可达（Tab 顺序合理、Esc 可关闭浮层、焦点不丢失）。
- **DR-13** 像素字体仅用于标题/UI，正文使用高可读性字体（§6.4），保证长文阅读不疲劳。
- **DR-14** 色彩不是唯一信息载体：链接除颜色外有下划线（悬停/正文内）、标签有边框形状。
- **DR-15** `lang="zh-CN"`；语义化标签（`article`、`nav`、`time`）；Lighthouse Accessibility ≥ 95。

### 6.8 响应式断点

| 断点 | 布局 |
| --- | --- |
| < 640px | 单列；导航折叠；TOC 折叠；正文 17px |
| 640–1024px | 单列居中；TOC 折叠或内嵌文首 |
| > 1024px | 文章页双栏（正文 + sticky TOC）；首页多栏网格 |

- **DR-16** 移动端额外要求：触摸目标 ≥ 44×44px（含像素图标按钮）；禁用双击缩放由正确 viewport 设定实现而非 `user-scalable=no`。

### 6.9 设计执行与验收流程（实现期）

1. **Hallmark 运行**：对首页与文章页执行 Hallmark 流程（deal theme → shape/signature → Picks block → 构建 hero 优先），产出的 `tokens.css` 值填入 §6.3 冻结的结构。
2. **sloplint 检查**：`node <skill>/scripts/sloplint.mjs <files> --render` 直至 FAIL 清零（H16）。
3. **动效审查**：按 Emil skill 的 Review Checklist 表格式审查（Before/After/Why），逐条核对 E1–E11。
4. **系统锁定**：设计定稿后将 token 与组件规范固化为根目录 `design.md`（Hallmark lock the system），后续新页面一律遵循，防止风格漂移。

---

## 7. 技术方案

### 7.1 技术栈清单

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Astro（最新稳定版）+ TypeScript | 内容集合、 Islands 架构、默认零 JS |
| 样式 | Tailwind CSS v4 + `tokens.css` | token 优先（H1） |
| 内容 | Astro Content Collections + Zod | FR-22 类型安全 |
| 高亮 | Shiki | 构建期高亮，明暗双主题 |
| 搜索 | Pagefind | 构建后处理，静态索引 |
| 评论 | giscus（iframe，懒加载） | FR-28/29 |
| 字体分包 | cn-font-split（Node 脚本，构建前执行） | DR-4 |
| CI/CD | GitHub Actions（pnpm + rsync over SSH） | §7.3 |
| 服务器 | Linux（Ubuntu 22.04+ / Debian 12）+ Nginx | 待确认厂商/地域（§11 T2） |
| 包管理 | pnpm | 锁文件入库 |

### 7.2 项目目录结构（约定）

```
hblog/
├─ src/
│  ├─ content/blog/           # 文章 md（唯一内容源）
│  ├─ content.config.ts       # Zod schema
│  ├─ data/                   # profile / friends 数据
│  ├─ components/             # PixelButton / PostCard / SearchDialog / Comments / ThemeToggle …
│  ├─ layouts/                # BaseLayout / PostLayout
│  ├─ pages/                  # §3.1 路由
│  ├─ styles/                 # tokens.css / base.css
│  └─ scripts/new-post.ts     # FR-20
├─ public/pixel/              # 像素位图素材（sprite、图标）
├─ scripts/fonts/             # cn-font-split 字体分包
├─ .github/workflows/deploy.yml
├─ design.md                  # §6.9-4 设计系统锁定文档（设计定稿后生成）
└─ REQUIREMENTS.md
```

### 7.3 CI/CD 流水线

- **FR-37** 触发：push 到 `main`。
- **FR-38** 步骤：安装（pnpm，缓存）→ 字体分包 → `astro build` → Pagefind 索引 → Lighthouse CI（性能预算门禁，阈值见 §8.1，未达标则失败）→ rsync 增量同步到服务器 `/var/www/hblog/`。
- **FR-39** 服务器凭据：GitHub Secrets 存 SSH 私钥；部署目标目录属普通用户，Nginx 只读。
- **FR-40** 回滚：保留最近 5 个构建产物目录（`releases/<sha>` + `current` 软链切换），可一条 SSH 命令回滚。

### 7.4 服务器与 Nginx

- **FR-41** Nginx 要点：HTTP/2；TLS 1.2/1.3；gzip（静态文本全开，brotli 可选）；带 hash 的静态资源 `cache-control: immutable, max-age=31536000`；HTML `no-cache`（或短缓存 + must-revalidate）；`error_page 404 /404.html`；UTF-8 charset。
- **FR-42** 安全响应头：`X-Content-Type-Options`、`Referrer-Policy`、CSP（`frame-src https://giscus.app`、`img-src 'self' data:`、脚本仅 `'self'` + giscus 所需最小集）。CSP 以不影响功能的最严格版本上线。
- **FR-43** Docker 非必需：单机静态站直接装 Nginx 更简单；若站长已有容器化偏好可换 Nginx 容器，行为不变（§11 T2 一并确认）。

### 7.5 HTTPS 与域名

- **FR-44** Let's Encrypt 证书 + certbot 自动续期；http→https 301。
- **FR-45** 大陆地域服务器绑定域名必须完成 ICP 备案（风险 R1）；若站长无备案计划，服务器地域必须选大陆以外节点（如香港）。

### 7.6 备份与恢复

- **FR-46** 站点唯一真源是 Git 仓库（文章 + 代码 + 素材）；服务器只存构建产物。灾难恢复 = 新服务器装 Nginx + 重跑流水线，RTO < 30 分钟。giscus 评论数据在 GitHub Discussions，随仓库方（GitHub）存在。

---

## 8. 非功能需求

### 8.1 性能预算（CI 门禁）

| 指标 | 目标 | 测量方式 |
| --- | --- | --- |
| Lighthouse 移动端 Performance | ≥ 95 | GitHub Actions Lighthouse CI |
| Lighthouse SEO / Best Practices / A11y | ≥ 95 | 同上 |
| LCP | < 2.0s（模拟慢速 4G） | 同上 |
| CLS | < 0.05 | 同上 |
| INP | < 200ms | 同上 |
| 首页关键路径 JS（gzip） | ≤ 40KB | 构建产物统计（Astro 框架 JS 应为 0，仅搜索/主题岛） |
| 首屏字体实际下载 | ≤ 150KB | 网络面板实测（DR-4） |
| 单页 HTML（不含资源） | ≤ 100KB | 构建产物统计 |
| 图片 | AVIF/WebP 自动输出，带尺寸属性 | astro:assets 默认行为 |

### 8.2 兼容性

- **FR-47** 最新两个大版本的 Chrome / Edge / Firefox / Safari（桌面 + 移动）；不要求 IE。使用的现代 CSS（`@starting-style`、`clip-path` 等）需带 graceful fallback 或已全绿（Can I Use 验证）。

### 8.3 安全

- **FR-48** 无后端、无数据库、无可执行输入面；唯一第三方脚本为 giscus iframe（懒加载、CSP 白名单）。
- **FR-49** 依赖安全：CI 中启用 `pnpm audit --prod` 高危拦截；Astro 及关键依赖每月例行升级。
- **FR-50** SSH 仅密钥登录、禁密码；部署账户最小权限。

### 8.4 可靠性与降级

- **FR-51** 无 JS 降级：全部文章内容纯 HTML 可读；搜索/评论不可用时页面其余部分完全正常（H6）。
- **FR-52** giscus 加载失败降级文案（FR-10）；GitHub 不可达不影响正文阅读。

---

## 9. 验收标准（上线 Checklist）

发布前逐项核对，全部通过方可上线：

- [ ] §3.1 全部 P0 页面路由生成且内容正确（含 404、rss、sitemap、robots）
- [ ] FR-19 发布流程端到端演练成功：新建 md → push → 3 分钟内线上可见
- [ ] frontmatter 校验：缺字段/类型错的 md 使构建失败并指明文件（FR-22）
- [ ] 明暗双模式切换无闪烁、无残留错色；`theme-color` 同步（FR-31）
- [ ] 中文搜索命中、高亮正常（FR-27 验收记录留档）
- [ ] giscus 正常加载且懒加载生效；断网 giscus 时正文不受影响
- [ ] 代码块复制按钮、行高亮、双主题渲染正确（FR-7）
- [ ] H1–H16 逐条自查通过；`sloplint --render` FAIL = 0（H16）
- [ ] E1–E11 动效审查表完成（§6.9-3）
- [ ] `prefers-reduced-motion` 下无位移动画、sprite 静止（E7）
- [ ] 键盘走查：Tab 全站可达、Esc 关闭浮层、焦点可见（DR-12）
- [ ] 移动端（真机）走查：iOS Safari + Android Chrome 各一台
- [ ] Lighthouse CI 四项 ≥ 95 且性能预算全达标（§8.1）
- [ ] HTTPS、HSTS、CSP、404、缓存头、gzip 验证（FR-41/42/44）
- [ ] 回滚演练一次成功（FR-40）
- [ ] 站长素材（头像、简介、社交链接）已替换全部占位（FR-15）

---

## 10. 里程碑

| 里程碑 | 内容 | 出口条件 |
| --- | --- | --- |
| M0 脚手架 | git init、GitHub 仓库（public）、Astro + Tailwind + pnpm、CI 空跑 | CI 绿 |
| M1 内容骨架 | Content Collections、全部 P0 路由裸结构、profile 数据、示例文章 3 篇 | 全路由可导航 |
| M2 设计系统 | Hallmark 设计运行（首页 + 文章页 hero 优先）、tokens.css 定稿、字体分包落地 | §6.9-1/2 通过，字体预算达标 |
| M3 动效打磨 | E1–E11 微交互全量实现、双模式细节 | §6.9-3 审查通过 |
| M4 功能补全 | 搜索、giscus、RSS、SEO、JSON-LD、new-post 脚本 | FR-25~35 验收 |
| M5 上线 | Nginx、HTTPS、CI/CD、Lighthouse 门禁、回滚演练、§9 全清单 | §9 全绿 |

人机协作预估：M0–M5 合计约 6 个工作日（AI 实现为主、站长评审素材与验收）。

---

## 11. 风险与待确认项

### 11.1 风险

| # | 风险 | 影响 | 缓解 |
| --- | --- | --- | --- |
| R1 | 大陆服务器 + 未备案域名 → 80/443 被阻断 | 站点不可访问 | §11 T2 确认地域；无备案则选香港节点 |
| R2 | 中文像素字体体积（数 MB）拖垮性能预算 | 首屏变慢、预算超标 | cn-font-split 分包 + 首屏 ≤ 150KB 预算（DR-4）；极端时像素字体仅保留标题字符集 |
| R3 | Pagefind 中文分词效果不佳 | 搜索体验差 | M4 实测；备选 FlexSearch 自建索引（FR-27） |
| R4 | giscus 依赖 github.com/giscus.app 可达性，大陆直连可能偶发失败 | 评论偶尔加载不出 | 懒加载 + 降级文案（FR-10）；正文零影响；可接受并留档说明 |
| R5 | 像素字体版权 | 法律风险 | 主选 Fusion Pixel（OFL）；Zpix 仅个人使用（D11） |
| R6 | 单服务器单点 | 短暂不可用 | 真源在 Git，RTO < 30 分钟（FR-46）；可接受 |

### 11.2 待站长提供（v1.1 已全部确认）

| # | 事项 | 确认结果 |
| --- | --- | --- |
| T1 | 正式站名与一句话介绍 | **H-BLOG**；「千里之行，始于足下」 |
| T2 | 服务器厂商、地域、部署偏好 | 阿里云、大陆；**暂不部署，本地运行**（上线时需处理 ICP 备案，风险 R1 保持开启） |
| T3 | 域名 | 暂无；`site.url` 用占位，就绪后在 `src/config.ts` 修改 |
| T4 | GitHub 仓库 | `https://github.com/JettChen12/hblog`（public ✅） |
| T5 | 个人简介与头像素材 | 暂用可编辑占位（`src/config.ts` + `public/pixel/avatar.svg`），后续自行替换 |
| T6 | 访问统计 | 不接入（FR-36 定案） |

---

*本文档为 hblog 唯一需求基线；实现期如需偏离任何 FR/DR/H/E 条款，须在本文档变更记录中登记原因与影响。*
