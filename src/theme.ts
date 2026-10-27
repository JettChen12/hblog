/**
 * H-BLOG 调色板单源。
 * 血统：Sweetie-16（GrafxKid，lospec.com/palette-list/sweetie-16）的
 * 「深蓝墨 × 珊瑚 × 琥珀」关系，按 OKLCH 重新推导为双模式 token。
 * src/styles/tokens.css 与本文件保持同步（那边是运行时真源，这边供
 * Shiki 代码高亮等构建期消费者取值）。修改时两处一起改。
 */

export const palette = {
  dark: {
    paper: '#191c2c',
    paper2: '#202437',
    paper3: '#282c46',
    ink: '#e8ebf5',
    ink2: '#a6adcb',
    ink3: '#7c84a6',
    rule: '#313551',
    ruleStrong: '#454a6b',
    accent: '#ff8f61', // 珊瑚（深色模式提亮版）
    accentText: '#ffa07c',
    accentSoft: 'rgba(255, 143, 97, 0.14)',
    accentInk: '#191c2c',
    selection: '#ff8f61',
    codeBg: '#141626',
  },
  light: {
    paper: '#f2f3f9',
    paper2: '#e9ebf5',
    paper3: '#dfe2f0',
    ink: '#1c1f33',
    ink2: '#4a5070',
    ink3: '#6d7494',
    rule: '#c9cde3',
    ruleStrong: '#a9afc9',
    accent: '#ef7d57', // 珊瑚（Sweetie-16 原值，做填充）
    accentText: '#b8391f', // 深珊瑚，做正文色文字（对比 ≥4.5:1）
    accentSoft: 'rgba(239, 125, 87, 0.14)',
    accentInk: '#1c1f33',
    selection: '#ef7d57',
    codeBg: '#e7e9f4',
  },
} as const;

/** Shiki 双主题：颜色取自同一色族，语法色是“内容着色”，不占用 UI 信号色预算 */
export const shikiThemes = {
  light: {
    name: 'hblog-light',
    type: 'light',
    colors: { 'editor.background': palette.light.codeBg, 'editor.foreground': '#262a43' },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6d7494' } },
      { scope: ['keyword', 'storage.type', 'storage.modifier', 'support.type'], settings: { foreground: '#b8391f' } },
      { scope: ['string', 'string.quoted', 'entity.name.tag'], settings: { foreground: '#2f7d3a' } },
      { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: '#8a5a00' } },
      { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#8a4f16' } },
      { scope: ['entity.name.type', 'entity.name.class', 'support.class'], settings: { foreground: '#146a70' } },
      { scope: ['variable', 'meta.definition.variable'], settings: { foreground: '#262a43' } },
      { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#4a5070' } },
      { scope: ['markup.heading'], settings: { foreground: '#b8391f', fontStyle: 'bold' } },
      { scope: ['markup.inserted'], settings: { foreground: '#2f7d3a' } },
      { scope: ['markup.deleted'], settings: { foreground: '#b8391f' } },
      { scope: ['markup.changed'], settings: { foreground: '#8a5a00' } },
    ],
  },
  dark: {
    name: 'hblog-dark',
    type: 'dark',
    colors: { 'editor.background': palette.dark.codeBg, 'editor.foreground': '#dfe3f2' },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#7c84a6' } },
      { scope: ['keyword', 'storage.type', 'storage.modifier', 'support.type'], settings: { foreground: '#ff8f61' } },
      { scope: ['string', 'string.quoted', 'entity.name.tag'], settings: { foreground: '#97d26e' } },
      { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: '#ffcd75' } },
      { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#ffc389' } },
      { scope: ['entity.name.type', 'entity.name.class', 'support.class'], settings: { foreground: '#73d0d8' } },
      { scope: ['variable', 'meta.definition.variable'], settings: { foreground: '#dfe3f2' } },
      { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#a6adcb' } },
      { scope: ['markup.heading'], settings: { foreground: '#ff8f61', fontStyle: 'bold' } },
      { scope: ['markup.inserted'], settings: { foreground: '#97d26e' } },
      { scope: ['markup.deleted'], settings: { foreground: '#ff8f61' } },
      { scope: ['markup.changed'], settings: { foreground: '#ffcd75' } },
    ],
  },
};
