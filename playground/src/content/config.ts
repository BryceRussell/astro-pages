import { defineCollection, z } from "astro:content";

const blog = defineCollection({
	schema: z.record(z.string()),
});

export const collections = {
	blog,
};
