import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export default function CTASection() {
	return (
		<div className="w-full relative overflow-hidden flex flex-col justify-center items-center gap-2">
			{/* Content */}
			<div className="self-stretch px-6 md:px-24 py-12 md:py-12 border-t border-b border-border flex justify-center items-center gap-6 relative z-10">
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

				<div className="w-full max-w-[586px] px-6 py-5 md:py-8 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-6 relative z-20">
					<div className="self-stretch flex flex-col justify-start items-start gap-3">
						<div className="self-stretch text-center flex justify-center flex-col text-foreground text-3xl md:text-5xl font-semibold leading-tight md:leading-[56px] font-sans tracking-tight">
							Build forms and tables in minutes, not hours.
						</div>
						<div className="self-stretch text-center text-muted-foreground text-base leading-7 font-sans font-medium">
							Drag, drop, and generate type-safe code instantly with TanStack
							power.
						</div>
					</div>
					<div className="w-full max-w-[497px] flex flex-col justify-center items-center gap-12">
						<div className="flex justify-start items-center gap-4">
							<Button
								variant="default"
								size="lg"
								className="w-52 rounded-4xl"
								asChild
							>
								<Link to="/form-builder">Start Building</Link>
							</Button>
						</div>
						<div className="text-muted-foreground text-sm font-normal leading-6 font-sans text-center">
							No login required. Free to use. Open source.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
