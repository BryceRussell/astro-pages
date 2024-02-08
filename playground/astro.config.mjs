import { defineConfig } from 'astro/config';
import pages from 'astro-pages';

export default defineConfig({
  integrations: [
    pages(
      // 'custom',
      // 'src/custom/nested',
      {
        log: "verbose",
        dir: "custom",
        glob: ['**.{astro,ts,js}', '!**/nested/**.{astro,ts,js}'],
        pattern: ({ pattern }) => pattern
      }
    )
  ]
});