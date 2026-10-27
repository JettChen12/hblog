#!/usr/bin/env node
/**
 * 新文章脚手架：pnpm new "文章标题" [英文slug]
 * 中文标题建议带第二个参数指定英文 slug（URL 用）。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';

const [title, slugArg] = process.argv.slice(2);
if (!title) {
  console.error('用法：pnpm new "文章标题" [英文slug]');
  process.exit(1);
}

const kebab = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const stamp = new Date();
const p = (n) => String(n).padStart(2, '0');
const date = `${stamp.getFullYear()}-${p(stamp.getMonth() + 1)}-${p(stamp.getDate())}`;
const slug =
  slugArg ||
  kebab(title) ||
  `post-${stamp.getFullYear()}${p(stamp.getMonth() + 1)}${p(stamp.getDate())}`;

// 从 package.json 拿 name 作目录兜底，避免硬编码路径
const dir = new URL('../src/content/blog/', import.meta.url).pathname
  .replace(/^\/([A-Za-z]:)/, '$1');
mkdirSync(dir, { recursive: true });

const file = `${dir}${slug}.md`;
if (existsSync(file)) {
  console.error(`已存在：${file}`);
  process.exit(1);
}

const template = `---
title: ${title}
description: 一句话摘要（列表页与搜索共用，务必填写）
pubDate: ${date}
tags: [待定]
draft: true
---

正文从这里开始。
`;

writeFileSync(file, template, 'utf8');
console.log(`已创建：${file}`);
console.log('写完后把 draft 改为 false 即可发布。');
