import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import Icons from "unplugin-icons/vite";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [
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
        GOOGLE_CLIENT_ID: envField.string({
          context: "server",
          access: "secret",
        }),
        GOOGLE_CLIENT_SECRET: envField.string({
          context: "server",
          access: "secret",
        }),
        PUBLIC_URL: envField.string({
          context: "client",
          access: "public",
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
  security: {
    checkOrigin: true
  },
  adapter: vercel(),
});
