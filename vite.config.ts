import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {
    defineConfig,
    // loadEnv,
} from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            react({
                babel: {
                    plugins: [["babel-plugin-react-compiler"]],
                },
            }),
            tailwindcss(),
        ],
        resolve: {
            alias: {
                "@public": path.resolve(__dirname, "./public"),
                "@": path.resolve(__dirname, "./src"),
                "react-diff-viewer-compute-lines": path.resolve(
                    __dirname,
                    "./node_modules/react-diff-viewer-continued/lib/cjs/src/compute-lines.js",
                ),
                "react-diff-viewer-compute-hidden-blocks": path.resolve(
                    __dirname,
                    "./node_modules/react-diff-viewer-continued/lib/cjs/src/compute-hidden-blocks.js",
                ),
            },
        },
        server: {
            port: 1200,
            ...(mode === "development" && {
                proxy: {
                    "/api": {
                        target: "http://localhost:1100",
                        changeOrigin: true,
                        secure: false,
                        ws: true,
                    },
                    "/docs": {
                        target: "http://localhost:1220",
                        changeOrigin: true,
                        ws: true,
                    },
                },
            }),
        },
        preview: {
            port: 1200,
        },
        ssr: {
            noExternal: ["react-router", "react-router/dom"],
        },
        build: {
            chunkSizeWarningLimit: 500,
        },
    };
});
