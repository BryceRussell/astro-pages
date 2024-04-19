import type { AstroIntegration } from "astro";
import addPageDir, { type IntegrationOption, type Option } from "./utility.js";

export default function (...options: (string | Option)[]): AstroIntegration {
	return {
		name: "astro-pages",
		hooks: {
			"astro:config:setup": ({ config, logger, injectRoute }) => {
				for (let option of options) {
					const defaults = {
						config,
						logger,
					};

					if (typeof option === "string") {
						option = {
							dir: option,
						};
					}

					if (!option || !option?.dir || typeof option?.dir !== "string") {
						logger.warn(
							`Skipping invalid option "${JSON.stringify(option, null, 4)}"`,
						);
						continue;
					}

					Object.assign(defaults, option);

					const { injectPages } = addPageDir(defaults as IntegrationOption);

					injectPages(injectRoute);
				}
			},
		},
	};
}
