import CTASection from "@/components/cta";
import { ErrorBoundary } from "@/components/error-boundary";
import FAQSection from "@/components/faq";
import FooterSection from "@/components/footer";
import { NotFound } from "@/components/not-found";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	CheckCircle,
	Circle,
	Clock,
	Code,
	Eye,
	Layers,
	Move,
	Palette,
	Share2,
} from "lucide-react";
import { useEffect, useState } from "react";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { seo } from "@/utils/seo";
import { SponsorsContributors } from "@/components/sponsors-contributors";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: seo({}),
	}),
	component: HomePage,
	errorComponent: ErrorBoundary,
	notFoundComponent: NotFound,
	pendingComponent: Loader,
});

// features array removed as it is unused
const features = [
	{
		title: "Drag & Drop Builder",
		icon: Move,
		description: (
			<>
				Intuitive{" "}
				<span className="font-bold text-primary">drag-and-drop interface</span>{" "}
				for building forms quickly. Add, rearrange, and configure{" "}
				<span className="font-bold text-primary">form fields</span> with ease.
			</>
		),
	},
	{
		title: "Type-Safe Code Generation",
		icon: Code,
		description: (
			<>
				Generate{" "}
				<span className="font-bold text-primary">
					fully typed React components
				</span>{" "}
				with TypeScript support. Automatic{" "}
				<span className="font-bold text-primary">schema generation</span> for
				form validation.
			</>
		),
	},
	{
		title: "ShadCN UI Integration",
		icon: Palette,
		description: (
			<>
				Seamlessly integrated with{" "}
				<span className="font-bold text-primary">ShadCN UI components</span>.
				Generate{" "}
				<span className="font-bold text-primary">customizable, accessible</span>{" "}
				form components out of the box.
			</>
		),
	},
	{
		title: "Multi-Step & Field Arrays",
		icon: Layers,
		description: (
			<>
				Create{" "}
				<span className="font-bold text-primary">complex multi-step forms</span>{" "}
				and dynamic field arrays. Perfect for{" "}
				<span className="font-bold text-primary">
					advanced form requirements
				</span>{" "}
				and data structures.
			</>
		),
	},
	{
		title: "Save, Share & Export",
		icon: Share2,
		description: (
			<>
				Save your{" "}
				<span className="font-bold text-primary">form configurations</span>,
				share them with team members, and export{" "}
				<span className="font-bold text-primary">generated code</span> for
				immediate use in your projects.
			</>
		),
	},
	{
		title: "Real-time Preview",
		icon: Eye,
		description: (
			<>
				See your{" "}
				<span className="font-bold text-primary">form changes instantly</span>{" "}
				with live preview. Test{" "}
				<span className="font-bold text-primary">
					form behavior and styling
				</span>{" "}
				as you build.
			</>
		),
	},
];

const roadmapItems = [
	// Completed Features
	{
		title: "Core Form Builder",
		description: "Drag-and-drop form builder with real-time preview",
		status: "completed",
	},
	{
		title: "Type-Safe Code Generation",
		description: "Generate fully typed React components with TypeScript",
		status: "completed",
	},
	{
		title: "ShadCN UI Integration",
		description: "Seamless integration with ShadCN UI components",
		status: "completed",
	},
	{
		title: "Multi-Step Forms",
		description: "Support for complex multi-step form workflows",
		status: "completed",
	},
	{
		title: "Field Array Support",
		description: "Dynamic field arrays for complex data structures",
		status: "completed",
	},
	{
		title: "Schema Generation",
		description: "Automatic schema generation for form validation",
		status: "completed",
	},
	{
		title: "Table Builder",
		description:
			"Drag-and-drop table builder with customizable columns and data",
		status: "completed",
	},

	// In Progress Features
	{
		title: "Save & Share",
		description: "Save and share form configurations",
		status: "completed",
	},
	{
		title: "Templates",
		description: "Pre-built form templates for common use cases",
		status: "completed",
	},
	{
		title: "Advanced Validation",
		description: "Custom validation rules and error handling",
		status: "in-progress",
	},
	{
		title: "SolidJS Support",
		description: "Support for SolidJS",
		status: "in-progress",
	},
	{
		title: "Infinite Scroll Table",
		description: "Infinite scrolling for large datasets in tables",
		status: "in-progress",
	},

	// Planned Features
	{
		title: "Auto-Save",
		description: "Auto-save form configurations",
		status: "planned",
	},
	{
		title: "Server Funtion for Form Submission",
		description: "Server function for form submission",
		status: "planned",
	},
	{
		title: "Single Command Code Generation",
		description: "Single command code generation With ShadCN Registry",
		status: "planned",
	},
	{
		title: "React Native Support",
		description: "Generate React Native forms",
		status: "planned",
	},
	{
		title: "AI Feature",
		description: "AI-powered form and table generation",
		status: "planned",
	},
	{
		title: "MCP",
		description: "Model Context Protocol integration",
		status: "planned",
	},
];

