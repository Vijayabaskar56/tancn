import { useMutation } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import * as z from "zod";
import { GeneratedTableCodeViewer } from "@/components/table-components/table-code-viewer";
import useTableStore from "@/hooks/use-table-store";
import { generateTable } from "@/lib/table-code-generators/react/index";
import { setTableName } from "@/services/table-builder.service";
import type { CreateRegistryResponse } from "@/types/form-types";
import { logger } from "@/utils/utils";
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

const tableSchema = z.object({
	tableName: z.string().min(1, { message: "Table name is required" }),
});

function TableCodeDialog() {
	const tableData = useTableStore();

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

	const { files: generatedFiles, dependencies } = generateTable(
		{ id: 1, ...tableData },
		tableData.tableName,
	);
	const files = [
		{
			path: `components/${tableData.tableName}.tsx`,
			content: generatedFiles[0].code,
			type: "registry:component",
			target: "",
		},
		{
			path: `constants/data.ts`,
			content: generatedFiles[1].code,
			type: "registry:file",
			target: "",
		},
	];

	const payload = {
		...dependencies,
		files,
		name: tableData.tableName,
	};

	const url =
		import.meta.env.MODE === "development"
			? "http://localhost:3000"
			: "https://tancn.dev";

	const mutation = useMutation<CreateRegistryResponse, Error, void>({
		mutationKey: ["/create-command", tableData.tableName],
		mutationFn: async (): Promise<CreateRegistryResponse> => {
			const res = await fetch(`${url}/r/${tableData.tableName}`, {
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
			tableName: tableData.tableName,
		} as z.input<typeof tableSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: tableSchema,
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
							tableName: {
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
				setTableName(fieldApi.state.value as string);
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
					// disabled={true}
					icon={<TerminalIcon className="w-4 h-4 mr-1" />}
					text={<span className="hidden xl:block ml-1">Code</span>}
					variant={"ghost"}
					size="sm"
				/>
			</ResponsiveDialogTrigger>
			<ResponsiveDialogContent className="sm:max-w-2xl md:max-w-4xl lg:max-w-4xl xl:max-w-6xl max-h-[85vh] p-0">
				<div className="flex flex-col h-full max-h-[85vh]">
					<ResponsiveDialogHeader className="p-6 pb-4 border-b">
						<ResponsiveDialogTitle>Generated Code</ResponsiveDialogTitle>
						<ResponsiveDialogDescription>
							Copy the code below and build awesome stuff
						</ResponsiveDialogDescription>
					</ResponsiveDialogHeader>
					<form.AppForm>
						<form.Form id={id} className="px-6 pt-4">
							<form.AppField name={"tableName"}>
								{(field) => (
									<field.FieldSet className="w-full">
										<field.Field
											aria-invalid={
												!!field.state.meta.errors.length &&
												field.state.meta.isTouched
											}
										>
											<field.FieldLabel htmlFor={"tableName"}>
												Table Name
											</field.FieldLabel>
											<InputGroup className="flex flex-col gap-2 sm:flex-row sm:gap-0">
												<InputGroupInput
													name={"tableName"}
													aria-invalid={
														!!field.state.meta.errors.length &&
														field.state.meta.isTouched
													}
													placeholder="Enter your table name eg:- UserTable"
													type="string"
													value={field.state.value as string}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													disabled={isGenerateSuccess}
												/>
												<InputGroupAddon
													align="inline-end"
													className="w-full sm:w-auto"
												>
													{mutation.isPending ? (
														<InputGroupButton
															variant="secondary"
															type="button"
															disabled
															className="w-full"
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
															className="w-full"
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
					<ScrollArea className="flex-1 px-6 py-4 overflow-x-auto">
						<GeneratedTableCodeViewer
							isGenerateSuccess={isGenerateSuccess}
							generatedId={generatedId}
							tabsData={tabsData}
							files={generatedFiles}
						/>
					</ScrollArea>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}

export default TableCodeDialog;
