import { useSuspenseQuery } from "@tanstack/react-query";
import { getGitHubStarsOptions } from "@/api/query-options";
import { Link, useLocation } from "@tanstack/react-router";
import { Suspense } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import AppToggle from "./app-toggle";
import { GithubButton } from "./ui/github-button";
import { Skeleton } from "./ui/skeleton";

export default function NavBar() {
	const location = useLocation();
	const isLandingPage = location.pathname === "/";

	const { data: stars } = useSuspenseQuery(getGitHubStarsOptions());
	return (
		<header
			className="fixed left-0 right-0 z-40 bg-background  px-4 md:px-6 transition-top duration-200"
			id="navbar"
			style={{ top: "var(--banner-height, 0px)" }}
		>
			<div className="flex h-12 items-center justify-between gap-4">
				{/* Left side */}
				<div
					className={`flex ${isLandingPage ? "" : "flex-1"} items-center gap-2`}
				>
					<div className="mr-4 flex">
						<Link to="/">
							<div className="flex  text-2xl justify-center items-center">
								<svg
									viewBox="0 0 473 473"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="text-accent-foreground"
									style={{
										width: "1em",
										height: "1em",
										display: "inline-block",
									}}
								>
									<title>Logo</title>
									<g clipPath="url(#clip0_38_23)">
										<path
											d="M226.646 413.875H98.5417C88.0877 413.875 78.0619 409.722 70.6699 402.33C63.2778 394.938 59.125 384.912 59.125 374.458V98.5417C59.125 88.0877 63.2778 78.0619 70.6699 70.6699C78.0619 63.2778 88.0877 59.125 98.5417 59.125H374.458C384.912 59.125 394.938 63.2778 402.33 70.6699C409.722 78.0619 413.875 88.0877 413.875 98.5417V216.792"
											stroke="currentColor"
											strokeWidth="10"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M59.125 197.083H413.875"
											stroke="currentColor"
											strokeWidth="10"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M197.083 59.125V413.875"
											stroke="currentColor"
											strokeWidth="10"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<g clipPath="url(#clip1_38_23)">
											<path
												d="M397.438 318.5L321.5 394.438"
												stroke="currentColor"
												strokeWidth="20"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M382.25 234.969L237.969 379.25"
												stroke="currentColor"
												strokeWidth="20"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</g>
									</g>
									<defs>
										<clipPath id="clip0_38_23">
											<rect width="473" height="473" fill="white" />
										</clipPath>
										<clipPath id="clip1_38_23">
											<rect
												width="243"
												height="243"
												fill="white"
												transform="translate(200 197)"
											/>
										</clipPath>
									</defs>
								</svg>
								<h1 className="font-bold">TANCN</h1>
							</div>
						</Link>
					</div>
					{/* Navigation Links - Only show on landing page */}
					{isLandingPage && (
						<nav className="hidden sm:flex items-center lg:gap-6 text-accent md:gap-2 gap-0 md:ml-6 ml-0">
							<Link
								to="/"
								className="text-sm font-medium text-accent-foreground hover:text-foreground/80 transition-colors"
							>
								Home
							</Link>
							<Link
								to="/form-builder"
								className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
							>
								Form Builder
							</Link>
							<Link
								to="/table-builder"
								className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
							>
								Table Builder
							</Link>
							<Link
								to="/form-registry"
								className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
							>
								Form Registry
							</Link>
						</nav>
					)}
				</div>
				{/* Middle area */}
				<AppToggle />
				{/* Right side */}
				<div className="flex flex-1 items-center justify-end gap-2">
					<Suspense fallback={<Skeleton />}>
						<GithubButton
							initialStars={0}
							targetStars={stars ?? 100}
							separator={true}
							label=""
							roundStars={true}
							repoUrl="https://github.com/Vijayabaskar56/tancn"
							variant="outline"
						/>
					</Suspense>
					<div className="hidden md:flex items-center gap-2">
						<Button
							size="sm"
							variant="ghost"
							className="text-sm max-sm:aspect-square max-sm:p-0"
							asChild
						>
							<a
								href="https://www.linkedin.com/in/vijaya-baskar/"
								target="_blank"
								rel="noopener"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									aria-label="LinkedIn"
								>
									<title>LinkedIn</title>
									<path
										d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"
										fill="currentColor"
									/>
								</svg>
							</a>
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="text-sm max-sm:aspect-square max-sm:p-0"
							asChild
						>
							<a
								href="https://x.com/vijayabaskar56"
								target="_blank"
								rel="noopener"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									aria-label="Twitter"
								>
									<title>Twitter</title>
									<path
										d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
										fill="currentColor"
									/>
								</svg>
							</a>
						</Button>
					</div>
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
