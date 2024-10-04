import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    server: {
        port: 5273
    },
    plugins: [
        remix({
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
    }
});
