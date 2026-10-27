# H-BLOG

> 千里之行，始于足下。

一个像素风的中文个人技术博客：纯静态、零后端、性能优先。
用 Astro 构建，Markdown 写作，`git push` 即发布。

## 快速开始

```bash
pnpm install     # 安装依赖
pnpm dev         # 本地开发（http://localhost:4321）
pnpm build       # 构建到 dist/ 并生成 Pagefind 搜索索引
pnpm preview     # 预览构建产物（搜索功能在此可用）
```

## 写文章

```bash
pnpm new "文章标题" [英文slug]   # 生成带模板的新文章
```

- 文章在 `src/content/blog/`，文件名即 URL（英文 kebab-case）。
- frontmatter 必填 `title / description / pubDate / tags`（1–4 个）；
  缺字段或类型错误会让构建**直接失败**并指出文件位置。
- `draft: true` 的文章只在 `pnpm dev` 可见，不会进入生产构建。
- 写完把 `draft` 改掉，`git push`，CI/部署流程接管（见下文「部署」）。

## 改个人信息

全部集中在 `src/config.ts`：

| 想改什么 | 改哪里 |
| --- | --- |
| 站名、站训、副标题 | `site` |
| 头像、昵称、简介、技能、社交链接 | `profile`（头像文件放 `public/pixel/`） |
| 导航项 | `nav` |
| 评论配置 | `giscus`（见下） |
| 友情链接 | `friends` |

## 开启评论（giscus，一次性）

1. 仓库已 public ✅（`JettChen12/hblog`）
2. 仓库 Settings → General → Features → 勾选 **Discussions**
3. 安装 [giscus App](https://github.com/apps/giscus) 到本仓库
4. 打开 [giscus.app](https://giscus.app/zh-CN)：仓库填 `JettChen12/hblog`，
   映射选 pathname，分类选 Announcements
5. 把页面生成的 `data-repo-id` 与 `data-category-id` 填进 `src/config.ts` 的 `giscus`

没配置时文章页只显示一行小字提示，其余功能不受影响。

## 搜索

Pagefind 在构建期生成静态索引（`pnpm build`）。快捷键 `Ctrl/⌘ + K` 或 `/`
唤起；开发模式下索引不存在属正常，`pnpm preview` 后可用。

## 字体与像素素材

- 像素字体：缝合像素字体 12px 等宽（OFL 开源），已按 unicode-range 分包进
  `public/font/pixel/`，浏览器按页只下载用到的几 KB。升级字体版本：`pnpm fonts`。
- favicon / og 图 / 像素头像由脚本生成（像素矩阵代码化）：`pnpm pixels`，
  想换头像直接替换 `public/pixel/avatar.svg` 或改用照片路径。

## 部署（服务器就绪后）

当前阶段**本地运行**。将来部署到阿里云轻量服务器（大陆地域绑定域名需 ICP 备案）：

```bash
# 服务器侧（一次性）：安装 Nginx，站点根指向 /var/www/hblog
# 本地发布：构建 + 同步（或在 GitHub Actions 里做同样两步）
pnpm build
rsync -avz --delete dist/ user@server:/var/www/hblog/
```

Nginx 要点：HTTP/2 + TLS（certbot 自动续期）、gzip、
带 hash 的静态资源 `immutable` 长缓存、HTML 不缓存、`error_page 404 /404.html`。
建议后续加 GitHub Actions：push 到 main 自动构建并 rsync，保留最近 5 版可回滚。

## 技术栈

Astro（SSG，默认零 JS）· 纯 CSS 设计 token（无 CSS 框架）· Shiki 双主题高亮 ·
Pagefind 静态搜索 · giscus 评论 · Fusion Pixel 像素字体 + JetBrains Mono

设计系统见 [design.md](design.md)，需求基线见 [REQUIREMENTS.md](REQUIREMENTS.md)。
