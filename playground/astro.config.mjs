import pages from "astro-pages";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		pages(
			// 'custom',
			// 'src/custom/nested',
			{
				log: "verbose",
				// cwd: import.meta.url,
				dir: "custom",
				glob: ["**.{astro,ts,js}", "!**/nested/**.{astro,ts,js}"],
				pattern: ({ pattern }) => pattern,
			},
		),
	],
});
