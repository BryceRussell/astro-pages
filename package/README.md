# `astro-pages`

[![npm version](https://img.shields.io/npm/v/astro-pages?labelColor=red&color=grey)](https://www.npmjs.com/package/astro-pages)
[![readme](https://img.shields.io/badge/README-blue)](https://www.npmjs.com/package/astro-pages)

Add custom file based routing directories in Astro

## Why `astro-pages`?

Astro does not have an option to change the location of the `page` folder, you can't have multiple page folders (ex: inside a package), and ignoring pages normally requires you to prefix the file name with an underscore `_`.

## Features
- Add file based routing anywhere inside your project or package
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
  // Inject pages inside 'src/routes'
  integrations: [ pages('routes') ],
});
```

## Examples

**Create multiple page directories**

```js
// Create 'page' directories at 'src/routes' and `routes/`
pages(
  'routes', 
  {
    cwd: '../',
    dir: 'routes'
  }
)
```

**Customize base directory for relative paths**

```js
pages(
  {
    // Resolves to 'routes' dir at the root of your project
    dir: 'routes',
    cwd: '../', // project root
  },
),
```

**Ignoring routes**

```js
pages(
  {
    dir: 'routes',
    // Ignore all routes inside 'src/custom/ignore'
    glob: '["**.{astro,ts,js}", "!**/ignore/**"]'
  },
),
```

**Transform route pattern**

```js
pages(
  {
    dir: 'routes',
    // Transform page patterns, add base path to routes
    pattern: ({ pattern }) => '/base' + pattern 
  },
),
```

**Debug with verbose logging**

```js
pages(
  {
    dir: 'routes',
    // Log injetced pages and warnings
    log: "verbose"
  },
),
```

**Use it all together**

```js
pages(
  {
    dir: 'routes',
    glob: '["**.{astro,ts,js}", "!**/ignore/**"]'
    pattern: ({ pattern }) => '/base' + pattern 
    log: "verbose"
  },
  // ...
),
```

**Standalone inside inside an integration**:

```js
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

## `Option` Reference

### `dir`

**Type**: `string`

The page directory, relative dirs are resolved relative to `srcDir` (`/src` by default).

> **Note**: Directories located outside the root of your project may cause problems since they are not loaded by Astro

### `cwd`

**Type**: `string`

**Default**: Astro config `srcDir`

Directory that the `dir` option is resolved to if it is relative. If the `cwd` option itself relative it is resolved relative to the `srcDir` in Astro config (`/src` by default).

### `glob`

**Type**: `string | string[]`

**Default**: `"**.{astro,ts,js}"`

A glob pattern (or array of glob patterns) matching page files inside your page directory. [Supports negative patterns](https://www.npmjs.com/package/fast-glob#how-to-exclude-directory-from-reading) to ignore specific paths. 

> **Note**: Only glob files that Astro supports! (`.astro`, `.ts`, and `.js` by default)

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
