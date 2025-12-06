/** biome-ignore-all lint/a11y/noLabelWithoutControl: no needed */

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { ErrorBoundary } from "@/components/error-boundary";
import Loader from "@/components/loader";
import { NotFound } from "@/components/not-found";
import { TableColumnEdit } from "@/components/table-components/table-column-edit";
import TableHeader from "@/components/table-components/table-header";
import { TableSettingsSidebar } from "@/components/table-components/table-settings";
import { TableTemplates } from "@/components/table-components/table-templates";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { BlocksIcon } from "@/components/ui/blocks";
import { Button } from "@/components/ui/button";
import { LayoutPanelTopIcon } from "@/components/ui/layout-panel-top";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "@/components/ui/revola";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SettingsGearIcon } from "@/components/ui/settings-gear";
import { Spinner } from "@/components/ui/spinner";
import {
	type TableBuilder,
	tableBuilderCollection,
} from "@/db-collections/table-builder.collections";
import { useScreenSize } from "@/hooks/use-screen-size";

import { seo } from "@/utils/seo";

const initializeTableStore = createClientOnlyFn(async () => {
	// initializeTable is already called via createIsomorphicFn
});

export const Route = createFileRoute("/table-builder")({
	head: () => ({
		meta: [...seo({ title: "Table Builder | TanCN - Form and Table Builder" })],
	}),
	component: RouteComponent,
	errorComponent: ErrorBoundary,
	notFoundComponent: NotFound,
	pendingComponent: Loader,
	// validateSearch: (search) => ({
	// 	share: search.share as string | undefined,
	// }),
});

