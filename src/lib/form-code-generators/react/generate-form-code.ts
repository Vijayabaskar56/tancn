import type { Settings } from "@/components/form-components/types";
import {
	getDefaultFormElement,
	getDefaultValuesString,
	objectToLiteralString,
	processFormElements,
} from "@/lib/form-code-generators/react/generate-default-value";
import { getFormElementCode } from "@/lib/form-code-generators/react/generate-form-component";
import { generateImports } from "@/lib/form-code-generators/react/generate-imports";
import { flattenFormSteps } from "@/lib/form-elements-helpers";
import { generateFormNames } from "@/utils/utils";
// generate-form-code.ts
import type {
	FormArray,
	FormElement,
	FormElementOrList,
	FormStep,
} from "@/types/form-types";

const generateValidationLogic = (settings: Settings): string => {
	if (settings.validationMethod === "onDynamic") {
		return "revalidateLogic()";
	}
	if (settings.validationMethod === "onChange") {
		return 'revalidateLogic({ mode: "change", modeAfterSubmission: "change" })';
	}
	if (settings.validationMethod === "onBlur") {
		return 'revalidateLogic({ mode: "blur", modeAfterSubmission: "blur" })';
	}
	return "revalidateLogic()";
};

const generateValidatorsString = (
	settings: Settings,
	schemaName: string,
): string => {
	const validators: string[] = [];
	const method = settings.validationMethod || "onDynamic";
	validators.push(`${method}: ${schemaName}`);
	validators.push(`${method}AsyncDebounceMs: ${settings.asyncValidation}`);
	return `{ ${validators.join(", ")} }`;
};

const modifyElement = (
	el: FormElementOrList,
	prefix: string,
): FormElementOrList => {
	if (Array.isArray(el)) {
		return el.map((e) => modifyElement(e, prefix)) as FormElement[];
	}
	return { ...el, name: prefix + el.name };
};

const renderFields = (
	fields: (FormElementOrList | FormArray)[],
	isInGroup = false,
	formVariableName = "form",
): string => {
	return fields
		.map((formElement) => {
			if (Array.isArray(formElement)) {
				return `
				<div className="flex items-center justify-between flex-wrap sm:flex-nowrap w-full gap-2">
				${formElement.map((field) => getFormElementCode(field, isInGroup, formVariableName)).join("")}
				</div>`;
			}
			// Check if it's a FormArray
			if ("arrayField" in formElement) {
				const formArray = formElement as FormArray;

				// Use the template arrayField for pushValue, not runtime entries
				const actualFields = formArray.arrayField;
				const defaultEntry = processFormElements(
					actualFields as FormElementOrList[],
				);
				const pushValueStr = objectToLiteralString(defaultEntry);
				const fieldPrefix = isInGroup ? "group" : formVariableName;
				return `{${fieldPrefix}.AppField({
  name: "${formArray.name}",
  mode: "array",
  children: (field) => (
    <div className="w-full space-y-4">
      {field.state.value.map((_, index) => (
        <div key={index} className="space-y-3 p-4 relative">
          <Separator />
          ${renderFields(
						(actualFields as FormElementOrList[]).map((el) =>
							modifyElement(el, `\`${formArray.name}[\${index}].`),
						),
						isInGroup, // Pass the correct group context
						formVariableName,
					)}
        </div>
      ))}
      <div className="flex justify-between pt-2">
        <Button variant="outline" type="button" onClick={() => field.pushValue(${pushValueStr}, { dontValidate: true })}>
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
        <Button variant="outline" type="button" onClick={() => field.removeValue(field.state.value.length - 1)} disabled={field.state.value.length <= 1}>
          <Trash2 className="h-4 w-4 mr-2" /> Remove
        </Button>
      </div>
    </div>
  )
})}`;
			}
			return getFormElementCode(
				formElement as FormElement,
				isInGroup,
				formVariableName,
			);
		})
		.join("\n");
};

export const generateFormCode = ({
	formElements,
	isMS,
	validationSchema,
	settings,
	formName,
}: {
	formElements: FormElementOrList[] | FormStep[];
	isMS: boolean;
	validationSchema: Settings["preferredSchema"];
	settings: Settings;
	formName: string;
}): { file: string; code: string }[] => {
	const { componentName, variableName, schemaName } =
		generateFormNames(formName);
	const flattenedFormElements = isMS
		? flattenFormSteps(formElements as FormStep[]).flat()
		: formElements.flat();
	const imports = Array.from(
		generateImports(
			flattenedFormElements as (FormElement | FormArray)[],
			validationSchema,
			isMS,
			schemaName,
		),
	).join("\n");

	const singleStepFormCode = [
		{
			file: "single-step-form.tsx",
			code: `
