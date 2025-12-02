import { useState } from "react";
import { Button } from "./ui/button";

interface FAQItem {
	question: string;
	answer: string;
}

const faqData: FAQItem[] = [
	{
		question: "How does the drag-and-drop builder work?",
		answer:
			"The drag-and-drop interface lets you easily add, rearrange, and configure form fields. Simply drag components from the library onto your canvas, customize their properties, and see changes in real-time preview.",
	},
	{
		question: "What kind of code does it generate?",
		answer:
			"It generates fully typed React components with TypeScript support, including automatic schema generation for form validation using libraries like Zod, Valibot, or ArkType. The code is ready to use in your projects.",
	},
	{
		question: "What validation libraries are supported?",
		answer:
			"We support Zod, Valibot, and ArkType for schema validation. You can choose your preferred validation library when generating form code, ensuring compatibility with your existing setup.",
	},
	{
		question: "What is the Table Builder?",
		answer:
			"The Table Builder is a drag-and-drop interface for creating dynamic, type-safe tables. It allows you to define columns, apply filters, sort data, and generate performant table components with TanStack Table.",
	},
	{
		question: "How does the Table Builder work?",
		answer:
			"Similar to the form builder, you can drag and drop column types, configure sorting and filtering options, and customize table appearance. The builder generates code for tables that integrate seamlessly with your data sources.",
	},
	{
		question: "What features does the Table Builder include?",
		answer:
			"It supports advanced filtering, sorting, pagination, column resizing, and data export. You can create tables with virtual scrolling for large datasets and customize them with ShadCN UI components.",
	},
];

function ChevronDownIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Chevron Down"
		>
			<title>Chevron Down</title>
			<path
				d="m6 9 6 6 6-6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default function FAQSection() {
	const [openItems, setOpenItems] = useState<number | null>(null);

	const toggleItem = (index: number) => {
		setOpenItems((prev) => (prev === index ? null : index));
	};

	return (
		<div className="w-full">
			<div className="flex flex-col lg:flex-row justify-start items-start gap-8 lg:gap-12">
				{/* Left Column - Header */}
				<div className="w-full lg:w-1/2 flex flex-col justify-center items-start gap-4 lg:sticky lg:top-24 lg:self-start">
					<h2 className="w-full text-foreground font-semibold leading-tight text-2xl sm:text-3xl md:text-4xl tracking-tight">
						Frequently Asked Questions
					</h2>
					<p className="w-full text-muted-foreground text-sm sm:text-base font-normal leading-relaxed">
						Build powerful forms with ease, generate type-safe code,
						<br className="hidden md:block" />
						and integrate seamlessly with your projects.
					</p>
				</div>

				{/* Right Column - FAQ Items */}
				<div className="w-full lg:w-1/2 flex flex-col">
					<div className="w-full flex flex-col">
						{faqData.map((item, index) => {
							const isOpen = openItems === index;

							return (
								<div
									key={index}
									className="w-full border-b border-border overflow-hidden"
								>
									<Button
										onClick={() => toggleItem(index)}
										className="w-full px-0 sm:px-2 py-4 sm:py-[18px] flex justify-between items-start sm:items-center gap-3 sm:gap-5 text-left hover:bg-muted/20 transition-colors duration-200"
										type="button"
										variant="ghost"
										aria-expanded={isOpen}
									>
										<span className="flex-1 min-w-0 text-foreground text-sm sm:text-base font-medium leading-relaxed pr-2">
											{item.question}
										</span>
										<div className="shrink-0 flex justify-center items-center">
											<ChevronDownIcon
												className={`w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground transition-transform duration-300 ease-in-out ${
													isOpen ? "rotate-180" : "rotate-0"
												}`}
											/>
										</div>
									</Button>

									<div
										className={`overflow-hidden transition-all duration-300 ease-in-out ${
											isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
										}`}
									>
										<div className="px-0 sm:px-2 pb-4 sm:pb-[18px] text-muted-foreground text-xs sm:text-sm font-normal leading-relaxed">
											{item.answer}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