function HomePage() {
	const [activeCard, setActiveCard] = useState(0);
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		const progressInterval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					setActiveCard((current) => (current + 1) % 3);
					return 0;
				}
				return prev + 2; // 2% every 100ms = 5 seconds total
			});
		}, 100);

		return () => {
			clearInterval(progressInterval);
		};
	}, []);

	const handleCardClick = (index: number) => {
		setActiveCard(index);
		setProgress(0);
	};

	return (
		<div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-start items-center">
			<div className="relative flex flex-col justify-start items-center w-full">
				<div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
					<div className="self-stretch pt-[9px] overflow-hidden border-b border-border flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
						<div className="pt-16  md:pt-20 lg:pt-24 pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
							<div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
								<div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
									<div className="w-full flex justify-center items-center max-w-[748.71px] lg:w-[748.71px] text-center  text-foreground text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[70px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-instrument-serif  px-2 sm:px-4 md:px-0">
										<div className="relative">
											<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5 rounded-full blur-3xl scale-150"></div>
											<div className="flex justify-center items-center">
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
												<h1 className="flex font-bold">TANCN</h1>
											</div>
										</div>
									</div>
									<div className="w-full max-w-[650px] text-center flex justify-center flex-col text-muted-foreground sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45]  lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
										<span>
											Build powerful{" "}
											<span className="text-primary inline font-extrabold capitalize">
												forms
											</span>{" "}
											and{" "}
											<span className="text-primary inline font-extrabold capitalize">
												tables
											</span>{" "}
											with ease using TanStack technologies
										</span>
										<br className="hidden sm:block" />
										Code generation with 100% Type-Safe.
									</div>
								</div>
							</div>

							<div className="w-full max-w-[497px] lg:w-[497px] flex justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
								<Button
									variant="default"
									size="lg"
									className="w-32 rounded"
									asChild
								>
									<Link to="/form-builder" preload='intent'>Start Building</Link>
								</Button>
								<Button
									variant="default"
									size="lg"
									className="w-32 rounded"
									asChild
								>
									<Link to="/form-registry">Form Registry</Link>
								</Button>
							</div>
							<div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
								<div className="w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[550px] bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-xl lg:rounded-[9.06px] flex flex-col justify-start items-start">
									<div className="self-stretch flex-1 flex justify-start items-start">
										<div className="w-full h-full flex items-center justify-center">
											<div className="relative w-full h-full overflow-hidden">
												<div
													className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
														activeCard === 0 ? "opacity-100" : "opacity-0"
													}`}
												>
													<picture>
														<source
															srcSet="/assets/slide-1-dark.avif"
															media="(prefers-color-scheme: dark)"
														/>
														<img
															src="/assets/slide-1-light.avif"
															alt="Form Builder Interface"
															className="w-full h-full object-cover"
														/>
													</picture>
												</div>

												<div
													className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
														activeCard === 1 ? "opacity-100" : "opacity-0"
													}`}
												>
													<picture>
														<source
															srcSet="/assets/slide-2-dark.avif"
															media="(prefers-color-scheme: dark)"
														/>
														<img
															src="/assets/slide-2-light.avif"
															alt="Analytics Dashboard"
															className="w-full h-full object-cover"
														/>
													</picture>
												</div>

												<div
													className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
														activeCard === 2 ? "opacity-100" : "opacity-0"
													}`}
												>
													<picture>
														<source
															srcSet="/assets/slide-3-dark.avif"
															media="(prefers-color-scheme: dark)"
														/>
														<img
															src="/assets/slide-3-light.avif"
															alt="Data Visualization Dashboard"
															className="w-full h-full object-cover"
														/>
													</picture>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="self-stretch border-t border-b border-border flex justify-center items-start">
								<div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
									<div className="w-[120px] sm:w-[140px] md:w-[162px] -left-10 sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
										{Array.from({ length: 50 }).map((_, i) => (
											<div
												key={i}
												className="self-stretch h-3 sm:h-4 -rotate-45 origin-top-left outline outline-border outline-offset-[-0.25px]"
											/>
										))}
									</div>
								</div>

								<div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0">
									<FeatureCard
										title="Drag & Drop Builder"
										description="Intuitive drag-and-drop interface for building forms quickly. Add, rearrange, and configure form fields with ease."
										isActive={activeCard === 0}
										progress={activeCard === 0 ? progress : 0}
										onClick={() => handleCardClick(0)}
									/>
									<FeatureCard
										title="Save, Share & Export"
										description="Save your form configurations, share them with team members, and export generated code for immediate use in your projects."
										isActive={activeCard === 2}
										progress={activeCard === 2 ? progress : 0}
										onClick={() => handleCardClick(2)}
									/>
									<FeatureCard
										title="Real-time Preview"
										description="See your form changes instantly with live preview. Test form behavior and styling as you build."
										isActive={activeCard === 1}
										progress={activeCard === 1 ? progress : 0}
										onClick={() => handleCardClick(1)}
									/>
								</div>

								<div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
									<div className="w-[120px] sm:w-[140px] md:w-[162px] -left-10 sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
										{Array.from({ length: 50 }).map((_, i) => (
											<div
												key={i}
												className="self-stretch h-3 sm:h-4 -rotate-45 origin-top-left outline outline-border outline-offset-[-0.25px]"
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="mt-16 text-center">
						<h2 className="text-2xl font-semibold mb-8">Features</h2>
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-10">
							{features.map((feature) => {
								const IconComponent = feature.icon;
								return (
									<div key={feature.title} className="relative group h-full">
										<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
											<div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
												<IconComponent className="w-6 h-6 text-primary" />
											</div>
										</div>

										<div className="h-full flex flex-col p-6 pt-8 rounded-xl border bg-card hover:shadow-md transition-all duration-300">
											<div className="flex-1 flex flex-col">
												<h3 className="font-semibold mb-4 text-lg text-center">
													{feature.title}
												</h3>
												<div className="flex-1 flex items-center">
													<p className="text-sm text-muted-foreground leading-relaxed text-center w-full">
														{feature.description}
													</p>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<SponsorsContributors />

					<div className="mt-16 text-center">
						<h2 className="text-2xl font-semibold mb-8">Development Roadmap</h2>
						<div className="grid gap-6 max-w-6xl mx-4 sm:mx-6 md:mx-8 lg:mx-10">
							<div className="text-left">
								<div className="flex items-center gap-3 mb-4">
									<CheckCircle className="w-6 h-6 text-green-500" />
									<h3 className="text-xl font-semibold text-foreground">
										Completed Features
									</h3>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{roadmapItems
										.filter((item) => item.status === "completed")
										.map((item) => (
											<div
												key={item.title}
												className="p-4 rounded-lg border bg-card border-border"
											>
												<div className="flex items-start gap-3">
													<CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
													<div className="flex-1">
														<h4 className="font-medium text-foreground mb-1">
															{item.title}
														</h4>
														<p className="text-sm text-muted-foreground">
															{item.description}
														</p>
													</div>
												</div>
											</div>
										))}
								</div>
							</div>

							<div className="text-left">
								<div className="flex items-center gap-3 mb-4">
									<Clock className="w-6 h-6 text-yellow-500" />
									<h3 className="text-xl font-semibold text-foreground">
										In Progress
									</h3>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{roadmapItems
										.filter((item) => item.status === "in-progress")
										.map((item) => (
											<div
												key={item.title}
												className="p-4 rounded-lg border bg-card border-border"
											>
												<div className="flex items-start gap-3">
													<Clock className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
													<div className="flex-1">
														<h4 className="font-medium text-foreground mb-1">
															{item.title}
														</h4>
														<p className="text-sm text-muted-foreground">
															{item.description}
														</p>
													</div>
												</div>
											</div>
										))}
								</div>
							</div>

							<div className="text-left">
								<div className="flex items-center gap-3 mb-4">
									<Circle className="w-6 h-6 text-blue-500" />
									<h3 className="text-xl font-semibold text-foreground">
										Planned Features
									</h3>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{roadmapItems
										.filter((item) => item.status === "planned")
										.map((item) => (
											<div
												key={item.title}
												className="p-4 rounded-lg border bg-card border-border"
											>
												<div className="flex items-start gap-3">
													<Circle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
													<div className="flex-1">
														<h4 className="font-medium text-foreground mb-1">
															{item.title}
														</h4>
														<p className="text-sm text-muted-foreground">
															{item.description}
														</p>
													</div>
												</div>
											</div>
										))}
								</div>
							</div>
						</div>
					</div>

					<FAQSection />

					<CTASection />

					<FooterSection />
				</div>
			</div>
		</div>
	);
}

function FeatureCard({
	title,
	description,
	isActive,
	progress,
	onClick,
}: {
	title: string;
	description: string;
	isActive: boolean;
	progress: number;
	onClick: () => void;
}) {
	return (
		<div
			className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 ${
				isActive
					? "bg-card shadow-[0px_0px_0px_0.75px_var(--color-border)_inset]"
					: "border-l-0 border-r-0 md:border border-border"
			}`}
			onClick={onClick}
			onKeyUp={onClick}
		>
			{isActive && (
				<div className="absolute top-0 left-0 w-full h-0.5 bg-(--color-border)">
					<div
						className="h-full bg-foreground transition-all duration-100 ease-linear"
						style={{ width: `${progress}%` }}
					/>
				</div>
			)}

			<div className="self-stretch flex justify-center flex-col text-foreground text-sm md:text-sm font-semibold leading-6 md:leading-6 font-sans">
				{title}
			</div>
			<div className="self-stretch text-muted-foreground text-[13px] md:text-[13px] font-normal leading-[22px] md:leading-[22px] font-sans">
				{description}
			</div>
		</div>
	);
}
