import rss from '@astrojs/rss';
import { marked } from 'marked';
import type { APIContext } from 'astro';
import { site } from '@/config';
import { getPosts } from '@/lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: `${site.tagline}。${site.intro}`,
    site: context.site ?? site.url,
    items: await Promise.all(
      posts.map(async (p) => ({
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.pubDate,
        link: `/posts/${p.id}/`,
        content: await marked.parse(p.body ?? '', { async: true }),
      })),
    ),
    customData: '<language>zh-CN</language>',
  });
}
