import type { FormElement } from "@/types/form-types";

const formatFieldName = (name: string) => {
	// If name starts with backtick, it's an array field - ensure it ends with backtick
	if (name.startsWith("`")) {
		return name.endsWith("`") ? name : `${name}\``;
	}
	// Otherwise, wrap in quotes as string literal
	return `"${name}"`;
};

export const getFormElementCode = (
	field: FormElement,
	isInGroup = false,
	formVariableName = "form",
) => {
	const fieldPrefix = isInGroup ? "group" : formVariableName;
	switch (field.fieldType) {
		case "Input":
			return `<${fieldPrefix}.AppField name={${formatFieldName(field.name)}}>
                {(field) => (
                    <field.FieldSet class="w-full">
                      <field.Field>
                        ${field.label && `<field.FieldLabel for={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                        <Input
                          name={${formatFieldName(field.name)}}
                          placeholder="${field.placeholder ?? ""}"
                          type="${field.type ?? "text"}"
                          ${field.type === "number" || field.type === "tel" ? 'inputMode="decimal"' : ""}
                          value={(field().state.value as string | undefined) ?? ""}
                          onBlur={field().handleBlur}
                          onInput={(e) => field().handleChange(e.currentTarget.value${field.type === "number" || field.type === "tel" ? "AsNumber" : ""})}
                          aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                        />
                      </field.Field>
                      ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                      <field.FieldError />
                    </field.FieldSet>
                  )}
              </${fieldPrefix}.AppField>
              `;
		case "OTP":
			return `
       <${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
          {(field) => (
            <field.FieldSet class="w-full">
              <field.Field>
                ${field.label && `<field.FieldLabel for={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                <OTPField
                  maxLength={${field.maxLength ?? 6}}
                  value={(field().state.value as string | undefined) ?? ""}
                  onValueChange={(value) => field().handleChange(value)}
                  aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                >
                  <OTPFieldGroup>
                    <OTPFieldSlot index={0} />
                    <OTPFieldSlot index={1} />
                    <OTPFieldSlot index={2} />
                  </OTPFieldGroup>
                  <OTPFieldSeparator />
                  <OTPFieldGroup>
                    <OTPFieldSlot index={3} />
                    <OTPFieldSlot index={4} />
                    <OTPFieldSlot index={5} />
                  </OTPFieldGroup>
                  <OTPFieldInput />
                </OTPField>
              </field.Field>
              ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
              <field.FieldError />
            </field.FieldSet>
          )}
        </${fieldPrefix}.AppField>
        `;
		case "Textarea":
			return `
        <${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
          {(field) => (
            <field.FieldSet class="w-full">
              <field.Field>
                ${field.label && `<field.FieldLabel for={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                <Textarea
                  placeholder="${field.placeholder ?? ""}"
                  required={${field.required ?? false}}
                  disabled={${field.disabled ?? false}}
                  value={(field().state.value as string | undefined) ?? ""}
                  name={${formatFieldName(field.name)}}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                  class="resize-none"
                  aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                />
                ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
              </field.Field>
              <field.FieldError />
            </field.FieldSet>
          )}
        </${fieldPrefix}.AppField>
        `;
		case "Password":
			return `
       <${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
          {(field) => {
            const [showPassword, setShowPassword] = createSignal(false);
            return (
            <field.FieldSet class="w-full">
              <field.FieldLabel for={${formatFieldName(field.name)}}>
                ${field.label} ${field.required ? "*" : ""}
              </field.FieldLabel>
              <field.Field orientation="horizontal">
                <InputGroup>
                  <InputGroupInput
                    id={${formatFieldName(field.name)}}
                    name={${formatFieldName(field.name)}}
                    placeholder="${field.placeholder ?? ""}"
                    type={showPassword() ? "text" : "password"}
                    value={(field().state.value as string | undefined) ?? ""}
                    onBlur={field().handleBlur}
                    onInput={(e) => field().handleChange(e.currentTarget.value)}
                    aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                  />
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      class="cursor-pointer flex items-center justify-center p-1  rounded transition-colors"
                      onClick={() => setShowPassword(!showPassword())}
                    >
                      <Show when={!showPassword()}>
                        <Eye class="size-3" />
                      </Show>
                      <Show when={showPassword()}>
                        <EyeOff class="size-3" />
                      </Show>
                    </button>
                  </InputGroupAddon>
                </InputGroup>
              </field.Field>
              ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
              <field.FieldError />
            </field.FieldSet>
          )}}
        </${fieldPrefix}.AppField>
        `;
		case "Checkbox":
			return `<${fieldPrefix}.AppField name={${formatFieldName(field.name)}}  >
          {(field) => (
            <field.FieldSet>
              <field.Field orientation="horizontal">
                <Checkbox
                  checked={Boolean(field().state.value)}
                  onChange={(checked) =>
											field().handleChange(checked as boolean)
										}
                  disabled={${field.disabled ?? false}}
                  aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                >
                  <CheckboxInput />
                  <CheckboxControl />
                </Checkbox>
                <field.FieldContent>
                  <field.FieldLabel
                    class="space-y-1 leading-none"
                    for={${formatFieldName(field.name)}}
                  >
                    ${field.label ?? ""} ${field.required ? "*" : ""}
                  </field.FieldLabel>
                  ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                  <field.FieldError />
                </field.FieldContent>
              </field.Field>
            </field.FieldSet>
          )}
        </${fieldPrefix}.AppField>
        `;
		case "DatePicker":
			return `
      <${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
        {(field) => {
          const dateValue = field().state.value as string;
          const date = dateValue ? new Date(dateValue) : undefined;
          return (
            <field.FieldSet class="flex flex-col w-full">
              <field.Field>
                ${field.label && `<field.FieldLabel for={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                <Popover>
                  <PopoverTrigger
                    as="button"
                    disabled={${field.disabled ?? false}}
                    aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                    class={cx(
                      "w-full justify-start text-start font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <Button
                      variant="outline"
                      class={cx(
                        "w-full justify-start text-start font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon class="mr-2 size-4" />
                      {date ? (
                        formatDate(date)
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-fit p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      classNames={{
                        root: 'w-fit',
                      }}
                      onSelect={(newDate) => {
                        const dateValue = newDate instanceof Date ? newDate : undefined;
                        field().handleChange(
                          dateValue?.toISOString() ?? "",
                        );
                      }}
                      aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                    />
                  </PopoverContent>
                </Popover>
                ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                <field.FieldError />
              </field.Field>
            </field.FieldSet>
          );
        }}
      </${fieldPrefix}.AppField>
    `;
		case "MultiSelect":
			return `
           <${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
              {(field) => {
              const options = ${
								field.options
									? `[${field.options.map((opt) => `{label: "${opt.label}", value: "${opt.value}"}`).join(", ")}]`
									: `[
                      { value: '1', label: 'Option 1' },
                      { value: '2', label: 'Option 2' },
                      { value: '3', label: 'Option 3' },
                    ]`
							}
              const currentValue = (field().state.value as string[]) || [];
              return (
                <field.FieldSet class="w-full">
                  <field.Field>
                    ${field.label && `<field.FieldLabel for={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                    <MultiSelect
                      value={currentValue}
                      onValueChange={(values) => {
                        field().handleChange(values);
                        field().handleBlur();
                      }}
                      sameWidth={true}
                      maxCount={${field.maxCount ?? 5}}
                    >
                      <MultiSelectTrigger>
                        <MultiSelectValue
                          placeholder="${field.placeholder === "" ? "Select frameworks..." : field.placeholder}"
                          maxDisplay={3}
                          maxItemLength={15}
                        />
                      </MultiSelectTrigger>
                      <MultiSelectContent>
                        <MultiSelectList>
                          <For each={options}>
                            {({ label, value }) => (
                              <MultiSelectItem
                                value={value}
                                label={label}
                              >
                                {label}
                              </MultiSelectItem>
                            )}
                          </For>
                        </MultiSelectList>
                      </MultiSelectContent>
                    </MultiSelect>
                    ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                    <field.FieldError />
                  </field.Field>
                </field.FieldSet>
              )}}
            </${fieldPrefix}.AppField>
            `;
		case "Select":
			return `
        <${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
          {(field) => {
          const options = ${
						field.options
							? `[${field.options.map((opt) => `{label: "${opt.label}", value: "${opt.value}"}`).join(", ")}]`
							: `[
            { value: 'option-1', label: 'Option 1' },
            { value: 'option-2', label: 'Option 2' },
          ]`
					}
          return (
            <field.FieldSet class="w-full">
              <field.Field>
                ${field.label && `<field.FieldLabel class="flex justify-between items-center" for={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
              </field.Field>
              <Select
                name={${formatFieldName(field.name)}}
                value={options.find(
                  (opt) => opt.value === field().state.value,
                )}
                onChange={(selected) =>
                  field().handleChange(selected?.value ?? "")
                }
                defaultValue={options.find(
                  (opt) => opt.value === field().state.value,
                )}
                disabled={${field.disabled ?? false}}
                validationState={
                  !!field().state.meta.errors.length &&
                  field().state.meta.isTouched
                    ? "invalid"
                    : "valid"
                }
                options={options}
                optionValue="value"
                optionTextValue="label"
                placeholder="${field.placeholder === "" ? "Select item" : field.placeholder}"
                itemComponent={(props) => (
                  <SelectItem item={props.item}>
                    {props.item.rawValue.label}
                  </SelectItem>
                )}
              >
                <field.Field>
                  <SelectTrigger class="w-full">
                    <SelectValue<typeof options[number]>>
                      {(state) => state.selectedOption()?.label ?? "${field.placeholder === "" ? "Select item" : field.placeholder}"}
                    </SelectValue>
                  </SelectTrigger>
                </field.Field>
                <SelectContent />
              </Select>
              ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
              <field.FieldError />
            </field.FieldSet>
          )}}
        </${fieldPrefix}.AppField>
        `;
		case "Slider":
			return `
            <${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
              {(field) => {
                const min = ${field?.min ?? 0};
                const max = ${field?.max ?? 100};
                const step = ${field?.step ?? 1};
                const currentValue = () => field().state.value;
                return (
                  <field.FieldSet class="w-full">
                    <field.Field>
                      <Slider
                        name={${formatFieldName(field.name)}}
                        minValue={min}
                        maxValue={max}
                        disabled={${field.disabled ?? false}}
                        step={step}
                        defaultValue={[currentValue()]}
                        value={[currentValue()]}
                        getValueLabel={(params) => \`\${params.values[0] || min} / \${max}\`}
                        validationState={
                          !!field().state.meta.errors.length &&
                          field().state.meta.isTouched
                            ? "invalid"
                            : "valid"
                        }
                        onChange={(newValue) => field().handleChange(newValue[0])}
                        onBlur={() => field().handleBlur()}
                      >
                        <SliderGroup>
                          <SliderLabel>${field.label ?? "Range"}</SliderLabel>
                          <SliderValueLabel />
                        </SliderGroup>
                        <SliderTrack>
                          <SliderFill />
                          <SliderThumb />
                        </SliderTrack>
                      </Slider>
                    </field.Field>
                    <field.FieldDescription class="py-1">
                      ${field.description ?? ""}
                    </field.FieldDescription>
                    <field.FieldError />
                  </field.FieldSet>
                );
              }}
            </${fieldPrefix}.AppField>
            `;
		case "Switch":
			return `
            <${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
              {(field) => (
                <field.FieldSet class="flex flex-col p-3 justify-center w-full border rounded">
                  <field.Field orientation="horizontal">
                    <field.FieldContent>
                      <field.FieldLabel for={${formatFieldName(field.name)}}>
                        ${field.label}
                      </field.FieldLabel>
                      ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                    </field.FieldContent>
                    <Switch
                      name={${formatFieldName(field.name)}}
                      checked={Boolean(field().state.value)}
                      onChange={(checked) => {
                        field().handleChange(checked);
                        field().handleBlur();
                      }}
                      disabled={${field.disabled ?? false}}
                      aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                    >
                      <SwitchInput />
                      <SwitchControl>
                        <SwitchThumb />
                      </SwitchControl>
                    </Switch>
                  </field.Field>
                </field.FieldSet>
              )}
            </${fieldPrefix}.AppField>
            `;
		case "RadioGroup":
			return `<${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
              {(field) => {
                const options = ${
									field.options
										? `[${field.options.map((opt) => `{label: "${opt.label}", value: "${opt.value}"}`).join(", ")}]`
										: `[
                  { value: 'option-1', label: 'Option 1' },
                  { value: 'option-2', label: 'Option 2' },
                  { value: 'option-3', label: 'Option 3' },
                ]`
								}
              return (
                <field.FieldSet class="flex flex-col gap-2 w-full py-1">
                  <field.FieldLabel class="mt-0" for={${formatFieldName(field.name)}}>
                    ${field?.label} ${field.required ? "*" : ""}
                  </field.FieldLabel>
                  ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                  <field.Field>
                    <RadioGroup
                      onChange={field().handleChange}
                      name={${formatFieldName(field.name)}}
                      value={(field().state.value as string | undefined) ?? ""}
                      disabled={${field.disabled ?? false}}
                      validationState={
                        !!field().state.meta.errors.length &&
                        field().state.meta.isTouched
                          ? "invalid"
                          : "valid"
                      }
                    >
                      <For each={options}>
                        {({ label, value }) => (
                          <RadioGroupItem value={value} class="flex items-center gap-x-2">
                            <RadioGroupItemInput />
                            <RadioGroupItemControl>
                              <RadioGroupItemIndicator />
                            </RadioGroupItemControl>
                            <RadioGroupItemLabel>{label}</RadioGroupItemLabel>
                          </RadioGroupItem>
                        )}
                      </For>
                    </RadioGroup>
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}}
            </${fieldPrefix}.AppField>
            `;
		case "ToggleGroup":
			return `<${fieldPrefix}.AppField name={${formatFieldName(field.name)}} >
              {(field) => {
              const options = ${
								field.options
									? `[${field.options.map((opt) => `{label: "${opt.label}", value: "${opt.value}"}`).join(", ")}]`
									: `[
                     { value: 'monday', label: 'Mon' },
                     { value: 'tuesday', label: 'Tue' },
                     { value: 'wednesday', label: 'Wed' },
                     { value: 'thursday', label: 'Thu' },
                     { value: 'friday', label: 'Fri' },
                     { value: 'saturday', label: 'Sat' },
                     { value: 'sunday', label: 'Sun' },
                  ]`
							}
            const currentValue = (field().state.value as string[]) || [];
            return (
              <field.FieldSet class="flex flex-col gap-2 w-full py-1">
                <field.Field>
                  <field.FieldLabel class="mt-0" for={${formatFieldName(field.name)}}>
                    ${field?.label} ${field.required ? "*" : ""}
                  </field.FieldLabel>
                  ${
										field.type === "single"
											? `
                    <ToggleGroup
                      variant="outline"
                      value={currentValue}
                      onChange={(value) => {
                        const newValue = Array.isArray(value) ? value : value ? [value] : [];
                        field().handleChange(newValue as string[]);
                      }}
                      class="flex justify-start items-center w-full"
                      aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                    >
                      <For each={options}>
                        {({ label, value }) => (
                          <ToggleGroupItem
                            name={${formatFieldName(field.name)}}
                            value={value}
                            disabled={${field.disabled ?? false}}
                            class="flex items-center gap-x-2 px-1"
                          >
                            {label}
                          </ToggleGroupItem>
                        )}
                      </For>
                    </ToggleGroup>
                  `
											: `
                    <ToggleGroup
                      multiple
                      variant="outline"
                      value={currentValue}
                      onChange={(value) => {
                        const newValue = Array.isArray(value) ? value : value ? [value] : [];
                        field().handleChange(newValue as string[]);
                      }}
                      class="flex justify-start items-center w-full"
                      aria-invalid={!!field().state.meta.errors.length && field().state.meta.isTouched}
                    >
                      <For each={options}>
                        {({ label, value }) => (
                          <ToggleGroupItem
                            name={${formatFieldName(field.name)}}
                            value={value}
                            disabled={${field.disabled ?? false}}
                            class="flex items-center gap-x-2 px-1"
                          >
                            {label}
                          </ToggleGroupItem>
                        )}
                      </For>
                    </ToggleGroup>
                  `
									}
                </field.Field>
                ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                <field.FieldError />
              </field.FieldSet>
            )
              }}
            </${fieldPrefix}.AppField>`;
		case "H1":
			return `<h1 class="text-3xl font-bold">${field.content ?? ""}</h1>`;
		case "H2":
			return `<h2 class="text-2xl font-bold">${field.content ?? ""}</h2>`;
		case "H3":
			return `<h3 class="text-xl font-bold">${field.content ?? ""}</h3>`;
		case "Separator":
			return `<field.FieldSeparator />`;
		case "FieldLegend":
			return `<field.FieldLegend>${field.content}</field.FieldLegend>`;
		case "FieldDescription":
			return `<field.FieldDescription>${field.content}</field.FieldDescription>`;
		default:
			return null;
	}
};

