import { defineConfig } from 'astro/config';
import auraTheme from './src/plugins/aura-theme.mjs';
import rehypeCodeBlock from './src/plugins/rehype-code-block.mjs';

export default defineConfig({
  site: 'https://dueplay.github.io',
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  markdown: {
    shikiConfig: { theme: auraTheme, wrap: false },
    rehypePlugins: [rehypeCodeBlock],
  },
});
