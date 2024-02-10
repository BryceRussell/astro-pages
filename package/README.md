# `astro-pages`

Add custom file based routing directories in Astro

## Why `astro-pages`?

Astro does not have an option to change the location of the `page` folder, and ignoring files/folders  requires you to prefix their names with an underscore `_`.

## Features
- Add file based routing anywhere inside your project
- Use glob patterns to match routes
- Supports negative glob patterns to ignore routes
- Override/transform route patterns
- Use standalone inside an integration

## Using

Install package:

```
npm i astro-pages  
```

Add to Astro config:
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import pages from 'astro-pages';

export default defineConfig({
  // Create 'page' directory at 'src/custom'
  integrations: [pages('custom')],
});
```

## Examples

**Adding page directories**

```js
// Create 'page' directories at 'src/blog' and `src/projects`
pages(
  'blog', 
  {
    dir: 'projects'
  }
)
```

**Customize base directory for relative paths**

```js
pages(
  {
    // Resolves to 'custom' dir at the root of your project
    dir: 'custom',
    cwd: import.meta.url, // astro.config.mjs
  },
),
```

**Ignoring routes**

```js
pages(
  {
    dir: 'custom',
    // Ignore all routes inside 'src/custom/ignore'
    glob: '["**.{astro,ts,js}", "!**/ignore/**"]'
  },
),
```

**Transform route pattern**

```js
pages(
  {
    dir: 'custom',
    // Transform page patterns, add base path to routes
    pattern: ({ pattern }) => '/base' + pattern 
  },
),
```

**Customize logging**

```js
pages(
  {
    dir: 'custom',
    // Log injetced pages and warnings
    log: "verbose"
  },
),
```

**Use it all together**

```js
pages(
  {
    dir: 'custom',
    glob: '["**.{astro,ts,js}", "!**/ignore/**"]'
    pattern: ({ pattern }) => '/base' + pattern 
    log: "verbose"
  },
  // ...
),
```

**Standalone inside inside an integration**:

```js
import type { AstroIntegration } from 'astro';
import { addPageDir } from 'astro-pages';

export default function(options): AstroIntegration {  
  return {
    name: 'astro-pages',
    hooks: {
      'astro:config:setup': ({ config, logger, injectRoute }) => {
        
          const option = {
            cwd: import.meta.url,
            dir: 'pages',
            glob: '["**.{astro,ts,js}"]'
            log: "minimal"
            config,
            logger,
            injectRoute
          }

          const { 
            patterns, 
            entrypoints,
            injectPages 
          } = addPageDir(option)

          injectPages()
  
      }
    }
  }
}
```

**Use as a [`astro-integration-kit`](https://astro-integration-kit.netlify.app/getting-started/installation/) plugin**

```js
// my-package/index.ts
import { defineIntegration } from "astro-integration-kit";
import addPageDirPlugin from "astro-pages/plugins/astro-integration-kit.ts";

export default defineIntegration({
    name: "my-integration",
    plugins: [addPageDirPlugin],
    setup() {
        return {
            "astro:config:setup": ({ addPageDir }) => {
              // Inject pages from your package's 'pages' folder
              addPageDir({
                cwd: import.meta.url,
                dir: "pages"
              })
            }
        }
    }
})
```

## `Option` Reference

### `dir`

**Type**: `string`

Directory of pages, relative dirs are resolved relative to `srcDir` (`/src` by default). Directories located outside the root of your project may cause problems.

### `cwd`

**Type**: `string`

**Default**: Astro config `srcDir`

Directory that the `dir` option is resolved to if it is relative. If the `cwd` option is relative it is resolved relative to the `srcDir` in Astro config (`/src` by default).

### `glob`

**Type**: `string | string[]`

**Default**: `"**.{astro,ts,js}"`

A glob pattern (or array of glob patterns) matching pages inside your page directory. [Supports negative patterns](https://www.npmjs.com/package/fast-glob#how-to-exclude-directory-from-reading) to ignore specific paths. Only point to file extensions that Astro supports!

### `pattern`

**Type**: `function`

```ts
(route: {
  dir: string;
  entrypoint: string;
  ext: string;
  pattern: string;
}) => string
```

Function used to transform the pattern/path pages are located at

### `log`

**Type**: `"verbose" | "minimal" | boolean | null | undefined`

**Default**: `true`

- `"verbose"`: Log all warnings and page injections
- `"minimal" | true`: Log addition of a page directory
- `false | null | undefined`: No logging