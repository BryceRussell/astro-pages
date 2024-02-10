import type { HookParameters } from "astro";

export type Prettify<T> = { [K in keyof T]: T[K]; } & {};

export interface Option {
  log?: "verbose" | "minimal" | boolean | null | undefined;
  cwd?: string;
  dir: string;
  glob?: string | string[];
  pattern?: (context: {
    dir: string | undefined;
    entrypoint: string;
    ext: string;
    pattern: string | undefined;
  }) => string;
}

export interface IntegrationOption extends Option {
  config: HookParameters<"astro:config:setup">["config"];
  logger: HookParameters<"astro:config:setup">["logger"];
  injectRoute: HookParameters<"astro:config:setup">["injectRoute"];
}