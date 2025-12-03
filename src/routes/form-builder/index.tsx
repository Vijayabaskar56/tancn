import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/error-boundary";
import { FormEdit } from "@/components/form-components/form-edit";
import { FieldTab } from "@/components/form-components/form-field-library";
import { SingleStepFormPreview } from "@/components/form-components/form-preview";
import { SettingsSidebar } from "@/components/form-components/form-settings";
import { TemplateSidebar } from "@/components/form-components/form-templates";
import Loader from "@/components/loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import useSettings from "@/hooks/use-settings";

export const Route = createFileRoute("/form-builder/")({
	head: () => ({
		meta: [],
	}),
	component: FormBuilderComponent,
	errorComponent: ErrorBoundary,
	pendingComponent: Loader,
});

function FormBuilderComponent() {
	const isMobile = useIsMobile();
	const settings = useSettings();
	const activeTab = settings?.activeTab;
	const isCodeSidebarOpen = settings?.isCodeSidebarOpen ?? false;

	const renderSidebarContent = () => {
		switch (activeTab) {
			case "builder":
				return <FieldTab />;
			case "template":
				return <TemplateSidebar />;
			case "settings":
				return <SettingsSidebar />;
			default:
				return <FieldTab />;
		}
	};

	return (
		<main className="h-[calc(100vh-8rem)] w-full">
			{isMobile ? (
				<div className="h-full flex flex-col relative">
					<ScrollArea className="h-full">
						<div className="flex flex-col">
							<div className="bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 p-4">
								{renderSidebarContent()}
							</div>

							<div className="p-4 border-t">
								<div className="mb-4 pb-2 border-b">
									<h3 className="text-lg font-semibold text-primary">Editor</h3>
									<p className="text-sm text-muted-foreground">
										Design your form elements
									</p>
								</div>
								<FormEdit />
							</div>

							<div className="p-4 border-t">
								<div className="mb-4 pb-2 border-b">
									<h3 className="text-lg font-semibold text-primary">
										Preview
									</h3>
									<p className="text-sm text-muted-foreground">
										See how your form looks
									</p>
								</div>
								<SingleStepFormPreview />
							</div>
						</div>
					</ScrollArea>
				</div>
			) : (
				<div className="h-full">
					{/* Tablet Layout - Sidebar at top, FormEdit and FormPreview side by side */}
					<div className="hidden md:flex lg:hidden h-full flex-col">
						{/* Tablet Sidebar - At top */}
						<div className="bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
							<ScrollArea className="p-4 h-100">
								{renderSidebarContent()}
							</ScrollArea>
						</div>

						{/* Tablet Form Edit and Preview - Side by side below */}
						<div className="flex flex-1">
							{/* Tablet Form Edit - Grows and shrinks */}
							<div className="flex-1  border-r">
								<ScrollArea className="h-full">
									<div className="p-4">
										<div className="mb-4 pb-2 border-b">
											<h3 className="text-lg font-semibold text-primary">
												Editor
											</h3>
											<p className="text-sm text-muted-foreground">
												Design your form elements
											</p>
										</div>
										<FormEdit />
									</div>
								</ScrollArea>
							</div>

							{/* Tablet Preview - Grows and shrinks */}
							<div className="flex-1 ">
								<ScrollArea className="h-full">
									<div className="p-4">
										<div className="mb-4 pb-2 border-b">
											<h3 className="text-lg font-semibold text-primary">
												Preview
											</h3>
											<p className="text-sm text-muted-foreground">
												See how your form looks
											</p>
										</div>
										<SingleStepFormPreview />
									</div>
								</ScrollArea>
							</div>
						</div>
					</div>

					{/* Desktop Layout - Horizontal Grid */}
					<div
						className="hidden lg:grid lg:h-full"
						style={{
							gridTemplateColumns: isCodeSidebarOpen
								? "1.4fr 3fr 3fr 3fr"
								: "3fr 6fr 6fr",
						}}
					>
						{/* Desktop Left Sidebar */}
						<div className="border-r bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 overflow-hidden h-full">
							<div className="p-4">{renderSidebarContent()}</div>
						</div>

						{/* Desktop Form Edit Section */}
						<div className="relative border-b lg:border-b-0 lg:border-r h-full">
							<div className="p-4">
								<div className="mb-4 pb-2 border-b">
									<h3 className="text-lg font-semibold text-primary">Editor</h3>
									<p className="text-sm text-muted-foreground">
										Design your form elements
									</p>
								</div>
								<ScrollArea className="h-full  md:h-180">
									<FormEdit />
								</ScrollArea>
							</div>
						</div>
						{/* Desktop Preview Section */}
						<div className="relative h-full">
							<div className="p-4">
								<div className="mb-4 pb-2 border-b">
									<h3 className="text-lg font-semibold text-primary">
										Preview
									</h3>
									<p className="text-sm text-muted-foreground">
										See how your form looks
									</p>
								</div>
								<ScrollArea className="h-full  md:h-180">
									<SingleStepFormPreview />
								</ScrollArea>
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
