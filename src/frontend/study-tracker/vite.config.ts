import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "node:path";

export default defineConfig({
    base: "/tracker/",
    server: {
        port: 5273
    },
    plugins: [
        remix({
            basename: "/tracker/",
            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true
            }
        }),
        tsconfigPaths()
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler" // or "modern"
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './app')
        }
    }
});
