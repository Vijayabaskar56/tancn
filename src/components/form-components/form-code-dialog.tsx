import { useMutation } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import * as z from "zod";
import { useFormStore } from "@/hooks/use-form-store";
import useSettings from "@/hooks/use-settings";
import {
	extractImportDependencies,
	generateFormCode,
	generateImports,
} from "@/lib/form-code-generators";
import { generateValidationCode } from "@/lib/schema-generators";
import { logger } from "@/utils/utils";
import type { Settings } from "@/components/form-components/types";
import type {
	CreateRegistryResponse,
	FormArray,
	FormElement,
	FormElementOrList,
} from "@/types/form-types";
import { GeneratedFormCodeViewer } from "./form-code-viewer";
import { AnimatedIconButton } from "../ui/animated-icon-button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "../ui/input-group";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "../ui/revola";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { revalidateLogic, useAppForm } from "../ui/tanstack-form";
import { TerminalIcon } from "../ui/terminal";

const formSchema = z.object({
	formName: z.string().min(1, { message: "Form name is required" }),
});
function CodeDialog() {
	const {
		formName,
		actions,
		formElements,
		validationSchema,
		isMS,
		schemaName,
	} = useFormStore();
	const settings = useSettings();
	const [open, setOpen] = useState(false);
	const [isGenerateSuccess, setIsGenerateSuccess] = useState(false);
	const [generatedId, setGeneratedId] = useState<string>("");
	const id = useId();
	const tabsData = [
		{
			value: "pnpm",
			registery: `pnpm dlx shadcn@canary add ${generatedId}`,
		},
		{
			value: "npm",
			registery: `npx shadcn@canary add ${generatedId}`,
		},
		{
			value: "yarn",
			registery: `yarn shadcn@canary add ${generatedId}`,
		},
		{
			value: "bun",
			registery: `bunx --bun shadcn@canary add ${generatedId}`,
		},
	];
	const preferredFramework = (settings?.preferredFramework ||
		"react") as "react" | "solid" | "vue" | "angular";
	const generatedCode = generateFormCode({
		formElements: formElements as FormElementOrList[],
		isMS,
		validationSchema,
		settings: settings as Settings,
		formName,
		preferredFramework,
	});
	const validationCode = generateValidationCode(
		isMS,
		schemaName,
		validationSchema,
		formElements,
	);
	const importDependencies = generateImports(
		formElements as (FormElement | FormArray)[],
		validationSchema,
		isMS,
		schemaName,
		preferredFramework,
	);
	const files = [
		{
			path: `components/${formName}.tsx`,
			content: generatedCode?.[0].code,
			type: "registry:component",
			target: "",
		},
		{
			path: `lib/${schemaName}.tsx`,
			content: validationCode,
			type: "registry:lib",
			target: "",
		},
	];
	const payload = {
		...extractImportDependencies(importDependencies, preferredFramework),
		files,
		name: formName,
	};
	const url =
		import.meta.env.MODE === "development"
			? "http://localhost:3000"
			: "https://tancn.dev/";

	const mutation = useMutation<CreateRegistryResponse, Error, void>({
		mutationKey: ["/create-command", formName],
		mutationFn: async (): Promise<CreateRegistryResponse> => {
			const res = await fetch(`${url}/r/${formName}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});
			const data: CreateRegistryResponse = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}
			return data;
		},
	});

	const form = useAppForm({
		defaultValues: {
			formName: formName,
		} as z.input<typeof formSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: formSchema,
			onDynamicAsyncDebounceMs: 300,
		},
		onSubmit: async () => {
			try {
				const result = await mutation.mutateAsync();
				logger("Response:", result);
				if (result.data?.id) {
					setGeneratedId(result.data.id);
					setIsGenerateSuccess(true);
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "An error occurred";
				form.setErrorMap({
					onDynamic: {
						fields: {
							formName: {
								message,
							},
						},
					},
				});
			}
		},
		onSubmitInvalid({ formApi }) {
			const errorMap = formApi.state.errorMap.onDynamic;
			if (!errorMap) return;

			const inputs = Array.from(
				document.querySelectorAll(`#${id} input`),
			) as HTMLInputElement[];
			let firstInput: HTMLInputElement | undefined;
			for (const input of inputs) {
				if (errorMap[input.name]) {
					firstInput = input;
					break;
				}
			}
			firstInput?.focus();
		},
		listeners: {
			onChangeDebounceMs: 300,
			onChange: ({ fieldApi }) => {
				logger(fieldApi.state.value);
				fieldApi.state.value = fieldApi.state.value
					.replace(/[^a-zA-Z0-9\s_]/g, "")
					.split(/[\s_]+/)
					.filter(Boolean)
					.map(
						(word: string) =>
							word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
					)
					.join("");
				actions.setFormName(fieldApi.state.value as string);
			},
		},
	});
	useEffect(() => {
		setIsGenerateSuccess(false);
		setGeneratedId("");
	}, []);
	return (
		<ResponsiveDialog open={open} onOpenChange={setOpen}>
			<ResponsiveDialogTrigger asChild>
				<AnimatedIconButton
					icon={<TerminalIcon className="w-4 h-4 mr-1" />}
					text={<span className="hidden xl:block ml-1">Code</span>}
					variant={"ghost"}
					size="sm"
				/>
			</ResponsiveDialogTrigger>
			<ResponsiveDialogContent className="max-w-6xl lg:max-w-4xl max-h-[85vh] p-0">
				<div className="flex flex-col h-full max-h-[85vh]">
					<ResponsiveDialogHeader className="p-6 pb-4 border-b">
						<ResponsiveDialogTitle>Generated Code</ResponsiveDialogTitle>
						<ResponsiveDialogDescription>
							Copy the code below and build awesome stuff
						</ResponsiveDialogDescription>
					</ResponsiveDialogHeader>
					<form.AppForm>
						<form.Form id={id} className="px-6 pt-4">
							<form.AppField name={"formName"}>
								{(field) => (
									<field.FieldSet className="w-full">
										<field.Field
											aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
										>
											<field.FieldLabel htmlFor={"formName"}>
												Form Name
											</field.FieldLabel>
											<InputGroup>
												<InputGroupInput
													name={"formName"}
													aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
													placeholder="Enter your form name eg:- ContactUs"
													type="string"
													value={field.state.value as string}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													disabled={isGenerateSuccess}
												/>
												<InputGroupAddon align="inline-end">
													{mutation.isPending ? (
														<InputGroupButton
															variant="secondary"
															type="button"
															disabled
														>
															<Spinner className="w-4 h-4 mr-2" />
															Generating...
														</InputGroupButton>
													) : (
														<InputGroupButton
															variant="secondary"
															type="submit"
															disabled={
																form.state.isSubmitting || isGenerateSuccess
															}
														>
															Generate Command
														</InputGroupButton>
													)}
												</InputGroupAddon>
											</InputGroup>
										</field.Field>
										<field.FieldError />
									</field.FieldSet>
								)}
							</form.AppField>
						</form.Form>
					</form.AppForm>
					<Separator className="my-4" />
					<ScrollArea className="flex-1 px-6 py-4">
						<GeneratedFormCodeViewer
							isGenerateSuccess={isGenerateSuccess}
							generatedId={generatedId}
							tabsData={tabsData}
						/>
					</ScrollArea>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}

export default CodeDialog;
