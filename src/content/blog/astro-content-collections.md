---
title: 用 Content Collections 管理文章，frontmatter 写错直接构建失败
description: Astro 内容集合的完整链路：glob 加载器、Zod 校验、按日期排序与草稿过滤，让每篇文章从源头就是类型安全的。
pubDate: 2026-10-27
tags: [Astro, 建站]
---

博客最容易烂掉的地方不是样式，是内容元数据：日期写成字符串、标签拼错、草稿忘了标记然后直接发了出去。Astro 的 Content Collections 把这一层变成了契约。

## 定义集合

一个配置文件声明「文章放哪、长什么样」：

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).min(1).max(4),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

从这一刻起，frontmatter 不再是「希望大家都写对」，而是「写错就构建失败，并且错误指向具体文件」。`z.coerce.date()` 顺带解决了 `2026-10-27` 字符串到日期对象的转换。

## frontmatter 即契约

发布一篇新文章，能写的字段就这些，多一个少一个都会被拦下：

```yaml
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-10-27
tags: [Astro, 建站]
draft: false
---
```

`tags` 限定了 1 到 4 个——这不是技术限制，是逼自己在打标签时做减法。一个二十个标签的博客等于没有标签。

## 在页面里取数据

动态路由把每篇文章生成为静态页：

```astro
---
// src/pages/posts/[...id].astro
import { getPosts } from '@/lib/posts';

export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}
const { post } = Astro.props;
const { Content, headings } = await render(post);
---
<Content />
```

`headings` 是免费送的：标题层级、自动生成的锚点 id 都在里面，直接喂给目录组件。

## 草稿与排序

排序和草稿过滤写在工具函数里，所有页面共用一份逻辑：

```ts
export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.DEV ? true : !data.draft,
  );
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}
```

`import.meta.env.DEV` 让草稿在本地开发可见、生产构建直接消失——写一半的文章不会哪天手滑上线。

## 值得吗

多写的这三十行配置，换来的是：任何一篇文章的元数据在任何页面上的用法都有类型提示；typo 在 CI 阶段爆炸而不是在线上被发现。内容量越大，这笔账越划算。
