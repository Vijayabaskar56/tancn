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
                    <field.FieldSet className="w-full">
                      <field.Field>
                        ${field.label && `<field.FieldLabel htmlFor={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                        <Input
                          name={${formatFieldName(field.name)}}
                          placeholder="${field.placeholder ?? ""}"
                          type="${field.type ?? "text"}"
                          ${field.type === "number" || field.type === "tel" ? 'inputMode="decimal"' : ""}
                          value={(field.state.value as string | undefined) ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value${field.type === "number" || field.type === "tel" ? "AsNumber" : ""})}
                          aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
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
            <field.FieldSet className="w-full">
              <field.Field>
                ${field.label && `<field.FieldLabel htmlFor={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                <InputOTP
                  maxLength={${field.maxLength ?? 6}}
                  name={${formatFieldName(field.name)}}
                  value={(field.state.value as string | undefined) ?? ""}
                  onChange={field.handleChange}
                  required={${field.required ?? false}}
                  disabled={${field.disabled ?? false}}
                  aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
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
            <field.FieldSet className="w-full">
              <field.Field>
                ${field.label && `<field.FieldLabel htmlFor={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                <Textarea
                  placeholder="${field.placeholder ?? ""}"
                  required={${field.required ?? false}}
                  disabled={${field.disabled ?? false}}
                  value={(field.state.value as string | undefined) ?? ""}
                  name={${formatFieldName(field.name)}}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="resize-none"
                  aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
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
          {(field) => (
            <field.FieldSet className="w-full">
              <field.FieldLabel htmlFor={${formatFieldName(field.name)}}>
                ${field.label} ${field.required ? "*" : ""}
              </field.FieldLabel>
              <field.Field orientation="horizontal">
                <field.InputGroup>
                  <field.InputGroupInput
                    id={${formatFieldName(field.name)}}
                    name={${formatFieldName(field.name)}}
                    placeholder="${field.placeholder ?? ""}"
                    type="password"
                    value={(field.state.value as string | undefined) ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                  />
                  <field.InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      className="cursor-pointer flex items-center justify-center p-1 hover:text-gray-100 rounded transition-colors"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.parentElement?.querySelector('input') as HTMLInputElement;
                        if (input) {
                          input.type = input.type === "password" ? "text" : "password";
                          const button = e.currentTarget;
                          button.setAttribute('data-show', input.type === "text" ? "true" : "false");
                        }
                      }}
                      data-show="false"
                    >
                      <EyeIcon className="size-3 data-[show=true]:hidden" />
                      <EyeOffIcon className="size-3 hidden data-[show=true]:block" />
                    </button>
                  </field.InputGroupAddon>
                </field.InputGroup>
              </field.Field>
              ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
              <field.FieldError />
            </field.FieldSet>
          )}
        </${fieldPrefix}.AppField>
        `;
		case "Checkbox":
			return `<${fieldPrefix}.AppField name={${formatFieldName(field.name)}}  >
          {(field) => (
            <field.FieldSet>
              <field.Field orientation="horizontal">
                <Checkbox
                  checked={Boolean(field.state.value)}
                  onCheckedChange={(checked) =>
											field.handleChange(checked as boolean)
										}
                  disabled={${field.disabled ?? false}}
                  aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                />
                <field.FieldContent>
                  <field.FieldLabel
                    className="space-y-1 leading-none"
                    htmlFor={${formatFieldName(field.name)}}
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
          const date = field.state.value;
          return (
            <field.FieldSet className="flex flex-col w-full">
              <field.Field>
                ${field.label && `<field.FieldLabel htmlFor={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                <Popover>
                  <PopoverTrigger asChild disabled={${field.disabled ?? false}} aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-start font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {date ? (
                        format(date as unknown as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.state.value as unknown as Date | undefined}
                      onSelect={(newDate) => {
                        field.handleChange(newDate?.toISOString() as string);
                      }}
                      aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
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
              return (
                <field.FieldSet className="w-full">
                  <field.Field>
                    ${field.label && `<field.FieldLabel htmlFor={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
                    <MultiSelect
                      disabled={${field.disabled ?? false}}
                      onValueChange={field.handleChange}
                      aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                    >
                      <MultiSelectTrigger aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}>
                        <MultiSelectValue
                          placeholder="${field.placeholder === "" ? "Select item" : field.placeholder}"
                        />
                      </MultiSelectTrigger>
                      <MultiSelectContent>
                        <MultiSelectList>
                          {options.map(({ label, value }) => (
                            <MultiSelectItem key={value} value={value}>
                              {label}
                            </MultiSelectItem>
                          ))}
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
            { value: 'option-3', label: 'Option 3' },
          ]`
					}
          return (
            <field.FieldSet className="w-full">
              <field.Field>
                ${field.label && `<field.FieldLabel className="flex justify-between items-center" htmlFor={${formatFieldName(field.name)}}>${field.label} ${field.required ? "*" : ""}</field.FieldLabel>`}
              </field.Field>
              <Select
                name={${formatFieldName(field.name)}}
                value={(field.state.value as string | undefined) ?? ""}
                onValueChange={field.handleChange}
                defaultValue={String(field?.state.value ?? "")}
                disabled={${field.disabled ?? false}}
                aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
              >
                <field.Field>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder="${field.placeholder === "" ? "Select item" : field.placeholder}"
                    />
                  </SelectTrigger>
                </field.Field>
                <SelectContent>
                  {options.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
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
                const defaultSliderValue = ${field.defaultValue ?? "min"};
                const currentValue = field.state.value;
                const sliderValue = Array.isArray(currentValue)
                  ? currentValue
                  : [currentValue || defaultSliderValue];

                return (
                  <field.FieldSet className="w-full">
                    <field.Field>
                      <field.FieldLabel className="flex justify-between items-center" htmlFor={${formatFieldName(field.name)}}>
                        ${field.label ?? ""} ${field.required ? "*" : ""}
                        <span className="text-sm text-muted-foreground">
                          {sliderValue[0] || min} / {max}
                        </span>
                      </field.FieldLabel>
                      <Slider
                        name={${formatFieldName(field.name)}}
                        min={min}
                        max={max}
                        disabled={${field.disabled ?? false}}
                        step={step}
                        value={sliderValue}
                        aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                        onValueChange={(newValue) => {
                          field.handleChange(newValue[0]);
                          field.handleBlur();
                        }}
                      />
                    </field.Field>
                    <field.FieldDescription className="py-1">
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
                <field.FieldSet className="flex flex-col p-3 justify-center w-full border rounded">
                  <field.Field orientation="horizontal">
                    <field.FieldContent>
                      <field.FieldLabel htmlFor={${formatFieldName(field.name)}}>
                        ${field.label}
                      </field.FieldLabel>
                      ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                    </field.FieldContent>
                    <Switch
                      name={${formatFieldName(field.name)}}
                      checked={Boolean(field.state.value)}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked);
                        field.handleBlur();
                      }}
                      disabled={${field.disabled ?? false}}
                      aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                    />
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
                <field.FieldSet className="flex flex-col gap-2 w-full py-1">
                  <field.FieldLabel className="mt-0" htmlFor={${formatFieldName(field.name)}}>
                    ${field?.label} ${field.required ? "*" : ""}
                  </field.FieldLabel>
                  ${field.description ? `<field.FieldDescription>${field.description}</field.FieldDescription>` : ""}
                  <field.Field>
                    <RadioGroup
                      onValueChange={field.handleChange}
                      name={${formatFieldName(field.name)}}
                      value={(field.state.value as string | undefined) ?? ""}
                      disabled={${field.disabled ?? false}}
                      aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                    >
                      {options.map(({ label, value }) => (
                        <div key={value} className="flex items-center gap-x-2">
                          <RadioGroupItem
                            value={value}
                            id={value}
                            required={${field.required ?? false}}
                          />
                          <Label htmlFor={value}>{label}</Label>
                        </div>
                      ))}
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
            return (
              <field.FieldSet className="flex flex-col gap-2 w-full py-1">
                <field.Field>
                  <field.FieldLabel className="mt-0" htmlFor={${formatFieldName(field.name)}}>
                    ${field?.label} ${field.required ? "*" : ""}
                  </field.FieldLabel>
                  ${
										field.type === "single"
											? `
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      onValueChange={field.handleChange}
                      defaultValue={${field.defaultValue}}
                      className="flex justify-start items-center w-full"
                      aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                    >
                      {options.map(({ label, value }) => (
                        <ToggleGroupItem
                          name={${formatFieldName(field.name)}}
                          value={value}
                          key={value}
                          disabled={${field.disabled ?? false}}
                          className="flex items-center gap-x-2 px-1"
                        >
                          {label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  `
											: `
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      onValueChange={field.handleChange}
                      className="flex justify-start items-center w-full"
                      aria-invalid={!!field.state.meta.errors.length && field.state.meta.isTouched}
                    >
                      {options.map(({ label, value }) => (
                        <ToggleGroupItem
                          name={${formatFieldName(field.name)}}
                          value={value}
                          key={value}
                          disabled={${field.disabled ?? false}}
                          className="flex items-center gap-x-2 px-1"
                        >
                          {label}
                        </ToggleGroupItem>
                      ))}
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
			return `<h1 className="text-3xl font-bold">${field.content ?? ""}</h1>`;
		case "H2":
			return `<h2 className="text-2xl font-bold">${field.content ?? ""}</h2>`;
		case "H3":
			return `<h3 className="text-xl font-bold">${field.content ?? ""}</h3>`;
		case "Separator":
			return `<FieldSeparator />;`;
		case "FieldLegend":
			return `<FieldLegend>${field.content}</FieldLegend>`;
		case "FieldDescription":
			return `<FieldDescription>${field.content}</FieldDescription>`;
		default:
			return null;
	}
};
