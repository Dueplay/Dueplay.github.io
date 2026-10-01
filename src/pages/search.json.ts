import type { APIRoute } from 'astro';
import { getPosts, postUrl, formatDate, excerpt, stripMarkdown } from '../utils';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const data = posts.map((post) => ({
    title: post.data.title,
    url: postUrl(post),
    date: formatDate(post.data.date),
    categories: post.data.categories,
    summary: excerpt(post),
    content: stripMarkdown(post.body ?? ''),
  }));
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};
