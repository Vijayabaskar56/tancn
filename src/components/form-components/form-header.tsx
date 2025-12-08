import { useLocation } from "@tanstack/react-router";
import { Brackets } from "lucide-react";
import { useId, useState } from "react";
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
import { useFormBuilder } from "@/hooks/use-form-builder";
import useFormBuilderState from "@/hooks/use-form-builder-state";
import useSettings from "@/hooks/use-settings";
import {
	setPreferredFramework,
	setPreferredSchema,
	setIsMS,
	addFormArray,
	saveFormTemplate,
} from "@/services/form-builder.service";
import {
	AnimatedIconButton,
	AnimatedIconSpan,
} from "../ui/animated-icon-button";
import { ChevronDownIcon } from "../ui/chevron-down";
import { HeartIcon } from "../ui/heart";
import { LayersIcon } from "../ui/layers";

import { RotateCWIcon } from "../ui/rotate-cw";

import { ShareIcon } from "../ui/share";
import CodeDialog from "./form-code-dialog";
import type { Framework, ValidationSchema } from "./types";
import { getRegistryUrl } from "@/utils/utils";

export default function FormHeader() {
	const location = useLocation();
	const settings = useSettings();
	const frameworks = ["react", "solid", "vue", "angular"];
	const validationLibs = ["zod", "valibot", "arktype"];
	const _isFormBuilder = location.pathname.startsWith("/form-builder");

	const id = useId();
	const { isMS, formElements } = useFormBuilderState();
	const { resetForm } = useFormBuilder();

	// Save dialog state
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [saveFormName, setSaveFormName] = useState("");

	const handleSaveForm = () => {
		if (saveFormName.trim()) {
			saveFormTemplate(saveFormName.trim());
			setSaveDialogOpen(false);
			setSaveFormName("");
		}
	};

	const handleFrameworkChange = (newFramework: Framework) => {
		setPreferredFramework(newFramework);
	};

	function handleShare() {
		navigator.clipboard.writeText(
			`${getRegistryUrl()}/form-builder?share=${encodeURIComponent(JSON.stringify(formElements))}`,
		);
		toast("Link Copied to clipboard");
	}

	return (
		<header className="w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="flex h-auto lg:h-14 border-y items-center justify-end">
				{/* Actions section */}
				<ScrollArea className="md:w-fit w-full py-2">
					<div className="flex items-center gap-2">
						<nav className="flex items-center space-x-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<AnimatedIconButton
										icon={<ChevronDownIcon className="w-4 h-4 ml-1" />}
										text={
											(settings?.preferredFramework ?? "react")?.charAt(0).toUpperCase() + (settings?.preferredFramework ?? "react")?.slice(1)
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
											(settings?.preferredSchema ?? "zod")?.charAt(0).toUpperCase() +
											(settings?.preferredSchema ?? "zod")?.slice(1)
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
												setPreferredSchema(lib as ValidationSchema)
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
								onCheckedChange={() => setIsMS(!isMS)}
								aria-labelledby={`${id}-off ${id}-on`}
								aria-label="Toggle between dark and light mode"
							/>
							<AnimatedIconSpan
								icon={<LayersIcon size={16} aria-hidden="true" />}
								text="Multi Step Form"
								onClick={() => setIsMS(!isMS)}
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
							onClick={() => addFormArray([])}
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
