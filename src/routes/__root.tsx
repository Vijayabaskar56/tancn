import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/error-boundary";
import NavBar from "@/components/nav-bar";
import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import DevTools from "@/integrations/tanstack-query/devtools";
import { seo } from "@/utils/seo";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({ title: "TANCN - Form and Table Builder" }),
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
	shellComponent: RootDocument,
	errorComponent: ErrorBoundary,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className="font-sans">
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning={true}>
				<ThemeProvider
					defaultTheme="system"
					attribute="class"
					enableSystem={true}
					storageKey="theme"
				>
					<div className="h-screen overflow-hidden flex flex-col">
						<NavBar />
						<main className="h-screen pt-12 overflow-auto">
							<div className="[view-transition-name:main-content] min-h-full" >
								{/* {isFetching ? <Loader /> : <Outlet />} */}
								{children}
							</div>
						</main>
					</div>
					{import.meta.env.DEV && <DevTools />}
					<Toaster richColors />
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
