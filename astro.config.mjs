// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import { remarkModifiedTime } from "./remark-modified-time.mjs";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import config from "./src/config/config.json";

export default defineConfig({
  site: config.site.base_url || "http://examplesite.com",
  base: config.site.base_path || "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",

  vite: {
    plugins: [tailwindcss()],
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--astro-font-sans",
      weights: ["400", "500", "600", "700"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--astro-font-mono",
      weights: ["400", "500"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--astro-font-serif",
      weights: ["400"],
      styles: ["italic"],
      subsets: ["latin"],
    },
  ],

  integrations: [
    sitemap(),
    partytown({ config: { forward: ["dataLayer.push"] } }),
    mdx(),
    icon(),
  ],

  markdown: {
    remarkPlugins: [
      remarkModifiedTime,
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: "prepend",
        properties: { className: ["anchor"], "aria-hidden": "true", tabIndex: -1 },
        content: { type: "text", value: "#" },
      }],
    ],
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
  },
});
