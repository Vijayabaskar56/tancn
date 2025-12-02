import { createFileRoute, Link } from "@tanstack/react-router";
import ComponentCard from "@/components/component-card";
import ComponentDetails from "@/components/component-details";
import { Wrapper } from "@/components/form-components/form-code-viewer";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fieldItems, items } from "@/constants/registry";
import type { SettingsCollection } from "@/db-collections/settings.collections";
import useSettings from "@/hooks/use-settings";
import { getRegistryUrl, updatePreferredPackageManager } from "@/utils/utils";
import Loader from "@/components/loader";
import { ErrorBoundary } from "@/components/error-boundary";
import { seo } from "@/utils/seo";

const registryItems = items.map((item) => ({
	name: item.name,
	type: "registry:ui" as const,
	title: item.title,
	description: item.description,
	meta: { colSpan: 2 },
}));

const fieldRegistryItems = fieldItems.map((item) => ({
	name: item.name,
	type: "registry:ui" as const,
	title: item.title,
	description: item.description,
	meta: { colSpan: 1 },
}));

const exampleCode = `import { draftFormSchema } from './schema'
import { useAppForm } from "@/components/ui/tanstack-form"
import { revalidateLogic } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { FieldDescription , FieldLegend} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function DraftForm() {
  const draftForm = useAppForm({
    defaultValues: {
      email: ""
    } as z.input < typeof draftFormSchema > ,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: draftFormSchema,
      onDynamicAsyncDebounceMs: 300
    },
    onSubmit: ({ value }) => {
      toast.success("success");
    },
  });
  return (
  <div>
    <draftForm.AppForm>
      <draftForm.Form>
          <h1 className="text-3xl font-bold">Waitlist</h1>
 <FieldDescription>"Join our waitlist to get early access"</FieldDescription>;
 <draftForm.AppField name={"email"}>
                {(field) => (
                    <field.FieldSet className="w-full">
                      <field.Field>
                        <field.FieldLabel htmlFor={"email"}>Your Email *</field.FieldLabel>
                        <Input
                          name={"email"}
                          placeholder="Enter your Email"
                          type="email"

                          value={(field.state.value as string | undefined) ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                        />
                      </field.Field>

                      <field.FieldError />
                    </field.FieldSet>
                  )}
              </draftForm.AppField>

          <div className="flex justify-end items-center w-full pt-3">
          <draftForm.SubmitButton label="Submit" />
        </div>
      </draftForm.Form>
    </draftForm.AppForm>
  </div>
  )}`;

