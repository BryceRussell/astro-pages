# astro-pages

## 0.3.1

### Patch Changes

- 9c61739: Upgrade to Astro 5.0

## 0.3.0

### Minor Changes

- 97e9cde: - Added a build step and restructured the package.

  - The `astro-integration-kit` plugin was removed, use the utility instead
  - All exports from `astro-pages/plugins` and `astro-pages/utils` have been removed, import from `astro-pages` instead:

  ```ts
  // Use the types
  import type { Option, IntegrationOption } from "astro-pages";

  // Use the Astro integration
  import addPageDirIntegration from "astro-pages";

  // Use the utility (inside an Astro integration)
  import { addPageDir } from "astro-pages";
  ```
