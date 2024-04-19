import { existsSync } from "node:fs";
import { dirname, extname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { HookParameters } from "astro";
import { AstroError } from "astro/errors";
import fg from "fast-glob";

type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type Option = Prettify<{
	log?: "verbose" | "minimal" | boolean | null | undefined;
	cwd?: string;
	dir: string;
	glob?: string | string[];
	pattern?: (context: {
		cwd: string;
		dir: string;
		entrypoint: string;
		ext: string;
		pattern: string;
	}) => string;
}>;

export type IntegrationOption = Prettify<
	Option & {
		config: HookParameters<"astro:config:setup">["config"];
		logger: HookParameters<"astro:config:setup">["logger"];
	}
>;

export const GLOB_PAGES = "**.{astro,ts,js}";

export default function (options: IntegrationOption) {
	let {
		dir,
		cwd,
		glob = GLOB_PAGES,
		pattern: transformer,
		log,
		config,
		logger,
	} = options;

	const srcDir = fileURLToPath(config.srcDir.toString());

	cwd = stringToDir(options, "cwd", srcDir, cwd);

	dir = stringToDir(options, "dir", cwd, dir);

	// Handle glob default including empty array case
	if (Array.isArray(glob) && glob.length <= 0) {
		glob = GLOB_PAGES;
	}

	// Glob filepaths of pages from dir
	const entrypoints = fg.sync(
		[
			glob,
			"!**/_*", // Ignore files according to the official routing convention
			"!**/_**/*", // Ignore directories according to the official routing convention
			"!**/content/config.ts", // Ignore content collection config
			"!**/node_modules", // Ignore node modules
			"!**/*.(d|wasm).(ts|js)", // Ignore sub extensions of possible API routes
		].flat(),
		{ cwd: dir, absolute: true },
	);

	// Turn entrypoints into patterns ('/blog', '/about/us')
	const pages: Record<string, string> = {};

	for (const entrypoint of entrypoints) {
		const pattern =
			entrypoint // Transform absolute filepath into a route pattern:
				.slice(dir.length, -extname(entrypoint).length) //   Get path between page dir and file extension
				.replace(/(\\|\/)index$/, "") || //   Remove 'index' from end of path
			"/"; //   Default to root when replace is falsy

		pages[pattern] = entrypoint;
	}

	function injectPages(
		injectRoute: HookParameters<"astro:config:setup">["injectRoute"],
	) {
		// Check if directory is pointing to Astro's page directory
		if (dir === resolve(srcDir, "pages")) {
			throw new AstroError(
				`Failed to inject pages! Directory cannot point to Astro's 'pages' directory`,
				dir,
			);
		}

		if (log) logger.info("Adding pages: " + dir);

		for (let [pattern, entrypoint] of Object.entries(pages)) {
			// Transform pattern if available
			if (transformer) {
				pattern = transformer({
					dir,
					cwd: cwd!,
					entrypoint,
					ext: extname(entrypoint),
					pattern,
				});
			}

			// Handle falsy patterns from transformer
			if (!pattern) {
				if (log === "verbose")
					logger.warn(`Invalid pattern, skipping entrypoint: ${entrypoint}`);
				continue;
			}

			if (log === "verbose") logger.info("Injecting pattern: " + pattern);

			injectRoute({
				// @ts-expect-error "Object literal may only specify known properties"
				entryPoint: entrypoint,
				entrypoint,
				pattern,
			});
		}
	}

	return {
		pages,
		injectPages,
	};
}

function stringToDir(
	option: IntegrationOption,
	key: "dir" | "cwd",
	base: string,
	path?: string,
): string {
	const { log, logger } = option;

	// Check if path is string
	if (key === "dir") {
		if (!path || typeof path !== "string")
			throw new AstroError(`'${key}' path is invalid!`, path);
	}

	if (!path) path = base;

	// Check if path is a file URL
	if (path.startsWith("file:/")) {
		path = fileURLToPath(path);
	}

	// Check if path is relative
	if (!isAbsolute(path)) {
		path = resolve(base, path);
	}

	// Check if path is a file
	if (extname(path)) {
		if (log === "verbose")
			logger.warn(`'${key}' is a file, using file's directory instead`);
		path = dirname(path);
	}

	// Check if path exists
	if (!existsSync(path)) {
		throw new AstroError(`'${key}' path does not exist!`, path);
	}

	return path;
}
