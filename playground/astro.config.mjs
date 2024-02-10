import { defineConfig } from 'astro/config';
import pages from 'astro-pages';

export default defineConfig({
  integrations: [
    pages(
      // 'custom',
      // 'src/custom/nested',
      {
        log: "verbose",
        cwd: import.meta.url,
        dir: "pages",
        glob: ['**.{astro,ts,js}', '!**/nested/**.{astro,ts,js}'],
        pattern: ({ pattern }) => pattern
      }
    )
  ]
});