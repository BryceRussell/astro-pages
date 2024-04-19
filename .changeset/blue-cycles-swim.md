---
"astro-pages": minor
---

Added a build step and restructured the package. All exports except for the root module have been removed:

```ts
// Use the types
import type { Option, IntegrationOption } from 'astro-pages';

// Use the Astro integration
import addPageDirIntegration from 'astro-pages';

// Use the utility (inside an Astro integration)
import { addPageDir } from 'astro-pages';
```