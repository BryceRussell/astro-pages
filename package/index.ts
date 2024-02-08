
import type { AstroIntegration } from 'astro';
import { resolve, extname, isAbsolute } from 'node:path';
import { existsSync} from 'node:fs';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

type Option = {
  log?: "verbose" | "minimal" | boolean | null | undefined;
  dir: string;
  glob?: string | string[];
  pattern?: (context: {
    dir: string | undefined;
    entrypoint: string;
    ext: string;
    pattern: string | undefined;
  }) => string;
}

export default function(...options: (string | Option)[]): AstroIntegration {  
  return {
    name: 'astro-pages',
    hooks: {
      'astro:config:setup': ({ config, logger, injectRoute }) => {
        const root = fileURLToPath(config.srcDir.toString())
        
        for (const option of options) {

          const defaults: Option = {} as Option

          if (typeof option === 'string') {
            // If option is a file, skip it 
            if (extname(option)) continue

            // Assume string is directory, assign to dir
            defaults.dir = option
          } else {
            // Assume option is an object and assign to defaults
            Object.assign(defaults, option)
          }

          let {
            dir,
            glob,
            pattern: transformer,
            log = true,
          } = defaults

          // Handle users not setting dir
          if (!dir) {
            if (log === "verbose") logger.warn(`'dir' is invalid!`)
            continue
          }

          // If dir is relative, resolve it relative to srcDir
          if (!isAbsolute(dir)) {
            dir = resolve(root, dir)
          }

          // Check if dir exists
          if (!existsSync(dir)) {
            if (log === "verbose") logger.warn(`'dir' does not exist!`)
            continue
          }

          // Handle glob default including empty array case
          if (!glob || (Array.isArray(glob) && !glob.length)) {
            glob = '**.{astro,ts,js}'
          }
  
          if (log) logger.info("Adding page directory: " + dir)

          // Get array of all possible page filepaths in dir
          const pages = fg.sync(
            glob,
            {
              cwd: dir,
              absolute: true,
            }
          )
          
          // Inject all possible pages from directory
          for (const entrypoint of pages) {
            const ext = extname(entrypoint)

            let pattern = entrypoint
              .slice(dir.length, ext.length * -1) // Get path between page dir and file extension
              .replace(/index$/, '') // Remove 'index' from end of path

            // Transform pattern if available
            if (transformer) {
              pattern = transformer({
                dir,
                entrypoint,
                ext,
                pattern
              })
            }

            // Handle users returning falsy patterns
            if (!pattern) {
              if (log === "verbose") logger.warn(`Invalid pattern, skipping entrypoint: ${entrypoint}`)
              continue
            }

            if (log === "verbose") logger.info('Injecting pattern: ' + pattern)

            injectRoute({
              entrypoint,
              pattern
            })
          }
          
        }
  
      }
    }
  }
}

