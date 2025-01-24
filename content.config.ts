import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',  // all markdown files in the blog directory,
      schema: z.object({
        date: z.string(),
        tags: z.array(z.string()),
      }),
    }),
    projects: defineCollection({
      type: 'data',
      source: 'projects/**/*.json',  // all json files in the projects directory,
      schema: z.object({
        name: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
      })
    }),
  }
})