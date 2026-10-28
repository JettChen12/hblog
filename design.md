# H-BLOG 设计系统（锁定）

> 本文件是全站设计的单一真源。新页面、新组件一律遵循此系统；
> 改 token 只改 `src/styles/tokens.css`（色值与 `src/theme.ts` 保持同步）。
> 设计流程：Hallmark v2（自定义路线）+ Emil Kowalski 设计工程原则（动效）。

## 一句话

**行路者的像素终端**：整套设计从站训「千里之行，始于足下」生长出来——
首页 hero 由一幅**静态像素山景横幅**收束（甜色日轮、点染云、双层群峰、
山径与第一枚珊瑚脚印），H 字标右下角的一粒珊瑚像素与山径脚印同义：
都是「足下的第一步」。

**v1.2 变更（站长定案）**：移除行走旅人动画（违和），签名改为静态山景；
全站像素密度上调——页面点阵底纹、标题珊瑚方块标记（`.px-mark`）、
标签芯片像素点、文章行悬停选择光标、抖动（dither）分隔带与页脚收顶、
404 像素路牌、回顶按钮。氛围纪律不变：无扫描线、无噪点、无位移循环动画。

## 色彩

血统：Sweetie-16（GrafxKid）的「深蓝墨 × 珊瑚 × 琥珀」关系，OKLCH 重新推导。
姿态：**Restrained**——珊瑚信号色只出现在链接悬停、焦点环、主按钮、当前项、
高亮 mark，永远小于视口 5%。明暗双模式均为一等公民，切换时色相不移动。

| Token | 亮色 | 暗色 | 用途 |
| --- | --- | --- | --- |
| `--color-paper` | #f2f3f9 | #191c2c | 页面底 |
| `--color-paper-2` | #e9ebf5 | #202437 | 抬升面（卡片、代码头） |
| `--color-paper-3` | #dfe2f0 | #282c46 | 行内代码底 |
| `--color-ink` | #1c1f33 | #e8ebf5 | 标题正文（暗色下即旅人轮廓） |
| `--color-ink-2` | #4a5070 | #a6adcb | 次级文字、日期 |
| `--color-ink-3` | #6d7494 | #7c84a6 | 弱文字、路面虚线 |
| `--color-rule` | #c9cde3 | #313551 | 细分割线 |
| `--color-rule-strong` | #a9afc9 | #454a6b | 像素边框、硬投影 |
| `--color-accent` | #ef7d57 | #ff8f61 | 信号色（填充） |
| `--color-accent-text` | #b8391f | #ffa07c | 信号色（作文字） |
| `--color-accent-ink` | #1c1f33 | #191c2c | 信号色填充上的文字 |
| `--color-code-bg` | #e7e9f4 | #141626 | 代码块底 |

对比度：正文组合 ≥ 4.5:1（双模式数值核验过）；sloplint 0 FAIL。

## 字体

| 角色 | 字体 | 规则 |
| --- | --- | --- |
| 展示/UI | Fusion Pixel 12px 等宽 zh_hans（OFL，自托管分包） | 字号只用 12/24/36/48/60px 整数倍；`font-synthesis: none`，禁伪粗体 |
| 正文 | 系统中文栈（system-ui / PingFang / MiSans / Microsoft YaHei） | ≥ 16px，正文 17px，行高 1.85；行宽 `--measure-body: 40em` |
| 代码 | JetBrains Mono Variable + 中文回退正文栈 | 唯一 outlier 角色，Shiki 双主题随站点明暗切换 |

中文像素字体经 cn-font-split 按 `unicode-range` 分包（58 个 woff2 切片），
浏览器按页取用：首页实测只下载 6 片共约 2KB。升级字体：`pnpm fonts`。

## 像素原语

- `--pixel-unit: 2px`：像素画基准格；间距落在 8px 网格（4px 半步）。
- 边框一律 `2px solid`（`--border-pixel`），**圆角为 0**；立体感来自
  双色边或硬投影 `4px 4px 0`，绝不使用模糊投影。
- 位图与像素 SVG 一律 `image-rendering: pixelated` / `shape-rendering: crispEdges`。
- 全站图标是自绘像素 SVG（`PixelIcon.astro` 矩阵渲染），单一图标库，禁止 emoji 当图标。
- 氛围效果纪律：全站**没有**扫描线、噪点、CRT 弯曲；唯一氛围是行走旅人。

## 动效（Emil 原则落地）

- v1.2 起全站**无循环位移动画**（行走旅人已移除）；剩余动效全部为交互反馈。

- 属性白名单：`transform` / `opacity` / `clip-path`；禁止 `transition: all`、
  禁止动画 `width/height/top/left`。
- 缓动：入场 `cubic-bezier(0.23,1,0.32,1)`；屏幕内移动 `cubic-bezier(0.77,0,0.175,1)`；
  颜色/hover 用 `ease`；精灵换帧与横穿路面用 `steps()` / `linear`（像素风专属）。
- 时长：按压 120ms、hover/菜单 200ms、页面级 300ms 封顶；叙事动画（旅人横穿 46s）除外。
- 按压反馈：所有可点元素 `:active { scale(0.97) }`（按钮走 translate + 硬投影变短）。
- 入场从 `scale(0.95)+opacity:0` 起，永不出自 0。
- hover 效果全部包在 `@media (hover:hover) and (pointer:fine)`。
- `prefers-reduced-motion`：位移/换帧动画停止（旅人站定），保留颜色过渡。
- 键盘唤起的搜索面板零动画（`data-instant`）。
- 列表 stagger 48ms，仅一次，无 JS 时全部可见。
- 主题切换 200ms 颜色过渡 + 首帧前内联脚本防闪烁。

## 组件配方

- **主按钮**（全站唯一实心）：珊瑚填充 + 2px 墨边 + 4px 硬投影；hover 上浮 1px、
  active 下压 2px（投影随位移伸缩，transform-only）。
- **次按钮**：透明底 + rule-strong 描边，hover 变 paper-2。
- **文章行**：`120px 日期 | 内容` 两栏，2px 顶线；hover 标题变珊瑚。
- **代码块**：2px 边框方块，头部（paper-2 底、语言名 + 复制按钮），
  无 JS 时裸 pre 仍完整。
- **目录**：桌面 sticky 右栏 / 移动 `<details>`，当前节珊瑚左标线（无动画）。
- **搜索**：`Ctrl/⌘+K` 或 `/` 唤起，Pagefind 静态索引，键盘唤起零动画。
- **评论**：giscus 懒加载（滚入 400px 前不注入），主题跟随站点。

## Hallmark 记录

- Stamp 在 `tokens.css` 首三行（shape: Waypoint 行路 / custom / job: read）。
- 豁免：47b（代码块外框=真实材料容器）、37（等宽字单角色）。
- 撤销警告：3（引用块 4px 珊瑚边=编辑惯例非卡片条纹）。
- 最近一次 sweep：`sloplint src/styles/*.css` → 0 FAIL / 0 WARN / 1 DISMISSED。
