import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    /** 中文标题 */
    title: z.string(),
    /** 一句摘要（列表页与 SEO description 共用） */
    description: z.string(),
    /** 发布日期 */
    pubDate: z.coerce.date(),
    /** 重要更新日期 */
    updatedDate: z.coerce.date().optional(),
    /** 1–4 个标签 */
    tags: z.array(z.string()).min(1).max(4),
    /** 草稿不进入生产构建 */
    draft: z.boolean().default(false),
    /** 头图（放 src/assets/，走构建优化） */
    heroImage: z.string().optional(),
  }),
});

export const collections = { blog };
