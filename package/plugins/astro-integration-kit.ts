import { definePlugin } from "astro-integration-kit";
import type { IntegrationOption, Option } from "../types";
import addPageDir from "../utils/add-page-dir";

export default definePlugin({
	name: "addPageDir",
	hook: "astro:config:setup",
	implementation: ({ config, logger, injectRoute }) => {
		return (option: string | Option) => {
			if (typeof option === "string") {
				option = {
					dir: option,
				};
			}

			Object.assign(option, { config, logger });

			const { pages, injectPages } = addPageDir(option as IntegrationOption);

			return {
				pages,
				injectPages: () => injectPages(injectRoute),
			};
		};
	},
});
