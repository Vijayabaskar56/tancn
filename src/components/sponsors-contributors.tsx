import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubButton } from "@/components/ui/github-button";
import { ArrowRightIcon } from "lucide-react";

interface Contributor {
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
}

export function SponsorsContributors() {
	const [contributors, setContributors] = useState<Contributor[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchContributors = async () => {
			try {
				const response = await fetch(
					"https://api.github.com/repos/Vijayabaskar56/tancn/contributors",
				);
				if (response.ok) {
					const data = await response.json();
					setContributors(data as Contributor[]);
				}
			} catch (error) {
				console.error("Failed to fetch contributors", error);
			} finally {
				setLoading(false);
			}
		};

		fetchContributors();
	}, []);

	const displayedContributors = contributors.slice(0, 15);
	const remainingContributors = contributors.length - 15;

	return (
		<div className="mt-16 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Sponsors Card */}
				<Card className="bg-none border-border h-full flex flex-col overflow-hidden relative">
					<div className="absolute inset-0 w-full h-full overflow-hidden">
						<div className="w-full h-full relative">
							{Array.from({ length: 300 }).map((_, i) => (
								<div
									key={i}
									className="absolute h-4 w-full -rotate-45 origin-top-left  outline-[0.5px] outline-border outline-offset-[-0.25px]"
									style={{
										top: `${i * 16 - 120}px`,
										left: "-100%",
										width: "300%",
									}}
								/>
							))}
						</div>
					</div>
					<CardHeader className="pb-2 relative z-10">
						<CardTitle className="text-xl font-semibold flex items-center gap-2">
							<span className="text-primary">❤️</span> Sponsors
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col justify-between pt-4 relative z-10">
						<div>
							<p className="text-muted-foreground mb-6">
								Thanks to our generous sponsors for supporting the project.
							</p>

							<div className="flex flex-wrap gap-4">
								{/* Existing Sponsor: Shadcnblocks */}
								<a
									href="https://www.shadcnblocks.com"
									target="_blank"
									className="group relative flex items-center justify-center p-4 rounded-xl border bg-background hover:border-primary/50 transition-colors"
								>
									<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
									<svg
										className="w-8 h-8 text-primary relative z-10"
										viewBox="0 0 78 90"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>Shadcnblocks Logo</title>
										<path
											d="M46.7305 4.50982L43.6252 2.72955V17.49L46.7305 19.2924V4.50982Z"
											fill="currentColor"
										/>
										<path
											d="M52.9854 8.14811L49.8765 6.34937V21.1287L52.9854 22.9127V8.14811Z"
											fill="currentColor"
										/>
										<path
											d="M59.1814 11.7684L56.0762 9.9881V24.7485L59.1814 26.5325V11.7684Z"
											fill="currentColor"
										/>
										<path
											d="M6.04712 26.0179L9.15238 27.8019V17.246L6.04712 19.0262V26.0179Z"
											fill="currentColor"
										/>
										<path
											d="M2.93874 24.2184V20.8651L0 22.5491L2.93874 24.2184Z"
											fill="currentColor"
										/>
										<path
											d="M77.889 22.5895L74.7985 20.8056V24.3883L71.6895 26.1685V19.0253L68.6027 17.245V27.9123L65.4937 29.6962V15.3874L62.3293 13.548V28.3305L65.1162 29.959V59.8636L64.9645 59.9561L62.3293 58.4424V61.4921L59.1833 63.2724V56.5474L56.078 54.7079V65.0743L52.9875 66.9101V52.8681L49.8785 51.0324V68.6945L46.7325 70.4748V49.1932L43.6273 47.3537V72.2547L40.5183 74.1127V45.5172L39.0008 44.5105L39.06 14.8159L40.5183 15.7079V0.947497L38.8898 0L37.5795 0.736529V15.5562L34.4372 17.3364V2.57602L31.3283 4.35629V19.1199L28.2193 20.9186V6.1953L25.1325 7.97557V22.6989L21.968 24.4829V9.77771L18.8775 11.6135V26.2807L15.7685 28.1202V13.393L12.3005 15.4397V29.578L12.7743 29.8444L12.889 59.9528L15.7685 61.6405V58.2872L18.8775 56.4477V63.4799L21.968 65.2786V54.6082L25.1325 52.7132V67.0591L28.2193 68.8986V50.8772L31.3283 49.0377V70.6786L34.4372 72.481V47.1797L37.5795 45.3439V74.3168L39.0008 75.1533V75.0941V89.969L77.9445 67.477L78 22.5853L77.889 22.5895Z"
											fill="currentColor"
										/>
									</svg>
									<span className="ml-3 font-semibold text-foreground">
										Shadcnblocks
									</span>
								</a>
							</div>
						</div>

						<div className="mt-8">
							<Button variant="outline" className="w-full sm:w-auto" asChild>
								<a
									href="https://github.com/sponsors/Vijayabaskar56"
									target="_blank"
								>
									Become a Sponsor
									<ArrowRightIcon className="ml-2 h-4 w-4" />
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Contributors Card */}
				<Card className="bg-none border-border h-full flex flex-col overflow-hidden relative">
					<div className="absolute inset-0 w-full h-full overflow-hidden">
						<div className="w-full h-full relative">
							{Array.from({ length: 300 }).map((_, i) => (
								<div
									key={i}
									className="absolute h-4 w-full -rotate-45 origin-top-left  outline-[0.5px] outline-border outline-offset-[-0.25px]"
									style={{
										top: `${i * 16 - 120}px`,
										left: "-100%",
										width: "300%",
									}}
								/>
							))}
						</div>
					</div>
					<CardHeader className="pb-2 relative z-10">
						<CardTitle className="text-xl font-semibold">
							Contributors
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col justify-between pt-4 relative z-10">
						<div>
							<p className="text-muted-foreground mb-6">
								A big thank you to all the contributors who have helped make this
                project better.
							</p>

							<div className="flex flex-wrap items-center gap-2">
								{loading ? (
									<div className="text-sm text-muted-foreground">
										Loading contributors...
									</div>
								) : (
									<div className="flex -space-x-3 overflow-hidden py-2">
										{displayedContributors.map((contributor) => (
											<a
												key={contributor.login}
												href={contributor.html_url}
												target="_blank"
												className="inline-block transition-transform hover:scale-110 hover:z-10 relative z-0"
											>
												<Avatar className="h-10 w-10 border-2 border-background ring-2 ring-background/50">
													<AvatarImage
														src={contributor.avatar_url}
														alt={contributor.login}
													/>
													<AvatarFallback>
														{contributor.login.slice(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>
											</a>
										))}
										{remainingContributors > 0 && (
											<div className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background/50 relative z-0">
												+{remainingContributors}
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						<div className="mt-8">
							<GithubButton
								repoUrl="https://github.com/Vijayabaskar56/tancn"
								label="Contribute on GitHub"
								showStarIcon={false}
								className="w-full sm:w-auto"
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
