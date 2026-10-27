/**
 * 像素素材生成器 —— 生成 favicon / og 图 / 像素头像。
 * 全部素材由像素矩阵代码化生成（无外部图片依赖），重新运行：pnpm pixels
 * 设计：Sweetie-16 血统的深蓝墨 × 珊瑚 × 纸白；H 字标右下角的一粒珊瑚
 * 像素是「足下的第一步」，呼应站训。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const C = {
  ink: '#191c2c',
  ink2: '#282c46',
  paper: '#e8ebf5',
  accent: '#ef7d57',
  rule: '#454a6b',
};

/** 像素矩阵 → SVG rects，支持偏移 */
function rects(mat, palette, scale = 1, ox = 0, oy = 0) {
  const out = [];
  mat.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = palette[ch];
      if (!fill) return;
      out.push(`<rect x="${ox + x * scale}" y="${oy + y * scale}" width="${scale}" height="${scale}" fill="${fill}"/>`);
    });
  });
  return out.join('');
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`;
}

/* ---------- H 字标（7×8，右下角一粒珊瑚 = 第一步） ---------- */
const H_MARK = [
  '..KKK..',
  '..K.K..',
  '..K.K..',
  '..KKK..',
  '..K.K..',
  '..K.K..',
  '..K.K..',
  '......A',
];

/* ---------- 5×7 大写字母（拉丁像素字，用于 og 图） ---------- */
const FONT5 = {
  '-': ['.....', '.....', '.....', '.PPP.', '.....', '.....', '.....'],
  B: ['.PP..', 'P...P', 'P...P', '.PPP.', 'P...P', 'P...P', '.PP..'],
  G: ['.PPP.', 'P....', 'P....', 'P..PP', 'P...P', 'P...P', '.PPP.'],
  H: ['P...P', 'P...P', 'P...P', '.PPP.', 'P...P', 'P...P', 'P...P'],
  L: ['P....', 'P....', 'P....', 'P....', 'P....', 'P....', '.PPP.'],
  O: ['.PPP.', 'P...P', 'P...P', 'P...P', 'P...P', 'P...P', '.PPP.'],
};

function textMat(str) {
  const rows = new Array(7).fill('');
  for (const ch of str) {
    const g = FONT5[ch] ?? FONT5['-'];
    g.forEach((r, i) => (rows[i] += r + '.'));
  }
  return rows;
}

/* ---------- favicon：16×16 深墨底 + H 字标 ---------- */
const faviconBody =
  `<rect width="16" height="16" fill="${C.ink}"/>` +
  rects(H_MARK, { K: C.paper, A: C.accent }, 2);
const FAVICON = svg(16, 16, faviconBody);

/* ---------- og 图 1200×630 ---------- */
function og() {
  const u = 6; // 路面像素单元
  let b = `<rect width="1200" height="630" fill="${C.ink}"/>`;
  // H 字标大块（左）
  const mS = 9, mx = 84, my = 168;
  b += `<rect x="${mx - 12}" y="${my - 12}" width="${7 * mS + 24}" height="${8 * mS + 24}" fill="${C.ink2}"/>`;
  b += rects(H_MARK, { K: C.paper, A: C.accent }, mS, mx, my);
  // H-BLOG 像素字（右侧）
  b += rects(textMat('H-BLOG'), { P: C.paper }, 5, mx + 7 * mS + 24 + 56, my + 18);
  // 底部虚线路面 + 第一粒珊瑚脚印
  for (let i = 0; i * u < 1200; i += 4) {
    b += `<rect x="${i * u}" y="560" width="${u * 2}" height="3" fill="${C.rule}"/>`;
  }
  b += `<rect x="312" y="552" width="3" height="3" fill="${C.accent}"/>`;
  return svg(1200, 630, b);
}

/* ---------- 像素头像（16×16 机器人，占位，可在 config 里换成照片） ---------- */
const AVATAR = [
  '.......A........',
  '.......K........',
  '.......K........',
  '....KKKKKKKK....',
  '...KPPPPPPPPK...',
  '..KPPPPPPPPPPK..',
  '..KPAAAAAAAAPK..',
  '..KPAAPPPPAAPK..',
  '..KPAAAAAAAAPK..',
  '..KPPPPPPPPPPK..',
  '...KPPPPPPPPK...',
  '....KKKKKKKK....',
  '...KKKPPPPKKK...',
  '..KPPPPPPPPPPK..',
  '..KPPKPPPPKPPK..',
  '..KKKKKKKKKKKK..',
];
const AVATAR_SVG = svg(16, 16, rects(AVATAR, { A: C.accent, K: C.ink, P: C.paper }));

/* ---------- 输出 ---------- */
mkdirSync('public/pixel', { recursive: true });
writeFileSync('public/favicon.svg', FAVICON);
writeFileSync('public/pixel/avatar.svg', AVATAR_SVG);

await sharp(Buffer.from(FAVICON)).resize(32, 32, { kernel: 'nearest' }).png().toFile('public/favicon-32.png');
await sharp(Buffer.from(FAVICON)).resize(180, 180, { kernel: 'nearest' }).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(og())).png().toFile('public/og.png');
console.log('像素素材已生成：favicon.svg / favicon-32.png / apple-touch-icon.png / og.png / pixel/avatar.svg');
