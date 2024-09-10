import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import Icons from "unplugin-icons/vite";

import vercel from "@astrojs/vercel/serverless";
import clerk from "@clerk/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [
    clerk(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  experimental: {
    env: {
      schema: {
        DB_URL: envField.string({
          context: "server",
          access: "secret",
        }),
      },
    },
  },
  output: "server",
  vite: {
    plugins: [
      Icons({
        compiler: "jsx",
        jsx: "react",
      }),
      Icons({
        compiler: "astro",
      }),
    ],
    resolve: {
      alias: [
        {
          find: "icons:react",
          replacement: "~icons",
        },
        {
          find: "icons:astro",
          replacement: "~icons",
        },
      ],
    },
  },
  adapter: vercel(),
});
