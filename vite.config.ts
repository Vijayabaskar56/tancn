import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart({
			sitemap: {
				enabled: true,
				host: 'https://tancn.dev/',
			},
			pages: [
				{
					path: '/',
					sitemap: {
						priority: 1.0,
					}
				},
				{
					path: '/form-builder',
					sitemap: {
						priority: 0.9,
					}
				},
				{
					path: '/table-builder',
					sitemap: {
						priority: 0.9,
					}
				},
				{
					path: '/form-registry',
					sitemap: {
						priority: 0.8,
					}
				},
			]
		}),
		viteReact({
		}),
		devtools({
			enhancedLogs: {
				enabled: true,
			},
			editor: {
				name: "VSCode",
				open: async (path, lineNumber, columnNumber) => {
					const { exec } = await import("node:child_process");
					exec(
						// or windsurf/cursor/webstorm
						`code -g "${(path).replaceAll("$", "\\$")}${lineNumber ? `:${lineNumber}` : ""}${columnNumber ? `:${columnNumber}` : ""}"`,
					);
				},
			},
		}),
	],
});

export default config;
