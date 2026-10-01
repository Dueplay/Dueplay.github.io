import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl, excerpt } from '../utils';
import { SITE } from '../site.config';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: excerpt(post),
      categories: post.data.categories,
      link: postUrl(post),
    })),
  });
}
