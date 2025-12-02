import { useLocation } from "@tanstack/react-router";
import { Brackets } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "@/components/ui/revola";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

import { settingsCollection } from "@/db-collections/settings.collections";
import { useFormBuilder } from "@/hooks/use-form-builder";
import { useFormStore } from "@/hooks/use-form-store";
import useSettings from "@/hooks/use-settings";
import type { Framework, ValidationSchema } from "./types";
import CodeDialog from "./form-code-dialog";
import {
	AnimatedIconButton,
	AnimatedIconSpan,
} from "../ui/animated-icon-button";
import { BlocksIcon } from "../ui/blocks";
import { ChevronDownIcon } from "../ui/chevron-down";
import { HeartIcon } from "../ui/heart";
import { LayersIcon } from "../ui/layers";
import { LayoutPanelTopIcon } from "../ui/layout-panel-top";
import { RotateCWIcon } from "../ui/rotate-cw";
import { SettingsGearIcon } from "../ui/settings-gear";
import { ShareIcon } from "../ui/share";

export default function FormHeader() {
	const location = useLocation();
	const { activeTab, preferredFramework, preferredSchema } = useSettings();
	const frameworks = ["react", "solid","vue", "angular"];
	const validationLibs = ["zod", "valibot", "arktype"];

	const isFormBuilder = location.pathname.startsWith("/form-builder");

	const handleSubTabChange = (newSubTab: string) => {
		settingsCollection?.update("user-settings", (draft) => {
			draft.activeTab = newSubTab as "builder" | "template" | "settings";
		});
	};

	const id = useId();
	const { actions, isMS, framework, validationSchema, formElements } =
		useFormStore();
	const { resetForm } = useFormBuilder();

	// Sync form store with preferred settings on initial load or when settings change
	// biome-ignore lint/correctness/useExhaustiveDependencies: Avoid overriding user selections by excluding framework from deps
	useEffect(() => {
		if (preferredFramework && preferredFramework !== framework) {
			actions.setFramework(preferredFramework as Framework);
		}
	}, [preferredFramework, actions]); // Remove framework from deps to avoid overriding user selections

	// biome-ignore lint/correctness/useExhaustiveDependencies: Avoid overriding user selections by excluding validationSchema from deps
	useEffect(() => {
		if (preferredSchema && preferredSchema !== validationSchema) {
			actions.setValidationSchema(preferredSchema as ValidationSchema);
		}
	}, [preferredSchema, actions]); // Remove validationSchema from deps to avoid overriding user selections

	// Save dialog state
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [saveFormName, setSaveFormName] = useState("");

	const handleSaveForm = () => {
		if (saveFormName.trim()) {
			actions.saveForm(saveFormName.trim());
			setSaveDialogOpen(false);
			setSaveFormName("");
		}
	};

	const handleFrameworkChange = (framework: Framework) => {
		actions.setFramework(framework as Framework);
		settingsCollection.update("user-settings", (draft) => {
			draft.preferredFramework = framework;
		});
	};

	function handleShare() {
		navigator.clipboard.writeText(
			`https://tancn.dev/form-builder?share=${encodeURIComponent(JSON.stringify(formElements))}`,
		);
		toast("Link Copied to clipboard");
	}

	return (
		<header className="w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="flex h-auto lg:h-14 border-y items-center mx-3 flex-col lg:flex-row justify-between">
				{/* Tabs section */}
					<div className="order-2 lg:order-1 shrink-0 mr-4 w-full lg:w-auto py-3 border-t md:border-0 mx-3">
						<div className="flex gap-2">
							<AnimatedIconButton
								icon={
									<BlocksIcon className="-ms-0.5 me-1.5 opacity-60" size={16} />
								}
								text="Builder"
								variant={activeTab === "builder" ? "default" : "ghost"}
								onClick={() => handleSubTabChange("builder")}
							/>
							<AnimatedIconButton
								icon={
									<LayoutPanelTopIcon
										className="-ms-0.5 me-1.5 opacity-60"
										size={16}
									/>
								}
								text="Template"
								variant={activeTab === "template" ? "default" : "ghost"}
								onClick={() => handleSubTabChange("template")}
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
								onClick={() => handleSubTabChange("settings")}
							/>
						</div>
					</div>
				{/* Actions section */}
				<ScrollArea className="md:w-fit w-full py-2 order-1 lg:order-2">
					<div className="flex items-center gap-2">
						<nav className="flex items-center space-x-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<AnimatedIconButton
										icon={<ChevronDownIcon className="w-4 h-4 ml-1" />}
										text={
											framework.charAt(0).toUpperCase() + framework.slice(1)
										}
										variant="ghost"
										size="sm"
										iconPosition="end"
									/>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									{frameworks.map((framework) => (
										<DropdownMenuItem
											key={framework}
											disabled={framework !== "react" && framework !== "solid"}
											onClick={() =>
												handleFrameworkChange(framework as Framework)
											}
										>
											{framework.charAt(0).toUpperCase() + framework.slice(1)}
											{framework !== "react" && framework !== "solid" && (
												<p className="text-primary">soon!</p>
											)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
							<div className="h-4 w-px bg-border" />
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<AnimatedIconButton
										icon={<ChevronDownIcon className="w-4 h-4 ml-1" />}
										text={
											validationSchema.charAt(0).toUpperCase() +
											validationSchema.slice(1)
										}
										variant="ghost"
										size="sm"
										iconPosition="end"
									/>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									{validationLibs.map((lib) => (
										<DropdownMenuItem
											key={lib}
											onClick={() =>
												actions.setValidationSchema(lib as ValidationSchema)
											}
										>
											{lib.charAt(0).toUpperCase() + lib.slice(1)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</nav>

						<div className="h-4 w-px bg-border" />
						<div
							className="group inline-flex items-center gap-2"
							data-state={isMS ? "checked" : "unchecked"}
						>
							<Switch
								id={id}
								checked={isMS}
								onCheckedChange={() => actions.setIsMS(!isMS)}
								aria-labelledby={`${id}-off ${id}-on`}
								aria-label="Toggle between dark and light mode"
							/>
							<AnimatedIconSpan
								icon={<LayersIcon size={16} aria-hidden="true" />}
								text="Multi Step Form"
								onClick={() => actions.setIsMS(!isMS)}
								className="group-data-[state=unchecked]:text-muted-foreground/70 flex gap-2 items-center cursor-pointer text-left text-sm font-medium"
								textClassName="hidden xl:block ml-1"
								aria-controls={id}
								id={`${id}-on`}
							/>
						</div>
						<div className="h-4 w-px bg-border" />
						<Button
							variant="ghost"
							size="sm"
							onClick={() => actions.addFormArray([])}
						>
							<Brackets className="w-4 h-4 mr-1" />
							<span className="hidden xl:block ml-1">Field Array</span>
						</Button>
						<div className="h-4 w-px bg-border" />
						<AnimatedIconButton
							icon={<RotateCWIcon className="w-4 h-4 mr-1" />}
							text={<span className="hidden xl:block ml-1">Reset</span>}
							variant="ghost"
							onClick={() => {
								resetForm();
							}}
						/>
						<div className="h-4 w-px bg-border" />
						<AnimatedIconButton
							icon={<ShareIcon className="w-4 h-4 mr-1" />}
							text={<span className="hidden xl:block ml-1">Share</span>}
							onClick={() => handleShare()}
						/>
						<div className="h-4 w-px bg-border" />

						<ResponsiveDialog
							open={saveDialogOpen}
							onOpenChange={setSaveDialogOpen}
						>
							<ResponsiveDialogTrigger asChild>
								<AnimatedIconButton
									icon={<HeartIcon className="w-4 h-4 mr-1" />}
									text={<span className="hidden xl:block ml-1">Save</span>}
									variant="ghost"
									size="sm"
								/>
							</ResponsiveDialogTrigger>

							<ResponsiveDialogContent>
								<div className="m-5">
									<ResponsiveDialogHeader>
										<ResponsiveDialogTitle>Save Form</ResponsiveDialogTitle>
										<ResponsiveDialogDescription>
											Enter a name for your form to save it for later use.
										</ResponsiveDialogDescription>
									</ResponsiveDialogHeader>
									<div className="space-y-4 mt-4">
										<div>
											<Label className="mb-4" htmlFor={`form_name_${id}`}>
												Form Name
											</Label>
											<Input
												id={`form_name_${id}`}
												placeholder="Enter form name..."
												value={saveFormName}
												onChange={(e) => setSaveFormName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														handleSaveForm();
													}
												}}
											/>
										</div>
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												onClick={() => {
													setSaveDialogOpen(false);
													setSaveFormName("");
												}}
											>
												Cancel
											</Button>
											<Button
												onClick={handleSaveForm}
												disabled={!saveFormName.trim()}
											>
												Save
											</Button>
										</div>
									</div>
								</div>
							</ResponsiveDialogContent>
						</ResponsiveDialog>

						<div className="h-4 w-px bg-border" />
						<CodeDialog />
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>
		</header>
	);
}
