import type { IntegrationOption } from '../types';
import { AstroError } from "astro/errors";
import { resolve, dirname, extname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync} from 'node:fs';
import fg from 'fast-glob';

function stringToDir(option: IntegrationOption, key: 'dir' | 'cwd', path?: string, base?: string): string {
  const { log, config, logger } = option
  
  const srcDir = fileURLToPath(config.srcDir.toString())

  // Check if path is string
  if (key === "dir") {
    if (!path || typeof path !== "string")
      throw new AstroError(`[astro-pages]: '${key}' is invalid!`, path)
  }

  path ??= srcDir

  // Check if path is a file URL
  if (path.startsWith('file:/')) {
    if (log === "verbose") logger.warn(`'${key}' is a file, using file's directory instead`)
    path = dirname(fileURLToPath(path))
  } 

  // Check if path is relative
  if (!isAbsolute(path)) {
    path = resolve(base || srcDir, path)
  }

  // Check if path is a file
  if (extname(path)) {
    if (log === "verbose") logger.warn(`'${key}' is a file, using file's directory instead`)
    path = dirname(path)
  }

  // Check if path exists
  if (!existsSync(path)) {
    throw new AstroError(`[astro-pages]: '${key}' does not exist!`, path)
  }

  // Check if path is pointing to Astro's page directory
  if (path === resolve(srcDir, 'pages')) {
    throw new AstroError(`[astro-pages]: '${key}' cannot point to Astro's 'pages' directory!`)
  }

  return path
}

export default function addPageDir(options: IntegrationOption) {

  let {
    dir,
    cwd,
    glob,
    pattern: transformer,
    log,
    logger,
    injectRoute
  } = options

  cwd = stringToDir(options, 'cwd', cwd)

  dir = stringToDir(options, 'dir', dir, cwd)

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
    if (log) logger.info("Adding page directory: " + dir)

    for (let [pattern, entrypoint] of Object.entries(patterns)) {

      // Transform pattern if available
      if (transformer) {
        pattern = transformer({
          dir,
          cwd: cwd!,
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