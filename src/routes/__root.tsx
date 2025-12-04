import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/error-boundary";
import NavBar from "@/components/nav-bar";
import { NotFound } from "@/components/not-found";
import SponsorBanner from "@/components/sponsor-banner";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
	scripts: () => [
		{
			children: `
			(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KP662D4F')
				(function() {
					const STORAGE_KEY = "sponsor-banner-closed-at";
					const BANNER_HIDE_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

					function shouldShowBanner() {
						const closedAt = localStorage.getItem(STORAGE_KEY);
						if (!closedAt) {
							// No record means banner should be shown
							return true;
						}

						const closedTime = new Date(closedAt).getTime();
						const currentTime = new Date().getTime();
						const timeSinceClosed = currentTime - closedTime;

						// Show banner if more than 2 days have passed
						return timeSinceClosed >= BANNER_HIDE_DURATION;
					}

					function updateBannerVisibility() {
						const banner = document.getElementById("sponsor-banner");
						if (!banner) return;

						if (shouldShowBanner()) {
							// Remove banner-hidden class to show the banner
							banner.classList.remove("banner-hidden");
						} else {
							// Add banner-hidden class to hide the banner
							banner.classList.add("banner-hidden");
						}
					}

					function updateLayout() {
						const banner = document.getElementById("sponsor-banner");

						if (banner && !banner.classList.contains("banner-hidden")) {
							const bannerHeight = banner.offsetHeight;
							document.documentElement.style.setProperty("--banner-height", bannerHeight + "px");
							document.documentElement.style.setProperty("--main-padding-top", (bannerHeight + 48) + "px"); // banner + navbar height
						} else {
							// Banner is hidden or doesn't exist
							document.documentElement.style.setProperty("--banner-height", "0px");
							document.documentElement.style.setProperty("--main-padding-top", "48px"); // navbar height only
						}
					}

					function init() {
						// First, update banner visibility based on localStorage
						updateBannerVisibility();
						// Then update layout
						updateLayout();
					}

					// Run after DOM is ready
					if (document.readyState === "loading") {
						document.addEventListener("DOMContentLoaded", init);
					} else {
						// DOM already loaded
						setTimeout(init, 0);
					}

					// Update on resize
					window.addEventListener("resize", updateLayout);

					// Watch for banner visibility changes
					const observer = new MutationObserver(function() {
						updateLayout();
					});

					// Watch for banner element to be added to DOM
					const bodyObserver = new MutationObserver(function(mutations) {
						mutations.forEach(function(mutation) {
							if (mutation.type === "childList") {
								const banner = document.getElementById("sponsor-banner");
								if (banner) {
									updateBannerVisibility();
									updateLayout();
									observer.observe(banner, {
										attributes: true,
										attributeFilter: ["class"],
										childList: false,
										subtree: false
									});
								}
							}
						});
					});

					if (document.body) {
						bodyObserver.observe(document.body, {
							childList: true,
							subtree: true
						});
					}

					// Also watch for localStorage changes (in case banner is closed in another tab)
					window.addEventListener("storage", function(e) {
						if (e.key === STORAGE_KEY) {
							updateBannerVisibility();
							updateLayout();
						}
					});
				})();
			`,
		},
	],
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className="font-sans">
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning={true}>
<noscript>
	<iframe
		src="https://www.googletagmanager.com/ns.html?id=GTM-KP662D4F"
		height="0"
		width="0"
		style={{ display: "none", visibility: "hidden" }}
		title="Google Tag Manager"
	></iframe>
</noscript>
				<ThemeProvider
					defaultTheme="system"
					attribute="class"
					enableSystem={true}
					storageKey="theme"
				>
					<SponsorBanner />
					<NavBar />
					<main
						id="main-content"
						style={{ paddingTop: "var(--main-padding-top, 48px)" }}
					>
						<div className="[view-transition-name:main-content] min-h-full">
							{/* {isFetching ? <Loader /> : <Outlet />} */}
							{children}
						</div>
					</main>
					{/* {import.meta.env.DEV && <DevTools />} */}
					<Toaster richColors />
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
