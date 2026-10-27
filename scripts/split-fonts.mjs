/**
 * 字体管线：Fusion Pixel 12px 等宽（zh_hans）→ cn-font-split 分包 → 生成
 * src/styles/font-pixel.css。分包产物（woff2 + unicode-range 切片）提交进仓库，
 * 正常写作无需重跑；仅当想升级字体版本时运行：pnpm fonts
 *
 * 依赖：tools/fonts/ 下的 fusion-pixel-12px-monospaced-zh_hans.ttf
 * （首次获取：从 https://github.com/TakWolf/fusion-pixel-font/releases 下载
 *   12px-monospaced-ttf zip 解压；网络不通时可加 gh-proxy 前缀）
 * 许可：SIL OFL 1.1（TakWolf / 缝合像素字体）
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';

const SRC = 'tools/fonts/fusion-pixel-12px-monospaced-zh_hans.ttf';
const OUT = 'public/font/pixel';
const CSS_OUT = 'src/styles/font-pixel.css';
const FAMILY = 'FusionPixel';

if (!existsSync(SRC)) {
  console.error(`缺少字体源文件 ${SRC}，请看本文件头部注释获取。`);
  process.exit(1);
}

console.log('cn-font-split 分包中……');
execSync(`npx --yes cn-font-split -i ${SRC} -o ${OUT}`, { stdio: 'inherit' });

console.log('后处理 CSS……');
let css = readFileSync(`${OUT}/result.css`, 'utf8');
css = css
  .replaceAll('font-family:"Fusion Pixel 12px Mono zh-Hans"', `font-family:"${FAMILY}"`)
  .replaceAll('url("./', `url("/font/pixel/`);

const header = `/* ${FAMILY} —— 缝合像素字体 12px 等宽 zh_hans（SIL OFL 1.1, TakWolf）
   由 scripts/split-fonts.mjs 生成：cn-font-split 按 unicode-range 分包，
   浏览器只下载页面实际用到的切片（woff2 位于 /font/pixel/）。
   手写代码不要改本文件；升级字体请重跑 pnpm fonts。 */\n`;

writeFileSync(CSS_OUT, header + css);

// 清理分包工具的附属产物，public 里只留 woff2
for (const f of ['index.html', 'reporter.bin', 'index.proto', 'result.css']) {
  rmSync(`${OUT}/${f}`, { force: true });
}
console.log(`完成：${CSS_OUT}`);
