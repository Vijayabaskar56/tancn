import { ErrorBoundary } from "@/components/error-boundary";
import { FormEdit } from "@/components/form-components/form-edit";
import { FieldTab } from "@/components/form-components/form-field-library";
import FormHeader from "@/components/form-components/form-header";
import { SingleStepFormPreview } from "@/components/form-components/form-preview";
import { SettingsSidebar } from "@/components/form-components/form-settings";
import { TemplateSidebar } from "@/components/form-components/form-templates";
import Loader from "@/components/loader";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { BlocksIcon } from "@/components/ui/blocks";
import { LayoutPanelTopIcon } from "@/components/ui/layout-panel-top";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettingsGearIcon } from "@/components/ui/settings-gear";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScreenSize } from "@/hooks/use-screen-size";
import useSettings from "@/hooks/use-settings";
import { setActiveTab } from "@/services/settings.service";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";

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
	const screenSize = useScreenSize();
	const isTablet = screenSize.lessThan("lg") && !isMobile;
	const settings = useSettings();
	const activeTab = settings?.activeTab ?? "builder";
	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const [sidebarWidth, setSidebarWidth] = useState(300); // Default width

	const handleSubTabChange = (newSubTab: string) => {
		setActiveTab(newSubTab as "builder" | "template" | "settings");
	};

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

	const TabNavigation = () => (
		<div className="flex gap-2 p-4 lg:h-14 justify-center items-center content-center text-center self-center w-full border-y border-border">
			<AnimatedIconButton
				icon={
					<BlocksIcon className="-ms-0.5 me-1.5 opacity-60" size={16} />
				}
				text={
					sidebarWidth > 350 || isMobile || isTablet ? "Builder" : ""
				}
				variant={activeTab === "builder" ? "default" : "ghost"}
				onClick={() => handleSubTabChange("builder")}
				size="sm"
			/>
			<AnimatedIconButton
				icon={
					<LayoutPanelTopIcon
						className="-ms-0.5 me-1.5 opacity-60"
						size={16}
					/>
				}
				text={
					sidebarWidth > 350 || isMobile || isTablet ? "Template" : ""
				}
				variant={activeTab === "template" ? "default" : "ghost"}
				onClick={() => handleSubTabChange("template")}
				size="sm"
			/>
			<AnimatedIconButton
				icon={
					<SettingsGearIcon
						className="-ms-0.5 me-1.5 opacity-60"
						size={16}
					/>
				}
				text={
					sidebarWidth > 350 || isMobile || isTablet ? "Settings" : ""
				}
				variant={activeTab === "settings" ? "default" : "ghost"}
				onClick={() => handleSubTabChange("settings")}
				size="sm"
			/>
		</div>
	);

	// Mobile Layout - Vertical Stack
	if (isMobile) {
		return (
			<main className="h-[calc(100vh-var(--main-padding-top,48px))] w-full flex flex-col">
				<FormHeader />
				<div className="flex flex-col">
					{/* Sidebar Section */}
					<div className="border-b border-border">
						<TabNavigation />
						<div className="h-[calc(35vh-8rem)]">{renderSidebarContent()}</div>
					</div>

					{/* Editor Section */}
					<div className="p-4 border-b border-border">
						<div className="mb-4 pb-2 border-b">
							<h3 className="text-lg font-semibold text-primary">Editor</h3>
							<p className="text-sm text-muted-foreground">
								Design your form elements
							</p>
						</div>
						<FormEdit />
					</div>

					{/* Preview Section */}
					<div className="p-4">
						<div className="mb-4 pb-2 border-b">
							<h3 className="text-lg font-semibold text-primary">Preview</h3>
							<p className="text-sm text-muted-foreground">
								See how your form looks
							</p>
						</div>
						<SingleStepFormPreview />
					</div>
				</div>
			</main>
		);
	}

	// Tablet Layout - Top: Fields, Bottom: Split Editor/Preview
	if (isTablet) {
		return (
			<main className="h-[calc(100vh-var(--main-padding-top,48px))] w-full flex flex-col">
				<FormHeader />
				<ResizablePanelGroup direction="vertical" className="h-full">
					{/* Top Panel: Sidebar/Fields */}
					<ResizablePanel defaultSize={40} minSize={30}>
						<div className="flex flex-col h-full">
							<TabNavigation />
							<div className="flex-1 min-h-0">{renderSidebarContent()}</div>
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Bottom Panel: Split Editor/Preview */}
					<ResizablePanel defaultSize={60} minSize={30}>
						<ResizablePanelGroup direction="horizontal" className="h-full">
							{/* Editor */}
							<ResizablePanel defaultSize={50} minSize={30}>
								<div className="flex flex-col h-full border-r">
									<div className="p-4 border-b">
										<h3 className="text-lg font-semibold text-primary">
											Editor
										</h3>
										<p className="text-sm text-muted-foreground">
											Design your form elements
										</p>
									</div>
									<ScrollArea className="flex-1">
										<div className="p-4">
											<FormEdit />
										</div>
									</ScrollArea>
								</div>
							</ResizablePanel>

							<ResizableHandle withHandle />

							{/* Preview */}
							<ResizablePanel defaultSize={50} minSize={30}>
								<div className="flex flex-col h-full">
									<div className="p-4 border-b">
										<h3 className="text-lg font-semibold text-primary">
											Preview
										</h3>
										<p className="text-sm text-muted-foreground">
											See how your form looks
										</p>
									</div>
									<ScrollArea className="flex-1">
										<div className="p-4">
											<SingleStepFormPreview />
										</div>
									</ScrollArea>
								</div>
							</ResizablePanel>
						</ResizablePanelGroup>
					</ResizablePanel>
				</ResizablePanelGroup>
			</main>
		);
	}

	// Desktop Layout - Full Height Sidebar
	return (
		<main className="h-[calc(100vh-var(--main-padding-top,48px))] w-full">
			<ResizablePanelGroup direction="horizontal" className="h-full">
				{/* Sidebar Panel - Full Height */}
				<ResizablePanel
					ref={sidebarRef}
					defaultSize={20}
					minSize={15}
					maxSize={35}
					className="bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 border-r"
					onResize={(size) => {
						// Convert percentage to pixels roughly
						const width = (window.innerWidth * size) / 100;
						setSidebarWidth(width);
					}}
				>
					<div className="flex flex-col h-full">
						<TabNavigation />
						<div className="flex-1 min-h-0">{renderSidebarContent()}</div>
					</div>
				</ResizablePanel>

				<ResizableHandle withHandle />

				{/* Content Panel - Header + Editor/Preview */}
				<ResizablePanel defaultSize={80}>
					<div className="flex flex-col h-full">
						<FormHeader />
						<ResizablePanelGroup direction="horizontal" className="flex-1">
							{/* Editor Panel */}
							<ResizablePanel defaultSize={50} minSize={25}>
								<div className="flex flex-col h-full border-r">
									<div className="p-4 border-b">
										<h3 className="text-lg font-semibold text-primary">
											Editor
										</h3>
										<p className="text-sm text-muted-foreground">
											Design your form elements
										</p>
									</div>
									<ScrollArea className="flex-1">
										<div className="p-4">
											<FormEdit />
										</div>
									</ScrollArea>
								</div>
							</ResizablePanel>

							<ResizableHandle withHandle />

							{/* Preview Panel */}
							<ResizablePanel defaultSize={50} minSize={25}>
								<div className="flex flex-col h-full">
									<div className="p-4 border-b">
										<h3 className="text-lg font-semibold text-primary">
											Preview
										</h3>
										<p className="text-sm text-muted-foreground">
											See how your form looks
										</p>
									</div>
									<ScrollArea className="flex-1">
										<div className="p-4">
											<SingleStepFormPreview />
										</div>
									</ScrollArea>
								</div>
							</ResizablePanel>
						</ResizablePanelGroup>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</main>
	);
}
