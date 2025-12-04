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
import { Suspense } from "react";
import CTASection from "@/components/cta";
import { ErrorBoundary } from "@/components/error-boundary";
import FAQSection from "@/components/faq";
import FooterSection from "@/components/footer";
import Loader from "@/components/loader";
import { MiniFormBuilder } from "@/components/mini-form-builder";
import { NotFound } from "@/components/not-found";
import { SponsorsContributors } from "@/components/sponsors-contributors";
import { Button } from "@/components/ui/button";
import { seo } from "@/utils/seo";

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
	// Carousel logic removed

	return (
		<div className="w-full min-h-screen relative bg-background md:px-8 px-4 overflow-x-hidden">
			{/* Hero Section */}
			<section className="w-full border-border">
				<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
					<div className="pt-12 md:pt-16 lg:pt-20 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
						{/* Main Headline */}
						<div className="w-full flex flex-col items-start gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 md:mb-10 lg:mb-12 max-w-2xl">
							<h1 className="text-left text-foreground text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
								<span className="text-primary">TANCN</span> is the best &
								Fastest way to <span className="text-primary">build forms</span>{" "}
								and <span className="text-primary">tables</span>
							</h1>

							{/* Subtitle */}
							<p className="text-left text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
								Build powerful forms and tables with ease using TanStack
								technologies. Code generation with 100% Type-Safe.
							</p>
						</div>

						{/* CTA Button */}
						<div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4 sm:gap-6 mb-12">
							<Button variant="default" size="default" asChild>
								<Link to="/form-builder" preload="intent">
									Start Building
								</Link>
							</Button>
							<Button variant="outline" size="default" asChild>
								<Link to="/form-registry">Form Registry</Link>
							</Button>
						</div>

						{/* Product Visual */}
						<div className="w-full relative mb-8 sm:mb-12 md:mb-16 lg:mb-20">
							<div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] bg-transparent overflow-hidden">
								<MiniFormBuilder />
							</div>
						</div>

						{/* Feature Cards */}
						<div className="w-full border-t border-b border-border">
							<div className="flex flex-col md:flex-row justify-center items-stretch">
								<FeatureCard
									title="Drag & Drop Builder"
									description="Intuitive drag-and-drop interface for building forms quickly. Add, rearrange, and configure form fields with ease."
								/>
								<FeatureCard
									title="Save, Share & Export"
									description="Save your form configurations, share them with team members, and export generated code for immediate use in your projects."
								/>
								<FeatureCard
									title="Real-time Preview"
									description="See your form changes instantly with live preview. Test form behavior and styling as you build."
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="w-full py-16">
				<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
					<div className="text-center mb-12 md:mb-16">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
							Features
						</h2>
					</div>
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
			</section>

			{/* Sponsors & Contributors */}
			<section className="w-full py-16 ">
				<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
					<Suspense
						fallback={
							<div className="text-sm text-muted-foreground">
								Loading contributors...
							</div>
						}
					>
						<SponsorsContributors />
					</Suspense>
				</div>
			</section>

			{/* Development Roadmap */}
			<section className="w-full py-16 ">
				<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
					<div className="text-center mb-12 md:mb-16">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
							Development Roadmap
						</h2>
					</div>
					<div className="space-y-12">
						<div className="text-left">
							<div className="flex items-center gap-3 mb-6">
								<CheckCircle className="w-6 h-6 text-green-500" />
								<h3 className="text-xl sm:text-2xl font-semibold text-foreground">
									Completed Features
								</h3>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
								{roadmapItems
									.filter((item) => item.status === "completed")
									.map((item) => (
										<div
											key={item.title}
											className="p-4 md:p-5 rounded-lg border bg-card border-border"
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
							<div className="flex items-center gap-3 mb-6">
								<Clock className="w-6 h-6 text-yellow-500" />
								<h3 className="text-xl sm:text-2xl font-semibold text-foreground">
									In Progress
								</h3>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
								{roadmapItems
									.filter((item) => item.status === "in-progress")
									.map((item) => (
										<div
											key={item.title}
											className="p-4 md:p-5 rounded-lg border bg-card border-border"
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
							<div className="flex items-center gap-3 mb-6">
								<Circle className="w-6 h-6 text-blue-500" />
								<h3 className="text-xl sm:text-2xl font-semibold text-foreground">
									Planned Features
								</h3>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
								{roadmapItems
									.filter((item) => item.status === "planned")
									.map((item) => (
										<div
											key={item.title}
											className="p-4 md:p-5 rounded-lg border bg-card border-border"
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
			</section>

			{/* FAQ Section */}
			<section className="w-full py-16">
				<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
					<FAQSection />
				</div>
			</section>

			{/* CTA Section */}
			<section className="w-full py-16">
				<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
					<CTASection />
				</div>
			</section>

			{/* Footer */}
			<footer className="w-full">
				<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
					<FooterSection />
				</div>
			</footer>
		</div>
	);
}

function FeatureCard({
	title,
	description,
	onClick,
}: {
	title: string;
	description: string;
	onClick?: () => void;
}) {
	return (
		<div
			className={`w-full md:flex-1 px-6 py-5 md:py-6 flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 md:border-r last:border-r-0 last:border-b-0 transition-colors border-border hover:bg-muted/50`}
			onClick={onClick}
			onKeyUp={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onClick?.();
				}
			}}
			role="button"
			tabIndex={0}
		>
			<div className="text-foreground text-sm md:text-base font-semibold leading-6">
				{title}
			</div>
			<div className="text-muted-foreground text-xs md:text-sm font-normal leading-relaxed">
				{description}
			</div>
		</div>
	);
}
