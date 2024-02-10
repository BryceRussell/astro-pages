
import type { AstroIntegration } from 'astro';
import type { IntegrationOption, Option } from './types';
import { addPageDir } from './utils/add-page-dir';

type Prettify<T> = { [K in keyof T]: T[K]; } & {};

export default function(...options: (string | Prettify<Option>)[]): AstroIntegration {  
  return {
    name: 'astro-pages',
    hooks: {
      'astro:config:setup': ({ config, logger, injectRoute }) => {
        
        for (const option of options) {

          const defaults: IntegrationOption = {
            config,
            logger,
            injectRoute
          } as IntegrationOption

          if (typeof option === 'string') {
            defaults.dir = option
          } else {
            Object.assign(defaults, option)
          }

          const { injectPages } = addPageDir(defaults)

          injectPages()
        }
  
      }
    }
  }
}

