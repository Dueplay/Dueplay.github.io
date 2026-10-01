import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const postUrl = (post: Post) => `/posts/${post.id}/`;

export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 列表摘要：优先 description，否则截取正文纯文本
export function excerpt(post: Post, length = 140): string {
  if (post.data.description) return post.data.description;
  const text = stripMarkdown(post.body ?? '');
  return text.length > length ? text.slice(0, length) + '…' : text;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/^```.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<\/?(kbd|br|img|a|span|div|p|em|strong|code|sup|sub)\b[^>]*>/gi, ' ')
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+/gm, ' ')
    .replace(/(\*\*|`|~~|\|)/g, ' ')
    .replace(/-{3,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
