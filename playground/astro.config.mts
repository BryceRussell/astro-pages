import { createResolver } from "astro-integration-kit";
import { hmrIntegration } from "astro-integration-kit/dev";
import { defineConfig } from "astro/config";

const { default: packageName, addPageDir } = await import("astro-pages");

// https://astro.build/config
export default defineConfig({
	integrations: [
		packageName("custom"),
		{
			name: "test",
			hooks: {
				"astro:config:setup": ({ config, logger }) => {
					const { pages, injectPages } = addPageDir({
						dir: "custom",
						config,
						logger,
					});
				},
			},
		},
		hmrIntegration({
			directory: createResolver(import.meta.url).resolve("../package/dist"),
		}),
	],
});
