export type JsonData = Record<
	string,
	string | number | boolean | null | undefined | object | unknown[]
>;

export interface ColumnConfig {
	id: string;
	accessor: string;
	label: string;
	type: "string" | "number" | "boolean" | "date" | "object" | "array" | "enum";
	order: number;
	filterable?: boolean;
	hasFacetedFilter?: boolean;
	options?: { label: string; value: string }[];
	optionsMode?: "auto" | "custom";
	possibleValues?: string[];
}

export interface DataRow {
	[key: string]:
		| string
		| number
		| boolean
		| null
		| undefined
		| object
		| unknown[];
}
