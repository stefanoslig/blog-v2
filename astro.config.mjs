import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import AutoImport from "astro-auto-import";
import { defineConfig, squooshImageService } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import config from "./src/config/config.json";
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "http://examplesite.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  image: {
    service: squooshImageService()
  },
  integrations: [sitemap(), react(), partytown({
    config: {
      forward: ["dataLayer.push"]
    }
  }), tailwind({
    config: {
      applyBaseStyles: false
    }
  }), AutoImport({
    imports: ["@/shortcodes/Button", "@/shortcodes/Accordion", "@/shortcodes/Notice", "@/shortcodes/Video", "@/shortcodes/Youtube", "@/shortcodes/Tabs", "@/shortcodes/Tab"]
  })],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, {
      test: "Table of contents"
    }]],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true
    },
    extendDefaultPlugins: true
  }
});