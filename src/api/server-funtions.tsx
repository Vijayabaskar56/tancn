import { createServerFn } from "@tanstack/react-start";

interface Contributor {
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
}

export const getGitHubContributors = createServerFn({ method: "GET" }).handler(
	async (ctx) => {
		try {
			const cacheKey = "github-contributors";
			const cacheHit = await ctx.context?.env.CACHE.get(cacheKey, "json");
			if (cacheHit && cacheHit !== null && cacheHit !== undefined) {
				return cacheHit as Contributor[];
			}

			const res = await fetch(
				"https://api.github.com/repos/Vijayabaskar56/tancn/contributors",
				{
					headers: {
						"User-Agent": "TanCN-App",
					},
				},
			);

			if (!res.ok) {
				throw new Error(
					`Failed to fetch GitHub contributors: ${res.status} ${res.statusText}`,
				);
			}

			const data = (await res.json()) as Contributor[];
			// Cache for 2 hours
			if (data) {
				ctx.context?.waitUntil(
					ctx.context.env.CACHE.put(cacheKey, JSON.stringify(data), {
						expirationTtl: 7200, // 2 hours
					}),
				);
			}

			return data;
		} catch (error) {
			console.error("Error fetching GitHub contributors:", error);
			throw new Error("Failed to fetch contributors");
		}
	},
);

export const getGitHubStars = createServerFn({ method: "GET" }).handler(
	async (ctx) => {
		try {
			const cacheKey = "github-stars";
			const cacheHit = await ctx.context?.env.CACHE.get(cacheKey, "json");
			if (cacheHit && cacheHit !== null && cacheHit !== undefined) {
				return cacheHit as number;
			}

			const res = await fetch(
				"https://api.github.com/repos/Vijayabaskar56/tancn",
				{
					headers: {
						"User-Agent": "TanCN-App",
					},
				},
			);

			if (!res.ok) {
				throw new Error(
					`Failed to fetch GitHub stars: ${res.status} ${res.statusText}`,
				);
			}

			const data = (await res.json()) as { stargazers_count: number };
			const stars = data.stargazers_count;

			// Cache for 2 hours
			ctx.context?.waitUntil(
				ctx.context.env.CACHE.put(cacheKey, JSON.stringify(stars), {
					expirationTtl: 7200, // 2 hours
				}),
			);

			return stars;
		} catch (error) {
			console.error("Error fetching GitHub stars:", error);
			throw new Error("Failed to fetch stars");
		}
	},
);
