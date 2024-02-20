
import type { AstroIntegration } from 'astro';
import type { IntegrationOption, Option, Prettify } from './types';
import addPageDir from './utils/add-page-dir';

export default function(...options: (string | Prettify<Option>)[]): AstroIntegration {  
  return {
    name: 'astro-pages',
    hooks: {
      'astro:config:setup': ({ config, logger, injectRoute }) => {
        
        for (let option of options) {

          const defaults = {
            config,
            logger,
            injectRoute
          }
          
          if (typeof option === 'string') {
            option = {
              dir: option
            }
          }

          if (!option || !option?.dir || typeof option?.dir !== "string") {
            logger.warn(`Skipping invalid option "${JSON.stringify(option, null, 4)}"`)
            continue
          }
          
          Object.assign(defaults, option)

          const { injectPages } = addPageDir(defaults as IntegrationOption)

          injectPages()
        }
  
      }
    }
  }
}

export { addPageDir }

