import { createFileRoute } from '@tanstack/react-router'
import { generateRegistryRssFeed } from "@wandry/analytics-sdk";

export const Route = createFileRoute('/rss/xml')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                try {
                    const baseUrl = new URL(request.url).origin;
                    const rssXml = await generateRegistryRssFeed({
                        baseUrl,
                        rss: {
                            title: "tancn",
                            description: "Subscribe to tancn updates",
                            link: "https://tancn.dev",
                            pubDateStrategy: "githubLastEdit",
                        },
                        github: {
                            owner: "vijayabaskar56",
                            repo: "tancn",
                            token: process.env.GITHUB_TOKEN ?? "",
                        },
                    });

                    if (!rssXml) {
                        return new Response("RSS feed not available", {
                            status: 404,
                            headers: { "Content-Type": "text/plain" },
                        });
                    }
                    return new Response(rssXml, { headers: { 'Content-Type': 'application/rss+xml' } });
                } catch (error) {
                    return new Response("Something went wrong", {
                        status: 500,
                        headers: { "Content-Type": "text/plain" },
                    });
                }
            }
        }
    }
})