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
                },
            }),
        },
        preview: {
            port: 1200,
        },
        build: {
            chunkSizeWarningLimit: 500,
            rollupOptions: {
                output: {
                    // Manual Chunks to separate vendor code
                    manualChunks(id) {
                        if (id.includes("node_modules")) {
                            if (/node_modules\/(@tailwindcss\/|tailwindcss(?:-|$|\/)|tailwind-merge)/.test(id)) {
                                return "vendor-tailwindcss";
                            }
                            // Split out utility libraries
                            if (id.includes("qr-code-styling")) {
                                return "vendor-utils";
                            }
                            // Split out Animation libraries (Heavy)
                            if (id.includes("motion")) {
                                return "vendor-motion";
                            }
                            // Split out Data fetching
                            if (id.includes("@tanstack")) {
                                return "vendor-query";
                            }
                            // Split out non Core react libraries
                            if (id.includes("react-dropzone") || id.includes("react-easy-crop") || id.includes("input-otp")) {
                                return "vendor-react-non-core";
                            }
                            // Split out React and Router (Core)
                            if (id.includes("react") || id.includes("react-router") || id.includes("react-dom")) {
                                return "vendor-react";
                            }
                            // Everything else in node_modules goes to a general vendor chunk
                            return "vendor-general";
                        }
                    },
                },
            },
        },
    };
});
