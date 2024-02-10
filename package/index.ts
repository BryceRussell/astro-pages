
import type { AstroIntegration } from 'astro';
import type { IntegrationOption, Option, Prettify } from './types';
import { addPageDir } from './utils/add-page-dir';

export default function(...options: (string | Prettify<Option>)[]): AstroIntegration {  
  return {
    name: 'astro-pages',
    hooks: {
      'astro:config:setup': ({ config, logger, injectRoute }) => {
        
        for (const option of options) {

          const defaults: IntegrationOption = {} as IntegrationOption

          if (typeof option === 'string') {
            defaults.dir = option
          } else {
            if (!option || !option?.dir) continue
            Object.assign(defaults, option)
          }

          Object.assign(defaults, {
            config,
            logger,
            injectRoute
          })

          const { injectPages } = addPageDir(defaults)

          injectPages()
        }
  
      }
    }
  }
}

export { addPageDir }

