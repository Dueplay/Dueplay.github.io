import { defineConfig } from 'astro/config';
import rehypeCodeBlock from './src/plugins/rehype-code-block.mjs';

export default defineConfig({
  site: 'https://dueplay.github.io',
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: false },
    rehypePlugins: [rehypeCodeBlock],
  },
});
