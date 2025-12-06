import { extractImportDependencies, generateImports } from '@/lib/form-code-generators/react/generate-imports';
import { describe, expect, it } from 'vitest';

describe('extractImportDependencies', () => {
	it('should extract registry dependencies and dependencies correctly', () => {
		const importSet = new Set([
			'import { FieldDescription, FieldLegend } from "@/components/ui/field"',
			'import { Button } from "@/components/ui/button"',
			'import { toast } from "sonner"',
			'import { format } from "date-fns"',
			'import { useForm } from "@tanstack-form/react"',
			'import { Calendar as CalendarIcon } from "lucide-react"',
		]);

		const result = extractImportDependencies(importSet);

		expect(result.registryDependencies).toEqual(['field', 'button']);
		expect(result.dependencies).toEqual(['sonner', 'date-fns', '@tanstack-form/react','lucide-react',]);
	});

	it('should handle empty import set', () => {
		const importSet = new Set<string>();

		const result = extractImportDependencies(importSet);

		expect(result.registryDependencies).toEqual([]);
		expect(result.dependencies).toEqual([]);
	});

	it('should handle imports without from clause', () => {
		const importSet = new Set([
			'import React from "react"',
			'import { useState } from "react"',
		]);

		const result = extractImportDependencies(importSet);

		expect(result.registryDependencies).toEqual([]);
		expect(result.dependencies).toEqual(['react']);
	});
});

describe('generateImports', () => {
	it('should generate correct imports for field components with Separator', () => {
		const formElements = [
			{ id: '1', fieldType: 'FieldDescription', name: 'desc', static: true, content: 'test' },
			{ id: '2', fieldType: 'Separator', name: 'sep', static: true },
		] as any;
		const validationSchema = 'zod';
		const isMS = false;
		const schemaName = 'testSchema';

		const result = generateImports(formElements, validationSchema, isMS, schemaName);

		expect(result).toContain('import { FieldDescription, FieldLegend, FieldSeparator } from "@/components/ui/field"');
		expect(result).toContain('import * as z from "zod"');
	});

	it('should generate correct imports for field components without Separator', () => {
		const formElements = [
			{ id: '1', fieldType: 'FieldDescription', name: 'desc', static: true, content: 'test' },
		] as any;
		const validationSchema = 'zod';
		const isMS = false;
		const schemaName = 'testSchema';

		const result = generateImports(formElements, validationSchema, isMS, schemaName);

		expect(result).toContain('import { FieldDescription, FieldLegend } from "@/components/ui/field"');
		expect(result).not.toContain('FieldSeparator');
		expect(result).toContain('import * as z from "zod"');
	});

	it('should generate correct imports for Separator only', () => {
		const formElements = [
			{ id: '1', fieldType: 'Separator', name: 'sep', static: true },
		] as any;
		const validationSchema = 'zod';
		const isMS = false;
		const schemaName = 'testSchema';

		const result = generateImports(formElements, validationSchema, isMS, schemaName);

		expect(result).toContain('import { FieldSeparator } from "@/components/ui/field"');
		expect(result).toContain('import * as z from "zod"');
	});
});