const manualCode = `import {
	createFormHook,
	createFormHookContexts,
	revalidateLogic,
	useStore,
} from "@tanstack/react-form";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
	Field as DefaultField,
	FieldError as DefaultFieldError,
	FieldSet as DefaultFieldSet,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldTitle,
	fieldVariants,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const {
	fieldContext,
	formContext,
	useFieldContext: _useFieldContext,
	useFormContext,
} = createFormHookContexts();

const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		Field,
		FieldError,
		FieldSet,
		FieldContent,
		FieldDescription,
		FieldGroup,
		FieldLabel,
		FieldLegend,
		FieldSeparator,
		FieldTitle,
		InputGroup,
		InputGroupAddon,
		InputGroupInput,
	},
	formComponents: {
		SubmitButton,
		StepButton,
		FieldLegend,
		FieldDescription,
		FieldSeparator,
		Form,
	},
});

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue,
);

function FieldSet({
	className,
	children,
	...props
}: React.ComponentProps<"fieldset">) {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<DefaultFieldSet className={cn("grid gap-1", className)} {...props}>
				{children}
			</DefaultFieldSet>
		</FormItemContext.Provider>
	);
}

const useFieldContext = () => {
	const { id } = React.useContext(FormItemContext);
	const { name, store, ...fieldContext } = _useFieldContext();

	const errors = useStore(store, (state) => state.meta.errors);
	if (!fieldContext) {
		throw new Error("useFieldContext should be used within <FormItem>");
	}

	return {
		id,
		name,
		formItemId: \`\${id}-form-item\`,
		formDescriptionId: \`\${id}-form-item-description\`,
		formMessageId: \`\${id}-form-item-message\`,
		errors,
		store,
		...fieldContext,
	};
};

function Field({
	children,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
	const { errors, formItemId, formDescriptionId, formMessageId } =
		useFieldContext();

	return (
		<DefaultField
			data-invalid={!!errors.length}
			id={formItemId}
			aria-describedby={
				!errors.length
					? \`\${formDescriptionId}\`
					: \`\${formDescriptionId} \${formMessageId}\`
			}
			aria-invalid={!!errors.length}
			{...props}
		>
			{children}
		</DefaultField>
	);
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
	const { errors, formMessageId } = useFieldContext();
	const body = errors.length ? String(errors.at(0)?.message ?? "") : "";
	if (!body) return null;
	return (
		<DefaultFieldError
			data-slot="form-message"
			id={formMessageId}
			className={cn("text-destructive text-sm", className)}
			{...props}
			errors={body ? [{ message: body }] : []}
		/>
	);
}

function Form({
	children,
	...props
}: Omit<React.ComponentPropsWithoutRef<"form">, "onSubmit" & "noValidate"> & {
	children?: React.ReactNode;
}) {
	const form = useFormContext();
	const handleSubmit = React.useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			e.stopPropagation();
			form.handleSubmit();
		},
		[form],
	);
	return (
		<form
			onSubmit={handleSubmit}
			className={cn(
				"flex flex-col p-2 md:p-5 w-full mx-auto gap-2",
				props.className,
			)}
			noValidate
			{...props}
		>
			{children}
		</form>
	);
}

function SubmitButton({
	label,
	className,
	size,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		label: string;
	}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					className={className}
					size={size}
					type="submit"
					disabled={isSubmitting}
					{...props}
				>
					{isSubmitting && <Spinner />}
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
}

function StepButton({
	label,
	handleMovement,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		label: React.ReactNode | string;
		handleMovement: () => void;
	}) {
	return (
		<Button
			size="sm"
			variant="ghost"
			type="button"
			onClick={handleMovement}
			{...props}
		>
			{label}
		</Button>
	);
}

export {
	revalidateLogic,
	useAppForm,
	useFieldContext,
	useFormContext,
	withFieldGroup,
	withForm,
};`;

export const Route = createFileRoute("/form-registry")({
	head: () => ({
		meta : [
			...seo({title: "TanStack Form Registry | TanCN - Form and Table Builder"}),
		],
	}),
	component: RouteComponent,
	pendingComponent : Loader,
	errorComponent : ErrorBoundary,
});

