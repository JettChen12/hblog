---
title: CSS 像素风网页的正确打开方式
description: image-rendering、点阵字体的整数倍字号、steps() 逐帧动画与硬边框——做像素风界面绕不开的四件事，以及各自最容易踩的坑。
pubDate: 2026-10-26
tags: [CSS, 像素风]
---

像素风在 2026 年回潮了，但大多数「像素风网页」败在四个细节上。这篇把这四件事一次讲清楚，代码都来自本站。

## 位图不要让浏览器磨皮

像素画放大会被浏览器默认插值成模糊图。一行 CSS 解决：

```css
.pixelated {
  image-rendering: pixelated;
}
```

| 取值 | 效果 | 适用 |
| --- | --- | --- |
| `auto` | 平滑插值（默认） | 照片 |
| `pixelated` | 最近邻，硬边锯齿 | 像素画、点阵图 |
| `crisp-edges` | 边缘锐化，各浏览器实现不一 | 不建议依赖 |

注意矢量例外：SVG 里的像素画不要靠这个属性，给 `<svg>` 加 `shape-rendering="crispEdges"` 才是对的。

## 点阵字体只上整数倍

点阵字体的字形画在一个 12px 的网格上。字号是 12 的整数倍（12、24、36、48）时，每个像素点恰好落在物理像素上，笔画是脆的；24px 和 36px 之间的任何值都会让像素点落进半个像素，整个字立刻糊掉。

```css
:root {
  --px-12: 12px;
  --px-24: 24px;
  --px-36: 36px;
}
.px {
  font-family: "FusionPixel", ui-monospace, monospace;
  font-weight: 400; /* 点阵字体只有 Regular，禁用伪粗体 */
  font-synthesis: none;
}
```

两个配套动作：`font-synthesis: none` 防止浏览器伪造粗体把点阵涂抹掉；声明 `font-weight: 400` 并坚持只用它，层级靠字号与颜色拉开。

> 中文点阵字体体积以 MB 计。用 cn-font-split 按 unicode-range 分包后，浏览器只拉页面用到的切片，这是唯一现实的加载方案。

## 逐帧动画用 steps()，不是 ease

精灵图的行走循环要的是「一格一格跳」，缓动函数反而毁掉它：

```css
.walker {
  /* 46 秒横穿整个首屏，匀速 */
  animation: walk-across 46s linear infinite;
}
.wf {
  animation: wf-cycle 0.56s steps(1, end) infinite;
}
```

规律很简单：

- **位移**（整体移动）用 `linear`，人眼对匀速位移最舒服；
- **换帧**（两帧切换）用 `steps(1)`，帧就该跳变；
- UI 微交互（按钮按压、悬停）仍然用快 ease-out，时长压在 160ms 内。像素风不等于 UI 迟钝。

别忘了 `prefers-reduced-motion`：减弱动态时动画停掉、精灵停在第一帧，元素保持可见。

## 硬边、8px 网格、单层描边

像素语言的地基是网格纪律：

- 间距全部落在 8px 网格上（4px 允许做微调）；
- 圆角为 0，需要立体感时用双色边或阶梯投影，不用模糊投影；
- 「立体投影」是位移出来的，不是 blur 出来的：

```css
.btn {
  border: 2px solid var(--color-ink);
  box-shadow: 4px 4px 0 var(--color-rule-strong);
  transition: transform 120ms var(--ease-out),
    box-shadow 120ms var(--ease-out);
}
.btn:active {
  transform: translate(2px, 2px); /* 按下去，投影变短 */
  box-shadow: 1px 1px 0 var(--color-rule-strong);
}
```

只动画 `transform` 和 `opacity`，别碰 `width` / `height` / `top` / `left`，这条规则在像素风里尤其重要——任何布局抖动都会把点阵震糊。

四件事凑齐，像素风就成了一个体系而不是一层贴纸。剩下的克制交给一条原则：一屏一个主角，别让装饰抢了正文的活。
