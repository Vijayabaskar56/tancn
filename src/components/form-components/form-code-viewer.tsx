import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { Settings } from "@/components/form-components/types";
import {
	CodeBlock,
	CodeBlockCode,
	CodeBlockGroup,
} from "@/components/ui/code-block";
import CopyButton from "@/components/ui/copy-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FormBuilderSettings } from "@/db-collections/form-builder.collections";
import useFormBuilderState from "@/hooks/use-form-builder-state";
import useSettings from "@/hooks/use-settings";
import { generateFormCode } from "@/lib/form-code-generators";
import { flattenFormSteps } from "@/lib/form-elements-helpers";
import { generateValidationCode } from "@/lib/schema-generators";
import {
	setPreferredFramework,
	setPreferredSchema,
} from "@/services/form-builder.service";
import type {
	FormElement,
	FormElementOrList,
	FormStep,
} from "@/db-collections/form-builder.collections";
import {
	formatCode,
	getRegistryUrl,
	logger,
	updatePreferredPackageManager,
} from "@/utils/utils";
import { AnimatedIconButton } from "../ui/animated-icon-button";
import { ChevronDownIcon } from "../ui/chevron-down";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Wrapper = ({
	children,
	language,
	title,
}: {
	language: string;
	children: string;
	title: string;
}) => {
	return (
		<CodeBlock className="my-0 w-full border-border border rounded-md overflow-hidden bg-background dark:bg-background/95">
			<CodeBlockGroup className="border-border border-b px-4 py-2 bg-muted/50 dark:bg-muted/20">
				<div className="bg-muted dark:bg-muted/80 py-1 px-1.5 rounded-sm text-muted-foreground dark:text-muted-foreground/90 text-sm font-medium">
					{title}
				</div>
				<CopyButton text={children} />
			</CodeBlockGroup>
			<div className="*:mt-0 [&_pre]:p-3 w-full bg-background dark:bg-background/95">
				<CodeBlockCode code={children} language={language} copyButton={false} />
			</div>
		</CodeBlock>
	);
};

export const JsonViewer = ({
	json,
}: {
	json: FormElementOrList[] | FormStep[] | Record<string, unknown>;
}) => {
	if (!Array.isArray(json)) {
		json = [json] as FormStep[];
	}

	return (
		<Wrapper title="Form JSON" language="json">
			{JSON.stringify(json, null, 2)}
		</Wrapper>
	);
};

const installableShadcnComponents: Partial<
	Record<FormElement["fieldType"], string>
