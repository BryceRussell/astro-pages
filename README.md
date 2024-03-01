# `astro-pages`

[![npm version](https://img.shields.io/npm/v/astro-pages?labelColor=red&color=grey)](https://www.npmjs.com/package/astro-pages)
[![readme](https://img.shields.io/badge/README-blue)](https://www.npmjs.com/package/astro-pages)

Add custom file based routing directories in Astro

### Examples

#### Integration

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import pages from 'astro-pages';

export default defineConfig({
  // Inject pages inside 'src/routes'
  integrations: [ pages('routes') ],
});
```

#### Standalone Utility

```ts
// package/index.ts
import type { AstroIntegration } from 'astro';
import { addPageDir } from 'astro-pages';

export default function(options): AstroIntegration {  
  return {
    name: 'astro-pages',
    hooks: {
      'astro:config:setup': ({ config, logger, injectRoute }) => {

        const pageConfig = {
          cwd: import.meta.url,
          dir: 'pages',
          config,
          logger
        }

        const { 
          pages,
          injectPages 
        } = addPageDir(pageConfig)

        // Injects pages inside 'package/pages'
        injectPages(injectRoute)

      }
    }
  }
}
```

#### Astro Integration Kit Plugin

```ts
// package/index.ts
import { defineIntegration } from "astro-integration-kit";
import addPageDirPlugin from "astro-pages/plugins/astro-integration-kit.ts";

export default defineIntegration({
    name: "my-integration",
    plugins: [addPageDirPlugin],
    setup() {
        return {
            "astro:config:setup": ({ addPageDir }) => {

              const pageConfig = {
                cwd: import.meta.url,
                dir: "pages"
              }

              const { 
                pages,
                injectPages 
              } = addPageDir(pageConfig)

              // Injects pages inside 'package/pages'
              injectPages()

            }
        }
    }
})
```