${imports}

export function ${componentName}() {
 const isDefault = useStore(${variableName}.store, (state) => state.isDefaultValue);

 const ${variableName} = useAppForm({
   defaultValues: ${getDefaultValuesString(validationSchema, schemaName, formElements)},
  validationLogic: ${generateValidationLogic(settings)},
  validators: ${generateValidatorsString(settings, schemaName)},
  onSubmit : ({value}) => {
			toast.success("success");
  },${
		settings.focusOnError
			? `
  onSubmitInvalid({ formApi }) {
				const errorMap = formApi.state.errorMap['${settings.validationMethod || "onDynamic"}']!;
				const inputs = Array.from(
					document.querySelectorAll("#previewForm input"),
				) as HTMLInputElement[];

				let firstInput: HTMLInputElement | undefined;
				for (const input of inputs) {
					if (errorMap[input.name]) {
						firstInput = input;
						break;
					}
				}
				firstInput?.focus();
		}`
			: ""
	}
});

return (
  <div>
    <${variableName}.AppForm>
      <${variableName}.Form>
         ${renderFields(formElements as (FormElementOrList | FormArray)[], false, variableName)}
         ${
						!isMS
							? `
         <div className="flex justify-end items-center w-full pt-3 gap-3">
         {!isDefault &&
							<Button type="button" onClick={() => ${variableName}.reset()} className="rounded-lg" variant='outline' size="sm">
										Reset
							</Button>
						}
         <${variableName}.SubmitButton label="Submit" />
        </div>`
							: ""
					}
      </${variableName}.Form>
    </${variableName}.AppForm>
  </div>
)
}`,
		},
	];
	if (!isMS) return singleStepFormCode;

	function generateStepComponents(steps: FormStep[]): string {
		const stepComponents = steps.map((step, index) => {
			const stepNumber = index + 1;
			const renderedFields = renderFields(step.stepFields, true);
			return `const Step${stepNumber}Group = withFieldGroup({
  defaultValues: ${getStepDefaultValues(step.stepFields)},
  render: function Step${stepNumber}Render({ group }) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Step ${stepNumber}</h2>
        ${renderedFields}
      </div>
    );
  },
});`;
		});

		return stepComponents.join("\n\n");
	}

	function getStepDefaultValues(stepFields: FormElementOrList[]): string {
		const defaults = getDefaultFormElement(
			stepFields as (FormElementOrList | FormArray)[],
		);
		return objectToLiteralString(defaults);
	}

	function getStepFieldMappings(stepFields: FormElementOrList[]): string {
		const fieldMappings: Record<string, string> = {};

		const processFields = (fields: FormElementOrList[]) => {
			for (const field of fields.filter(
				(f) => !Array.isArray(f) && !f.static,
			)) {
				if (Array.isArray(field)) {
					processFields(field);
				} else if ("arrayField" in field) {
					// Handle FormArray
					fieldMappings[field.name] = `${field.name}`;
				} else {
					// Handle regular FormElement
					fieldMappings[field.name] = field.name;
				}
			}
		};

		processFields(stepFields);
		return Object.entries(fieldMappings)
			.map(([key, value]) => `${key}: "${value}"`)
			.join(", ");
	}

	const stepComponentsStr = generateStepComponents(formElements as FormStep[]);

	const MSF_Code = `
  ${imports}
  import { Progress } from '@/components/ui/progress'
  import { motion, AnimatePresence } from 'motion/react'
  import { useFormStepper } from '@/hooks/use-stepper'

  ${stepComponentsStr}


  export function ${componentName}() {
    const {
      currentValidator,
      step,
      currentStep,
      isFirstStep,
      handleCancelOrBack,
      handleNextStepOrSubmit,
    } = useFormStepper(stepSchemas);

    const isDefault = useStore(${variableName}.store, (state) => state.isDefaultValue);

    const ${variableName} = useAppForm({
      defaultValues: ${getDefaultValuesString(validationSchema, schemaName, formElements)},
      validationLogic: ${generateValidationLogic(settings)},
      validators: {
        ${settings.validationMethod || "onDynamic"}: currentValidator as typeof ${schemaName},
        ${settings.validationMethod || "onDynamic"}AsyncDebounceMs: ${settings.asyncValidation},
      },
      onSubmit: ({ value }) => {
        toast.success("Submitted Successfully");
      },
    });

    const groups: Record<number, React.ReactNode> = {
      ${Array.from({ length: (formElements as FormStep[]).length }, (_, i) => {
				const step = (formElements as FormStep[])[i];
				const fieldMappings = getStepFieldMappings(step.stepFields);
				return `${i + 1}: <Step${i + 1}Group form={${variableName}} fields={{ ${fieldMappings} }} />`;
			}).join(",\n      ")}
    };

    const handleNext = async () => {
      await handleNextStepOrSubmit(${variableName});
    };

    const handlePrevious = () => {
      handleCancelOrBack({ onBack: () => {} });
    };

    const current = groups[currentStep];

    return (
      <div>
        <${variableName}.AppForm>
          <${variableName}.Form>
            <div className="flex flex-col gap-2 pt-3">
              <div className="flex flex-col items-center justify-start gap-1">
                <span>
                  Step {currentStep} of {Object.keys(groups).length}
                </span>
                <Progress
                  value={(currentStep / Object.keys(groups).length) * 100}
                />
              </div>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="flex flex-col gap-2"
                >
                  {current}
                </motion.div>
              </AnimatePresence>
               <div className="flex items-center justify-between gap-3 w-full pt-3">
               <${variableName}.StepButton
                  label={<><ChevronLeftIcon /> Previous</>}
                  disabled={isFirstStep}
                  handleMovement={() =>
                    handleCancelOrBack({
                      onBack: () => handlePrevious(),
                    })
                  }
                />
                {step.isCompleted ? (
                  <div className="flex items-center justify-end w-full pt-3 gap-3">
                  {!isDefault &&
                    <Button type="button" onClick={() => ${variableName}.reset()} className="rounded-lg" variant='outline' size="sm">
                              Reset
                    </Button>
                  }
                  <${variableName}.SubmitButton
                    label="Submit"
                    onClick={() => handleNextStepOrSubmit(${variableName})}
                  />
                  </div>
                ) : (
                  <div className="flex items-center justify-end w-full pt-3 gap-3">
                  {!isDefault &&
                    <Button type="button" onClick={() => ${variableName}.reset()} className="rounded-lg" variant='outline' size="sm">
                              Reset
                    </Button>
                  }
                    <${variableName}.StepButton label={<>Next <ChevronRightIcon /></>} handleMovement={handleNext} />
                  </div>
                )}
              </div>
            </div>
          </${variableName}.Form>
        </${variableName}.AppForm>
      </div>
    );
  }`;
	const multiStepFormCode = [
		{
			file: "multi-step-form.tsx",
			code: MSF_Code,
		},
	];
	return multiStepFormCode;
};
