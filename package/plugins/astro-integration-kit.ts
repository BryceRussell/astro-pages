import type { Option } from "../types";
import { definePlugin } from "astro-integration-kit";
import addPageDir from "../utils/add-page-dir";

export default definePlugin({
  name: "addPageDir",
  hook: "astro:config:setup",
  implementation:
    ({ config, logger, injectRoute }) => {
      return (option: string | Option) => {
        if (typeof option === "string") {
          option = {
            dir: option
          }
        }
        return addPageDir({
          ...option,
          config,
          logger,
          injectRoute
        })
      }
    }
});