function RouteComponent() {
	const settings = useSettings();
	const preferredPackageManager = settings?.preferredPackageManager || "pnpm";
	const tabsData = [
		{
			value: "pnpm",
			registery:
				`pnpm dlx shadcn@canary add ${getRegistryUrl(settings?.preferredFramework)}/tanstack-form.json`,
		},
		{
			value: "npm",
			registery:
				`npx shadcn@canary add ${getRegistryUrl(settings?.preferredFramework)}/tanstack-form.json`,
		},
		{
			value: "yarn",
			registery:
				`yarn shadcn@canary add ${getRegistryUrl(settings?.preferredFramework)}/tanstack-form.json`,
		},
		{
			value: "bun",
			registery:
				`bunx --bun shadcn@canary add ${getRegistryUrl(settings?.preferredFramework)}/tanstack-form.json`,
		},
	];

	return (
		<div className="container mx-auto p-8">
			<div className="flex justify-between flex-col lg:flex-row mb-8">
				<h1 className="text-4xl font-bold mb-8">TanStack Form Registry</h1>
				<Button variant="default" size="lg" className="w-32 rounded" asChild>
					<Link to="/form-builder">Start Building</Link>
				</Button>
			</div>
			<h2 className="text-2xl font-semibold mb-4">Installation</h2>
			<Tabs defaultValue="cli" className="w-full mt-2 rounded-md">
				<TabsList>
					<TabsTrigger value="cli">CLI</TabsTrigger>
					<TabsTrigger value="manual">Manual</TabsTrigger>
				</TabsList>
				<TabsContent value="cli">
					<Tabs
						value={preferredPackageManager}
						onValueChange={(value) =>
							updatePreferredPackageManager(
								value as SettingsCollection["preferredPackageManager"],
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
								<div className="relative">
									<CodeBlock>
										<CodeBlockCode code={item.registery} language="bash" />
									</CodeBlock>
								</div>
							</TabsContent>
						))}
					</Tabs>
					<p className="mb-4">
						Add the tanstack-form component to your project using the shadcn
						CLI.
					</p>
				</TabsContent>
				<TabsContent value="manual">
					<Wrapper language="tsx" title="Manual Installation">
						{manualCode}
					</Wrapper>
				</TabsContent>
			</Tabs>
			<h2 className="text-2xl font-semibold mb-4">Usage</h2>
			<p className="mb-4">
				This tanstack-form registry component provides a comprehensive set of
				hooks and components for building forms with TanStack Form. It includes
				form validation, field management, and UI components.
			</p>
			<p className="mb-4">Here's a basic example of how to use it:</p>
			<Wrapper language="tsx" title="Example Usage">
				{exampleCode}
			</Wrapper>

			<h2 className="text-2xl font-semibold my-4">Anatomy</h2>
			<p className="mb-4">
				The tanstack-form has Super Cool Form Composition Feature that allow
				Breaking Large and Complex Form into Composable Field, The Registry Uses
				Form Composition + ShadCN Field Components to Allow Ultimate Flexibiity
			</p>
			<div className="flex lg:flex-row flex-col gap-3 content-center items-center">
				<img src="/assets/anotomy-of-form.avif" alt="anotomy-of-form" />
				<ul className="list-disc list-inside mb-8 flex flex-col gap-1">
					<li>
						<strong>AppForm:</strong> The main form instance created with
						useAppForm, providing form state and methods.
					</li>
					<li>
						<strong>Form:</strong> The root form element that handles submission
						and provides form context.
					</li>
					<li>
						<strong>AppField:</strong> A field component that integrates with
						the form instance for validation and state management.
					</li>
					<li>
						<strong>FieldSet:</strong> Groups related form fields together.
					</li>
					<li>
						<strong>Field:</strong> Wraps individual form fields with
						validation, error handling, and accessibility attributes.
					</li>
					<li>
						<strong>FieldLabel:</strong> Provides accessible labels for form
						fields.
					</li>
					<li>
						<strong>FieldError:</strong> Displays validation errors for the
						field.
					</li>
					<li>
						<strong>FieldDescription:</strong> Provides additional descriptive
						text for form fields.
					</li>
					<li>
						<strong>FieldLegend:</strong> Provides legends for fieldsets.
					</li>
					<li>
						<strong>SubmitButton:</strong> A button component that submits the
						form and shows loading state during submission.
					</li>
					<li>
						<strong>InputGroup, InputGroupInput, InputGroupAddon:</strong>{" "}
						Components for grouping inputs with addons.
					</li>
				</ul>
			</div>
			<h2 className="text-3xl font-bold my-8">Field Examples</h2>
			<div className="grid grid-cols-12 gap-4">
				{fieldRegistryItems.map((registryItem) => (
					<ComponentCard
						className="p-5 flex-1 justify-center items-center content-center"
						key={registryItem.name}
						component={registryItem}
					>
						{(() => {
							const item = fieldItems.find((i) => i.name === registryItem.name);
							return item ? (
								<>
									<item.component />
									<ComponentDetails component={registryItem} />
								</>
							) : null;
						})()}
					</ComponentCard>
				))}
			</div>
			<h2 className="text-3xl font-bold my-8">Form Examples</h2>
			<div className="grid grid-cols-12 gap-4 mb-8">
				{registryItems.map((registryItem) => (
					<ComponentCard
						key={registryItem.name}
						component={registryItem}
						className=""
					>
						{(() => {
							const item = items.find((i) => i.name === registryItem.name);
							return item ? <item.component /> : null;
						})()}
						<ComponentDetails component={registryItem} />
					</ComponentCard>
				))}
			</div>
		</div>
	);
}
