import { useLiveQuery } from "@tanstack/react-db";
import { createIsomorphicFn } from "@tanstack/react-start";
import {
  type FormBuilder,
  type FormBuilderSettings,
  type FormElements,
  formBuilderCollection,
} from "@/db-collections/form-builder.collections";

const defaultFormBuilderState: Omit<FormBuilder, "id"> = {
  formName: "draft",
  schemaName: "draftFormSchema",
  isMS: false,
  formElements: [],
  settings: {
    defaultRequiredValidation: true,
    numericInput: false,
    focusOnError: true,
    validationMethod: "onDynamic",
    asyncValidation: 500,
    activeTab: "builder",
    preferredSchema: "zod",
    preferredFramework: "react",
    preferredPackageManager: "pnpm",
    isCodeSidebarOpen: false,
  },
};

export type FormBuilderState = {
  formName: string;
  schemaName: string;
  isMS: boolean;
  formElements: FormElements;
  settings: FormBuilderSettings;
  lastAddedStepIndex?: number;
};

const useFormBuilderState = createIsomorphicFn()
  .server((): FormBuilderState => {
    return defaultFormBuilderState as FormBuilderState;
  })
  .client((): FormBuilderState => {
    const { data } = useLiveQuery((q) =>
      q
        .from({ formBuilder: formBuilderCollection })
        .select(({ formBuilder }) => ({
          formName: formBuilder.formName,
          schemaName: formBuilder.schemaName,
          isMS: formBuilder.isMS,
          formElements: formBuilder.formElements,
          settings: formBuilder.settings,
          lastAddedStepIndex: formBuilder.lastAddedStepIndex,
        })),
    );

    return data?.[0] || (defaultFormBuilderState as FormBuilderState);
  });

export default useFormBuilderState;
