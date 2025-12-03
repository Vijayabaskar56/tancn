/** biome-ignore-all lint/a11y/noLabelWithoutControl: no needed */

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { Database, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutPanelTopIcon } from "@/components/ui/layout-panel-top";
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
import useTableStore from "@/hooks/use-table-store";

import { seo } from "@/utils/seo";
import { cn } from "@/utils/utils";

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
	const [isResizing, setIsResizing] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const screenSize = useScreenSize();
	const isMdUp = screenSize.greaterThanOrEqual("md");
	const _tableBuilder = useTableStore();
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

	// On breakpoint changes, set sensible defaults:
	// - tablet/mobile (<md): collapse to min (200px)
	// - laptop/desktop (>=md): default to 1/3 of available width
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const containerRect = container.getBoundingClientRect();
		const minWidth = 300;
		if (!isMdUp) {
			setSidebarWidth(minWidth);
		} else {
			const oneThird = Math.floor(containerRect.width * 0.2);
			setSidebarWidth(Math.max(minWidth, oneThird));
		}
	}, [isMdUp]);

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

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsResizing(true);
		e.preventDefault();
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isResizing || !containerRef.current || !isMdUp) return;

		const containerRect = containerRef.current.getBoundingClientRect();
		const newWidth = e.clientX - containerRect.left;
		const minWidth = 200;
		const maxWidth = containerRect.width * 0.5; // Maximum 1/2 of screen width

		setSidebarWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
	};

	const handleMouseUp = () => {
		setIsResizing(false);
	};

	// Add event listeners for mouse move and up
	// biome-ignore lint/correctness/useExhaustiveDependencies: doesn't needed
	useEffect(() => {
		if (isResizing && isMdUp) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			};
		}
	}, [isResizing, isMdUp]);

	if (!isTableBuilderInitialized) {
		return <Spinner />;
	}
	return (
		<main className="w-full h-full flex flex-col">
			{isMdUp ? (
				<div
					ref={containerRef}
					className="flex w-full flex-1 min-h-0 min-w-0 flex-col md:flex-row"
				>
					{/* Left Sidebar */}
					<div
						className="shrink-0 border-b md:border-b-0 md:border-r"
						style={isMdUp ? { width: `${sidebarWidth}px` } : { width: "100%" }}
					>
						{isMdUp ? (
							<ScrollArea className="h-full">
								<div className="p-4">
									<div className="flex gap-2 mb-2 justify-center items-center content-center text-center self-center w-full">
										<AnimatedIconButton
											icon={
												<BlocksIcon
													className="-ms-0.5 me-1.5 opacity-60"
													size={16}
												/>
											}
											text={
												(isMdUp && sidebarWidth > 350) || !isMdUp ? (
													<span className="ml-1">Builder</span>
												) : (
													""
												)
											}
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
									<Separator />
									{activeTab === "columns" && (
										<div className="mt-4">
											<div className="w-full">
												<TableColumnEdit />
											</div>
										</div>
									)}
									{activeTab === "templates" && (
										<div className="mt-4">
											<TableTemplates />
										</div>
									)}
									{activeTab === "settings" && (
										<div className="mt-4">
											<TableSettingsSidebar />
										</div>
									)}
								</div>
							</ScrollArea>
						) : (
							<div>
								{/* Global Settings Section */}
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-sm">
											<Settings className="h-4 w-4" />
											Global Settings
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="space-y-3">
											<div className="space-y-2">
												<label className="text-xs font-medium">
													Table Name
												</label>
												<input
													type="text"
													placeholder="Enter table name"
													className="w-full px-2 py-1 text-xs border rounded"
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium">
													Description
												</label>
												<textarea
													placeholder="Enter description"
													className="w-full px-2 py-1 text-xs border rounded resize-none"
													rows={2}
												/>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Row Level Settings Section */}
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-sm">
											<Database className="h-4 w-4" />
											Row Level Settings
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="space-y-3">
											<div className="space-y-2">
												<label className="text-xs font-medium">
													Row Height
												</label>
												<select className="w-full px-2 py-1 text-xs border rounded">
													<option>Compact</option>
													<option>Normal</option>
													<option>Comfortable</option>
												</select>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium">
													Selection Mode
												</label>
												<select className="w-full px-2 py-1 text-xs border rounded">
													<option>Single</option>
													<option>Multiple</option>
													<option>None</option>
												</select>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</div>

					{/* Resize Handle (desktop/tablet only) */}
					{isMdUp && (
						<div
							className={cn(
								"w-1 bg-border/70 hover:bg-primary/30 active:bg-primary/40 cursor-col-resize shrink-0 transition-colors relative group touch-pan-y select-none",
								isResizing && "bg-primary/30",
							)}
							aria-label="Resize sidebar"
							aria-orientation="vertical"
							role="separator"
							tabIndex={0}
							onKeyDown={(e) => {
								// Allow keyboard resizing for accessibility: ArrowLeft/ArrowRight
								if (!isMdUp) return;
								const step = 10;
								if (e.key === "ArrowLeft") {
									setSidebarWidth((w) => Math.max(200, w - step));
									e.preventDefault();
								} else if (e.key === "ArrowRight") {
									const containerRect =
										containerRef.current?.getBoundingClientRect();
									const maxWidth = containerRect
										? containerRect.width * 0.5
										: Infinity;
									setSidebarWidth((w) => Math.min(maxWidth, w + step));
									e.preventDefault();
								}
							}}
							onMouseDown={handleMouseDown}
							onTouchStart={(e) => {
								// Allow touch dragging on larger touch devices
								setIsResizing(true);
								e.preventDefault();
							}}
						></div>
					)}

					<div className="flex-1 flex min-h-0 min-w-0 flex-col">
						<TableHeader />
						{isMdUp ? (
							<ScrollArea className="flex-1 min-h-0 min-w-0">
								<Outlet />
							</ScrollArea>
						) : (
							<div>
								<Outlet />
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="flex flex-col h-full">
					<TableHeader />
					<ScrollArea className="flex-1 min-h-0">
						<div
							ref={containerRef}
							className="flex w-full flex-1 min-h-0 flex-col md:flex-row"
						>
							{/* Left Sidebar */}
							<div
								className="shrink-0 border-b md:border-b-0 md:border-r"
								style={
									isMdUp ? { width: `${sidebarWidth}px` } : { width: "100%" }
								}
							>
								<div className="p-4">
									<ScrollArea className="w-full">
										<div className="flex gap-2 mb-3 justify-center">
											<AnimatedIconButton
												icon={
													<BlocksIcon
														className="-ms-0.5 me-1.5 opacity-60"
														size={16}
													/>
												}
												text={
													(isMdUp && sidebarWidth > 200) || !isMdUp ? (
														<span className="ml-1">Builder</span>
													) : (
														""
													)
												}
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
												text={
													(isMdUp && sidebarWidth > 200) || !isMdUp ? (
														<span className="ml-1">Templates</span>
													) : (
														""
													)
												}
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
												text={
													(isMdUp && sidebarWidth > 200) || !isMdUp ? (
														<span className="ml-1">Settings</span>
													) : (
														""
													)
												}
												variant={activeTab === "settings" ? "default" : "ghost"}
												onClick={() => setActiveTab("settings")}
											/>
										</div>
										<ScrollBar orientation="horizontal" />
									</ScrollArea>
									{activeTab === "columns" && (
										<div className="mt-4">
											<div className="w-full">
												<TableColumnEdit />
											</div>
										</div>
									)}
									{activeTab === "templates" && (
										<div className="mt-4">
											<TableTemplates />
										</div>
									)}
									{activeTab === "settings" && (
										<div className="mt-4">
											<TableSettingsSidebar />
										</div>
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
