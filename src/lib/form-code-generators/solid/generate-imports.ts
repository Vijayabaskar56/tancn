import type { FormArray, FormElement } from "@/types/form-types";
import useSettings from "@/hooks/use-settings";

export const generateImports = (
	formElements: (FormElement | FormArray)[],
	validationSchema: unknown,
	isMS: boolean,
	schemaName: string,
): Set<string> => {
	const importSet = new Set([
		`import { ${schemaName}${isMS ? `, ${schemaName}Steps` : ""} } from '@/lib/${schemaName}'`,
		'import { useAppForm } from "@/components/ui/tanstack-form"',
		'import { revalidateLogic } from "@tanstack/solid-form"',
		'import { toast } from "sonner"',
	]);
	const processField = (field: FormElement | FormArray) => {
		switch (field.fieldType) {
			case "DatePicker":
				importSet.add(
					'import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"',
				);
				importSet.add('import { cx } from "@/utils/utils"');
				importSet.add('import { Calendar } from "@/components/ui/calender"');
				importSet.add(
					'import { Calendar as CalendarIcon } from "lucide-solid"',
				);
				importSet.add('import { Button } from "@/components/ui/button"');
				importSet.add(
					'\n// Simple date formatter (replacement for date-fns format)\nfunction formatDate(date: Date): string {\n  const months = [\n    "January", "February", "March", "April", "May", "June",\n    "July", "August", "September", "October", "November", "December"\n  ];\n  const month = months[date.getMonth()];\n  const day = date.getDate();\n  const year = date.getFullYear();\n  return `${month} ${day}, ${year}`;\n}',
				);
				break;
			case "OTP":
				importSet.add(
					`import {
	OTPField,
	OTPFieldGroup,
	OTPFieldInput,
	OTPFieldSeparator,
	OTPFieldSlot,
} from "@/components/ui/input-otp"`,
				);
				break;
			case "Select":
				importSet.add(
					'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"',
				);
				break;
			case "MultiSelect":
				importSet.add(
					`import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectList,
	MultiSelectSearch,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select"`,
				);
				importSet.add(
					"\n // IMPORTANT: multi-select is not a shadcn component, so you need to copy it from the souce code and install dependencies. GitHub: https://github.com/Ali-Hussein-dev/formcn/blob/main/apps/web/src/components/ui/multi-select.tsx",
				);
				importSet.add("import { For } from 'solid-js'");
				break;
			case "Password":
				importSet.add(
					"import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'",
				);
				importSet.add("import { Eye, EyeOff } from 'lucide-solid'");
				importSet.add("import { createSignal, Show } from 'solid-js'");
				break;
			case "RadioGroup":
				importSet.add(
					`import {
	RadioGroup,
	RadioGroupItem,
	RadioGroupItemControl,
	RadioGroupItemIndicator,
	RadioGroupItemInput,
	RadioGroupItemLabel,
} from "@/components/ui/radio-group"`,
				);
				importSet.add("import { For } from 'solid-js'");
				break;
			case "ToggleGroup":
				importSet.add(
					"import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'",
				);
				importSet.add("import { For } from 'solid-js'");
				break;
			case "H1":
			case "H2":
			case "H3":
				break;
			case "FormArray":
				importSet.add('import { Separator } from "@/components/ui/separator"');
				importSet.add('import { Plus, Trash2 } from "lucide-solid"');
				importSet.add("import { For } from 'solid-js'");
				break;
			case "FieldDescription":
			case "FieldLegend":
				break;
			default:
				if (field.fieldType) {
					importSet.add(
						`import { ${field.fieldType} } from "@/components/ui/${field.fieldType.toLowerCase()}"`,
					);
				}
				break;
		}

		if (validationSchema === "zod") {
			importSet.add('import * as z from "zod"');
		} else if (validationSchema === "valibot") {
			importSet.add('import { valibotSchema } from "valibot"');
		} else if (validationSchema === "arktype") {
			importSet.add('import { type } from "arktype"');
		}
	};

	formElements.flat().forEach(processField);

	if (isMS) {
		importSet.add(`import type { stepSchemas } from "./schema"`);
		importSet.add(
			'import { withFieldGroup } from "@/components/ui/tanstack-form"',
		);
		importSet.add("import { Progress } from '@/components/ui/progress'");
		importSet.add("import { useFormStepper } from '@/hooks/use-stepper'");
		importSet.add("import { Show } from 'solid-js'");
	}

	return importSet;
};

// Helper: Extract component names from a Set of import statements
export const extractImportDependencies = (
	importSet: Set<string>,
): { registryDependencies: string[]; dependencies: string[] } => {
	const registry = new Set<string>();
	const deps = new Set<string>();
	const settings = useSettings();
	const preferredFramework = settings?.preferredFramework || "react";
	for (const stmt of importSet) {
		const fromMatch = stmt.match(/from\s+["']([^"']+)["']/);
		if (!fromMatch) continue;
		const modulePath = fromMatch[1];

		if (modulePath.startsWith("@/components/")) {
			const component = modulePath.split("/").pop();
			if (component && component === "tanstack-form") {
				registry.add(`https://tancn.dev/r/${preferredFramework}tanstack-form.json`);
			} else {
				if (component) registry.add(component);
			}
		} else if (!modulePath.startsWith("./")) {
			// Skip function definitions and comments
			if (!stmt.trim().startsWith("//") && !stmt.trim().startsWith("function")) {
				deps.add(modulePath);
			}
		}
	}

	return {
		registryDependencies: Array.from(registry),
		dependencies: Array.from(deps),
	};
};

