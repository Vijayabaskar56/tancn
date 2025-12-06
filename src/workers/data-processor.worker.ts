// Web Worker for processing CSV/JSON data without blocking the main thread
// This worker handles parsing, validation, and column type detection

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

export interface Column {
	id: string;
	accessor: string;
	label: string;
	type: "string" | "number" | "boolean" | "date" | "object" | "array" | "enum" | "email" | "url" | "tel" | "time" | "datetime";
	order: number;
	possibleValues?: string[];
}

export interface WorkerRequest {
	type: "parse";
	data: {
		content: string;
		fileType: "csv" | "json" | "auto";
	};
}

export interface WorkerResponse {
	type: "success" | "error";
	data?: DataRow[];
	columns?: Column[];
	error?: string;
}

// Utility: Parse CSV text to array of objects
const parseCSV = (csvText: string): DataRow[] => {
	const lines = csvText.trim().split("\n");
	if (lines.length < 2) {
		throw new Error("CSV must have at least headers and one data row");
	}

	const headers = lines[0].split(",").map((h) => h.trim());
	const data = lines.slice(1).map((line) => {
		const values = line.split(",");
		const obj: DataRow = {};
		headers.forEach((header, index) => {
			obj[header] = values[index]?.trim() || "";
		});
		return obj;
	});
	return data;
};

// Utility: Parse JSON text to array of objects
const parseJSON = (jsonText: string): DataRow[] => {
	const parsed = JSON.parse(jsonText);
	if (Array.isArray(parsed)) {
		return parsed;
	}
	if (typeof parsed === "object" && parsed !== null) {
		return [parsed];
	}
	return [];
};

// Utility: Detect column type from value
const detectColumnType = (
	value: string | number | boolean | null | undefined | object,
): "string" | "number" | "boolean" | "date" | "object" | "array" | "enum" | "email" | "url" | "tel" | "time" | "datetime" => {
	if (value === null || value === undefined) return "string";
	if (typeof value === "boolean") return "boolean";
	if (typeof value === "number") return "number";
	if (Array.isArray(value)) return "array";
	if (typeof value === "object") return "object";
	if (typeof value === "string") {
		const trimmed = value.trim();

		// Check if the string is a valid number (including integers and floats)
		if (trimmed !== "" && !Number.isNaN(Number(trimmed)) && Number.isFinite(Number(trimmed))) {
			return "number";
		}

		// Email pattern: basic email format with @ and domain
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (emailRegex.test(trimmed)) {
			return "email";
		}

		// URL pattern: http://, https://, or www.
		const urlRegex = /^(https?:\/\/|www\.)[^\s]+$/i;
		if (urlRegex.test(trimmed)) {
			return "url";
		}

		// Phone pattern: various phone formats with optional country code
		// Matches: +1-234-567-8900, (123) 456-7890, 123.456.7890, +12345678900, etc.
		const telRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
		if (telRegex.test(trimmed.replace(/\s/g, ''))) {
			return "tel";
		}

		// Time pattern: HH:MM or HH:MM:SS (24-hour or 12-hour with AM/PM)
		const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?(\s?[AaPp][Mm])?$/;
		if (timeRegex.test(trimmed)) {
			return "time";
		}

		// DateTime pattern: ISO 8601 with time component (e.g., 2023-12-01T10:30:00)
		const datetimeRegex = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(:\d{2})?(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/;
		if (datetimeRegex.test(trimmed) && !Number.isNaN(Date.parse(trimmed))) {
			return "datetime";
		}

		// Date pattern: YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY
		const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/;
		if (dateRegex.test(trimmed) && !Number.isNaN(Date.parse(trimmed))) {
			return "date";
		}
	}
	return "string";
};

// Utility: Detect columns from data array
const detectColumns = (data: DataRow[]): Column[] => {
	if (data.length === 0) return [];

	const firstRow = data[0];
	const detectedColumns: Column[] = [];

	Object.keys(firstRow).forEach((key, index) => {
		// Sample all rows for accurate type detection
		const sampleValues = data.map((row) => row[key]);
		const types = sampleValues.map(detectColumnType);
		let mostCommonType = types.reduce((a, b, _, arr) =>
			arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length
				? a
				: b,
		);

		let possibleValues: string[] | undefined;

		// If type is string, check if it has exactly 2 unique values (boolean-like)
		if (mostCommonType === "string") {
			const uniqueValues = [...new Set(sampleValues.map((v) => String(v)))];
			if (uniqueValues.length === 2) {
				mostCommonType = "boolean";
				possibleValues = uniqueValues;
			} else if (
				uniqueValues.length > 2 &&
				uniqueValues.length <= 10 &&
				sampleValues.length >= uniqueValues.length * 2
			) {
				// If we have 3-10 unique values and the field repeats (at least 2x more rows than unique values), classify as enum
				mostCommonType = "enum";
				possibleValues = uniqueValues;
			}
		}

		detectedColumns.push({
			id: key,
			accessor: key,
			label:
				key.charAt(0).toUpperCase() +
				key
					.slice(1)
					.replace(/([A-Z])/g, " $1")
					.trim(),
			type: mostCommonType,
			order: index,
			possibleValues,
		});
	});

	return detectedColumns.sort((a, b) => a.order - b.order);
};

// Main message handler
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
	const { type, data } = event.data;

	if (type === "parse") {
		try {
			const { content, fileType } = data;

			// Validate empty content
			if (!content || content.trim() === "") {
				self.postMessage({
					type: "error",
					error: "The content is empty",
				} as WorkerResponse);
				return;
			}

			let parsedData: DataRow[] = [];

			// Parse based on file type
			if (fileType === "json") {
				parsedData = parseJSON(content);
			} else if (fileType === "csv") {
				parsedData = parseCSV(content);
			} else {
				// Auto-detect: try JSON first, then CSV
				try {
					parsedData = parseJSON(content);
				} catch {
					parsedData = parseCSV(content);
				}
			}

			// Validate parsed data
			if (!Array.isArray(parsedData) || parsedData.length === 0) {
				self.postMessage({
					type: "error",
					error: "No valid data found in the file",
				} as WorkerResponse);
				return;
			}

			// Detect columns (this helps with validation)
			const columns = detectColumns(parsedData);
			if (columns.length === 0) {
				self.postMessage({
					type: "error",
					error: "Could not detect any columns from the data",
				} as WorkerResponse);
				return;
			}

			// Send success response
			self.postMessage({
				type: "success",
				data: parsedData,
				columns,
			} as WorkerResponse);
		} catch (error) {
			self.postMessage({
				type: "error",
				error:
					error instanceof Error
						? error.message
						: "Failed to parse data. Please ensure it's valid JSON or CSV.",
			} as WorkerResponse);
		}
	}
};
