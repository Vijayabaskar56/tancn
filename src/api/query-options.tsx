import { queryOptions } from "@tanstack/react-query";
import { getGitHubContributors, getGitHubStars } from "./server-funtions";

export const getGitHubContributorsOptions = () =>
	queryOptions({
		queryKey: ["github-contributors"],
		queryFn: ({ signal }) => getGitHubContributors({ signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		enabled: import.meta.env.MODE === "production",
	});

export const getGitHubStarsOptions = () =>
	queryOptions({
		queryKey: ["github-stars"],
		queryFn: ({ signal }) => getGitHubStars({ signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		enabled: import.meta.env.MODE === "production",
	});