> = {
	Input: "input",
	Password: "input",
	Textarea: "textarea",
	Checkbox: "checkbox",
	Select: "select",
	Slider: "slider",
	Switch: "switch",
	OTP: "otp",
	RadioGroup: "radio-group",
	ToggleGroup: "toggle-group",
	DatePicker: "popover calendar",
	Separator: "separator",
	MultiSelect: "",
};
//======================================
export function CodeBlockPackagesInstallation({
	customRegistryUrl,
}: {
	customRegistryUrl?: string;
}) {
	const { formElements, isMS } = useFormBuilderState();
	const processedFormElements = isMS
		? flattenFormSteps(formElements as FormStep[])
		: formElements;
	const formElementTypes = (processedFormElements.flat() as FormElement[])
		.filter((el) => !el.static)
		.map((el) => el.fieldType)
		.map((str) => installableShadcnComponents[str])
		.filter((str) => str && str.length > 0);
	const settings = useSettings();
	const preferredPackageManager = settings?.preferredPackageManager || "pnpm";
	const packagesSet = new Set(formElementTypes);
	const packages = settings?.preferredFramework !== "react" ? Array.from(packagesSet).map(item => `${getRegistryUrl(settings?.preferredFramework)}/${item}.json`).join(" ") : Array.from(packagesSet).join(" ");
	const formPackage =
		settings?.preferredFramework === "solid"
			? "@tanstack/solid-form"
			: "@tanstack/react-form";
	const otherPackages = `${formPackage} zod${settings?.preferredFramework === "react" ? " motion" : ""}`;

	const defaultRegistryUrl = `${getRegistryUrl(settings?.preferredFramework)}/tanstack-form.json`;
	const registryUrl = customRegistryUrl || defaultRegistryUrl;

	const tabsData = [
		{
			value: "pnpm",
			shadcn: `pnpm dlx shadcn@latest add ${packages}`,
			base: `pnpm add ${otherPackages}`,
			registery: `pnpm dlx shadcn@canary add ${registryUrl}`,
		},
		{
			value: "npm",
			shadcn: `npx shadcn@latest add ${packages}`,
			base: `npx i ${otherPackages}`,
			registery: `npx shadcn@canary add ${registryUrl}`,
		},
		{
			value: "yarn",
			shadcn: `npx shadcn@latest add ${packages}`,
			base: `npx add ${otherPackages}`,
			registery: `yarn shadcn@canary add ${registryUrl}`,
		},
		{
			value: "bun",
			shadcn: `bunx --bun shadcn@latest add ${packages}`,
			base: `bunx --bun add ${otherPackages}`,
			registery: `bunx --bun shadcn@canary add ${registryUrl}`,
		},
	];

	return (
		<div className="w-full py-5 max-w-full">
			<h2 className="font-sembold text-start">Install base packages</h2>
			<Tabs
				value={settings?.preferredPackageManager}
				onValueChange={(value) =>
					updatePreferredPackageManager(
						value as FormBuilderSettings["preferredPackageManager"],
					)
				}
				className="w-full mt-2 rounded-md"
			>
				<TabsList>
					{tabsData.map((item) => (
						<TabsTrigger key={item.value} value={item.value}>
							{item.value}
						</TabsTrigger>
					))}
				</TabsList>
				{tabsData.map((item) => (
					<TabsContent key={item.value} value={item.value}>
						<CodeBlock>
							<CodeBlockCode code={item.base} language="bash" />
						</CodeBlock>
					</TabsContent>
				))}
			</Tabs>
			<h2 className="font-sembold text-start mt-4">
				Install required shadcn components
			</h2>
			<Tabs
				value={preferredPackageManager}
				onValueChange={(value) =>
					updatePreferredPackageManager(
						value as FormBuilderSettings["preferredPackageManager"],
					)
				}
				className="w-full mt-2 rounded-md"
			>
				<TabsList>
					{tabsData.map((item) => (
						<TabsTrigger key={item.value} value={item.value}>
							{item.value}
						</TabsTrigger>
					))}
				</TabsList>
				{tabsData.map((item) => (
					<TabsContent key={item.value} value={item.value}>
						<CodeBlock>
							<CodeBlockCode code={item.shadcn} language="bash" />
						</CodeBlock>
					</TabsContent>
				))}
			</Tabs>
			<h2 className="font-sembold text-start mt-4">
				Shadcn UI + TanStack Form Integration Registery
			</h2>
			<Tabs
				value={preferredPackageManager}
				onValueChange={(value) =>
					updatePreferredPackageManager(
						value as FormBuilderSettings["preferredPackageManager"],
					)
				}
				className="w-full mt-2 rounded-md"
			>
				<TabsList>
					{tabsData.map((item) => (
						<TabsTrigger key={item.value} value={item.value}>
							{item.value}
						</TabsTrigger>
					))}
				</TabsList>
				{tabsData.map((item) => (
					<TabsContent key={item.value} value={item.value}>
						<CodeBlock>
							<CodeBlockCode code={item.registery} language="bash" />
						</CodeBlock>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
const CodeBlockTSX = () => {
	const { formElements, formName, isMS } = useFormBuilderState();
	const settings = useSettings();
	const validationSchema = settings?.preferredSchema || "zod";
	const preferredFramework = (settings?.preferredFramework || "react") as
		| "react"
		| "solid"
		| "vue"
		| "angular";

	useEffect(() => {
		logger("Form elements changed, regenerating TSX code:", formElements);
	}, [formElements]);

	const generatedCode = generateFormCode({
		formElements: formElements as FormElementOrList[],
		isMS,
		validationSchema,
		settings: settings as Settings,
		formName,
		preferredFramework,
	});
	const formattedCode = generatedCode.map((item) => ({
		...item,
		code: formatCode(item.code),
	}));
	return (
		<div className="relative max-w-full flex flex-col gap-y-5">
			{formattedCode.map((item) => (
				<Wrapper key={item.code} title={item.file} language="tsx">
					{item.code}
				</Wrapper>
			))}
		</div>
	);
};
const CodeBlockSchema = () => {
	const { formName, formElements, isMS } = useFormBuilderState();
	const settings = useSettings();
	const validationSchema = settings?.preferredSchema || "zod";
	useEffect(() => {
		logger("Form elements changed, regenerating schema code:", formElements);
	}, [formElements]);
	const validationCode = generateValidationCode(
		isMS,
		formName.toLowerCase(),
		validationSchema,
		formElements,
	);
	const formattedCode = formatCode(validationCode);
	return (
		<div className="relative max-w-full">
			<Wrapper title="schema.ts" language="typescript">
				{formattedCode}
			</Wrapper>
		</div>
	);
};

export function GeneratedFormCodeViewer({
	isGenerateSuccess,
	generatedId,
	tabsData,
}: {
	isGenerateSuccess: boolean;
	generatedId: string;
	tabsData: { value: string; registery: string }[];
}) {
	const settings = useSettings();
	const validationSchema = settings?.preferredSchema || "zod";
	const frameworks = ["react", "solid", "vue", "angular"] as const;
	const validationLibs = ["zod", "valibot", "arktype"] as const;
	return (
		<Tabs defaultValue="tsx" className="w-full min-w-full flex">
			<div className="flex justify-between">
				<TabsList>
					<TabsTrigger value="tsx">TSX</TabsTrigger>
					<TabsTrigger value="schema">Schema</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<AnimatedIconButton
								icon={<ChevronDownIcon className="w-4 h-4 ml-1" />}
								text={
									settings?.preferredFramework
										? settings.preferredFramework.charAt(0).toUpperCase() +
											settings.preferredFramework.slice(1)
										: "React"
								}
								variant="ghost"
								size="sm"
								iconPosition="end"
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="z-[2000]">
							{frameworks.map((framework) => (
								<DropdownMenuItem
									key={framework}
									disabled={framework !== "react" && framework !== "solid"}
									onClick={() =>
										setPreferredFramework(
											framework as "react" | "vue" | "angular" | "solid",
										)
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
						<DropdownMenuContent className="z-[2000]">
							{validationLibs.map((lib) => (
								<DropdownMenuItem
									key={lib}
									onClick={() => {
										setPreferredSchema(lib as "zod" | "valibot" | "arktype");
									}}
								>
									{lib.charAt(0).toUpperCase() + lib.slice(1)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* <GeneratedCodeInfoCard /> */}
			</div>
			<TabsContent value="tsx" tabIndex={-1}>
				<AnimatePresence>
					{isGenerateSuccess && generatedId && (
						<motion.div
							initial={{ opacity: 0, height: 0, y: -20 }}
							animate={{ opacity: 1, height: "auto", y: 0 }}
							exit={{ opacity: 0, height: 0, y: -20 }}
							transition={{ duration: 0.4, ease: "easeOut" }}
							className="border-t mt-4"
						>
							<ScrollArea className=" max-h-[40vh]">
								<h2 className="font-sembold text-start pt-4">
									Instal With Shadcn CLI Command
								</h2>
								<Tabs
									value={settings?.preferredPackageManager}
									onValueChange={(value) =>
										updatePreferredPackageManager(
											value as FormBuilderSettings["preferredPackageManager"],
										)
									}
									className="w-full mt-2 rounded-md"
								>
									<TabsList>
										{tabsData.map((item) => (
											<TabsTrigger key={item.value} value={item.value}>
												{item.value}
											</TabsTrigger>
										))}
									</TabsList>
									{tabsData.map((item) => (
										<TabsContent key={item.value} value={item.value}>
											<CodeBlock>
												<CodeBlockCode code={item.registery} language="bash" />
											</CodeBlock>
										</TabsContent>
									))}
								</Tabs>
							</ScrollArea>
						</motion.div>
					)}
				</AnimatePresence>
				<CodeBlockPackagesInstallation />
				<div className="border-t border-dashed w-full mt-6" />
				<CodeBlockTSX />
			</TabsContent>
			<TabsContent value="schema" tabIndex={-1}>
				<ScrollArea className="h-[60vh]">
					<CodeBlockSchema />
				</ScrollArea>
			</TabsContent>
		</Tabs>
	);
}
