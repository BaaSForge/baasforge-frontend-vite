import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {
    defineConfig,
    // loadEnv,
    type Plugin,
} from "vite";

const appShellRoutes = [
    /^\/(?:login|dashboard)(?:\/|$)/,
    /^\/projects\/documentation\/[^/]+\/share\/[^/]+\/?$/,
    /^\/(?:500|terms-of-service)\/?$/,
];

function appShellRouting(): Plugin {
    const rewriteAppRoute = (request: { url?: string }) => {
        if (request.url == null) return;

        const url = new URL(request.url, "http://localhost");
        if (appShellRoutes.some((route) => route.test(url.pathname))) {
            request.url = `/app.html${url.search}`;
        }
    };

    return {
        name: "baasforge-app-shell-routing",
        configureServer(server) {
            server.middlewares.use((request, _response, next) => {
                rewriteAppRoute(request);
                next();
            });
        },
        configurePreviewServer(server) {
            server.middlewares.use((request, _response, next) => {
                rewriteAppRoute(request);
                next();
            });
        },
    };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            appShellRouting(),
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
            manifest: true,
            chunkSizeWarningLimit: 500,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, "./index.html"),
                    app: path.resolve(__dirname, "./app.html"),
                },
            },
        },
    };
});