function RouteComponent() {
	// Sidebar width used only on md+ screens
	const [sidebarWidth, setSidebarWidth] = useState(400); // Increased default width
	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const screenSize = useScreenSize();
	const isMdUp = screenSize.greaterThanOrEqual("md");
	// const { share } = useSearch({ from: "/table-builder" });

	const [isTableBuilderInitialized, setIsTableBuilderInitialized] =
		useState(false);
	const [activeTab, setActiveTab] = useState("columns");
	const [shareDialogOpen, setShareDialogOpen] = useState(false);
	const [sharedData, setSharedData] = useState<TableBuilder | null>(null);
	useEffect(() => {
		initializeTableStore();
		setIsTableBuilderInitialized(true);
	}, []);

	const handleReplace = () => {
		if (sharedData) {
			tableBuilderCollection.update(1, (draft) => {
				draft.tableName = sharedData.tableName;
				draft.settings = sharedData.settings;
				draft.table.columns = sharedData.table.columns;
				draft.table.data = []; // Shared data doesn't include data
			});
		}
		setShareDialogOpen(false);
		setSharedData(null);
		// Clean up URL
		window.history.replaceState({}, "", "/table-builder");
	};
	// Handle share parameter
	// useEffect(() => {
	// 	if (share && isTableBuilderInitialized) {
	// 		try {
	// 			const parsed = JSON.parse(decodeURIComponent(share)) as TableBuilder;
	// 			setSharedData(parsed);
	// 			// Show dialog if there's existing data
	// 			if (
	// 				tableBuilder.table.columns.length > 0 ||
	// 				tableBuilder.table.data.length > 0
	// 			) {
	// 				setShareDialogOpen(true);
	// 			} else {
	// 				// Load directly if no existing data
	// 				handleReplace();
	// 			}
	// 		} catch (error) {
	// 			console.error("Invalid share data:", error);
	// 		}
	// 	}
	// }, [
	// 	share,
	// 	isTableBuilderInitialized,
	// 	tableBuilder.table.columns.length,
	// 	tableBuilder.table.data.length, // Load directly if no existing data
	// ]);

	const handleCancel = () => {
		setShareDialogOpen(false);
		setSharedData(null);
		// Clean up URL
		window.history.replaceState({}, "", "/table-builder");
	};

	if (!isTableBuilderInitialized) {
		return <Spinner />;
	}
	return (
		<main className="w-full h-[calc(100vh-var(--main-padding-top,48px))] flex flex-col">
			{isMdUp ? (
				<ResizablePanelGroup direction="horizontal" className="h-full">
					{/* Left Sidebar */}
					<ResizablePanel
						ref={sidebarRef}
						defaultSize={20}
						minSize={15}
						maxSize={35}
						className="bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60"
						onResize={(size) => {
							// Convert percentage to pixels roughly
							const width = (window.innerWidth * size) / 100;
							setSidebarWidth(width);
						}}
					>
						<div className="flex flex-col h-full">
							<div className="flex-none">
								<div className="flex gap-2 h-auto lg:h-14 border-y justify-center items-center content-center text-center self-center w-full">
									<AnimatedIconButton
										icon={
											<BlocksIcon
												className="-ms-0.5 me-1.5 opacity-60"
												size={16}
											/>
										}
										text={
											(isMdUp && sidebarWidth > 350) || !isMdUp ? "Builder" : ""
										}
										variant={activeTab === "columns" ? "default" : "ghost"}
										onClick={() => setActiveTab("columns")}
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
											(isMdUp && sidebarWidth > 350) || !isMdUp ? (
												<span className="ml-1">Templates</span>
											) : (
												""
											)
										}
										variant={activeTab === "templates" ? "default" : "ghost"}
										onClick={() => setActiveTab("templates")}
									/>
									<AnimatedIconButton
										icon={
											<SettingsGearIcon
												className="-ms-0.5 me-1.5 opacity-60"
												size={16}
											/>
										}
										text={
											(isMdUp && sidebarWidth > 350) || !isMdUp ? (
												<span className="ml-1">Settings</span>
											) : (
												""
											)
										}
										variant={activeTab === "settings" ? "default" : "ghost"}
										onClick={() => setActiveTab("settings")}
									/>
								</div>
							</div>
							<div className="flex-1 min-h-0">
								{activeTab === "columns" && (
									<TableColumnEdit />
								)}
								{activeTab === "templates" && (
									<TableTemplates />
								)}
								{activeTab === "settings" && (
									<TableSettingsSidebar />
								)}
							</div>
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={80}>
						<div className="flex flex-col h-full">
							<TableHeader />
							<Outlet />
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			) : (
				<div className="flex flex-col h-full">
					<TableHeader />
					<ScrollArea className="flex-1 min-h-0">
						<div className="flex w-full flex-1 min-h-0 flex-col">
							{/* Left Sidebar */}
							<div className="shrink-0 border-b">
								<div className="">
									<ScrollArea className="w-full">
										<div className="flex gap-2 mb-3 justify-center">
											<AnimatedIconButton
												icon={
													<BlocksIcon
														className="-ms-0.5 me-1.5 opacity-60"
														size={16}
													/>
												}
												text="Builder"
												variant={activeTab === "columns" ? "default" : "ghost"}
												onClick={() => setActiveTab("columns")}
											/>
											<AnimatedIconButton
												icon={
													<LayoutPanelTopIcon
														className="-ms-0.5 me-1.5 opacity-60"
														size={16}
													/>
												}
												text="Templates"
												variant={
													activeTab === "templates" ? "default" : "ghost"
												}
												onClick={() => setActiveTab("templates")}
											/>
											<AnimatedIconButton
												icon={
													<SettingsGearIcon
														className="-ms-0.5 me-1.5 opacity-60"
														size={16}
													/>
												}
												text="Settings"
												variant={activeTab === "settings" ? "default" : "ghost"}
												onClick={() => setActiveTab("settings")}
											/>
										</div>
										<ScrollBar orientation="horizontal" />
									</ScrollArea>
									{activeTab === "columns" && (
										<TableColumnEdit />
									)}
									{activeTab === "templates" && (
										<TableTemplates />
									)}
									{activeTab === "settings" && (
										<TableSettingsSidebar />
									)}
								</div>
							</div>

							{/* Content area */}
							<div className="flex-1 flex min-h-0 flex-col">
								<div>
									<Outlet />
								</div>
							</div>
						</div>
					</ScrollArea>
				</div>
			)}

			{/* Share Replace Dialog */}
			<ResponsiveDialog
				open={shareDialogOpen}
				onOpenChange={setShareDialogOpen}
			>
				<ResponsiveDialogContent>
					<div className="m-5">
						<ResponsiveDialogHeader>
							<ResponsiveDialogTitle>Load Shared Table</ResponsiveDialogTitle>
							<ResponsiveDialogDescription>
								You have existing table data. Do you want to replace it with the
								shared table configuration?
							</ResponsiveDialogDescription>
						</ResponsiveDialogHeader>
						<div className="space-y-4 mt-4">
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={handleCancel}>
									Cancel
								</Button>
								<Button onClick={handleReplace}>Replace</Button>
							</div>
						</div>
					</div>
				</ResponsiveDialogContent>
			</ResponsiveDialog>
		</main>
	);
}
