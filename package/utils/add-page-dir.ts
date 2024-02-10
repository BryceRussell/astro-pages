import type { IntegrationOption } from '../types';
import { AstroError } from "astro/errors";
import { resolve, dirname, extname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync} from 'node:fs';
import fg from 'fast-glob';

export function addPageDir(options: IntegrationOption) {

  let {
    dir,
    glob,
    pattern: transformer,
    log = true,
    config,
    logger,
    injectRoute
  } = options

  const srcDir = fileURLToPath(config.srcDir.toString())

  // Handle users not setting dir correctly
  if (!dir || typeof dir !== "string") {
    throw new AstroError(`[astro-pages]: 'dir' is invalid!`, dir)
  }

  // Check if dir is a file URL
  if (dir.startsWith('file:/')) {
    if (log === "minimal") logger.warn(`'dir' is a file, using file's directory instead`)
    dir = dirname(fileURLToPath(dir))
  } 

  // If dir is relative, resolve it relative to srcDir
  if (!isAbsolute(dir)) {
    dir = resolve(srcDir, dir)
  }

  // Check if dir is a file
  if (extname(dir)) {
    if (log === "minimal") logger.warn(`'dir' is a file, using file's directory instead`)
    dir = dirname(dir)
  }

  // Check if dir exists
  if (!existsSync(dir)) {
    throw new AstroError(`[astro-pages]: 'dir' does not exist!`, dir)
  }

  // Check if dir is pointing to Astro's page directory
  if (dir === resolve(srcDir, 'pages')) {
    throw new AstroError(`[astro-pages]: 'dir' cannot point to Astro's 'pages' directory!`)
  }

  // Handle glob default including empty array case
  if (!glob || (Array.isArray(glob) && !glob.length)) {
    glob = '**.{astro,ts,js}'
  }

  
  // Glob filepaths of pages from dir
  const entrypoints = fg.sync(
    [ 
      glob,
      "!**/content/config.ts",    // Ignore content collection config
      "!**/node_modules",         // Ignore node modules
      "!**/*.(d|wasm).(ts|js)"    // Ignore sub extensions of possible API routes
    ].flat(),
    { cwd: dir, absolute: true }
  )


  // Turn entrypoints into patterns ('/blog', '/about/us')
  let patterns: Record<string, string> = {}

  for (const entrypoint of entrypoints) {
    let pattern = entrypoint                          // Transoform absolute filepath into a route pattern:
      .slice(dir.length, -extname(entrypoint).length) //   Get path between page dir and file extension
      .replace(/(\\|\/)index$/, '')                   //   Remove 'index' from end of path
      || '/'                                          //   Default to root when replace is falsy

    patterns[pattern] = entrypoint
  }


  function injectPages() {
    if (log === "minimal" || log === "verbose") logger.info("Adding page directory: " + dir)

    for (let [pattern, entrypoint] of Object.entries(patterns)) {

      // Transform pattern if available
      if (transformer) {
        pattern = transformer({
          dir,
          entrypoint,
          ext: extname(entrypoint),
          pattern
        })
      }
        
      // Handle falsy patterns from transformer
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


  return {
    patterns,
    entrypoints,
    injectPages
  }
}