import { Sparkles, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import {
	setFormElements,
	setFormName,
	setIsMS,
} from "@/services/form-builder.service";
import { clientTools } from "@tanstack/ai-client";
import { generateFormDef } from "@/lib/ai/form-tools";
import { v4 as uuid } from "uuid";

import { useState } from "react";

export function FormGenerator() {
	const [input, setInput] = useState("");
	const [formMetadata, setFormMetadata] = useState<{
		title?: string;
		description?: string;
	}>({});

	// Normalize field to match Valibot schema requirements
	const normalizeField = (field: any): any => {
		const normalized = { ...field };

		// Password fieldType requires type: "password"
		if (normalized.fieldType === "Password" && !normalized.type) {
			normalized.type = "password";
		}

		// Static elements need static: true
		if (
			[
				"H1",
				"H2",
				"H3",
				"Separator",
				"FieldDescription",
				"FieldLegend",
			].includes(normalized.fieldType)
		) {
			normalized.static = true;
		}

		// Select/RadioGroup/ToggleGroup/MultiSelect need options array
		if (
			["Select", "RadioGroup", "ToggleGroup", "MultiSelect"].includes(
				normalized.fieldType,
			)
		) {
			if (!normalized.options) {
				normalized.options = [];
			}
		}

		// Select/MultiSelect need placeholder
		if (
			["Select", "MultiSelect"].includes(normalized.fieldType) &&
			!normalized.placeholder
		) {
			normalized.placeholder = `Select ${normalized.label || normalized.name}...`;
		}

		// FormArray needs entries array initialized
		if (normalized.fieldType === "FormArray") {
			if (!normalized.entries) {
				normalized.entries = [];
			}
			if (!normalized.arrayField) {
				normalized.arrayField = [];
			}
		}

		return normalized;
	};

	// Helper to ensure all elements have IDs and are normalized
	const ensureIds = (elements: any[]): any[] => {
		return elements.map((el: any) => {
			if (Array.isArray(el)) {
				return ensureIds(el);
			}
			const normalized = normalizeField(el);
			const withId = { ...normalized, id: normalized.id || uuid() };
			// Handle FormArray fields
			if (withId.fieldType === "FormArray" && withId.arrayField) {
				withId.arrayField = ensureIds(withId.arrayField);
				withId.entries = (withId.entries || []).map((entry: any) => ({
					id: entry.id || uuid(),
					fields: ensureIds(entry.fields || []),
				}));
			}
			return withId;
		});
	};

	// Transform consecutive grouped fields into nested arrays for side-by-side layout
	const groupFields = (elements: any[]): any[] => {
		const result: any[] = [];
		let currentGroup: any[] = [];

		for (const el of elements) {
			// Skip already nested arrays (shouldn't happen from AI, but be safe)
			if (Array.isArray(el)) {
				// Flush current group first
				if (currentGroup.length > 0) {
					result.push(
						currentGroup.length === 1 ? currentGroup[0] : currentGroup,
					);
					currentGroup = [];
				}
				result.push(el);
				continue;
			}

			if (el.grouped) {
				// Remove the grouped property (it's just a hint for transformation)
				const { grouped: _, ...fieldWithoutGrouped } = el;
				currentGroup.push(fieldWithoutGrouped);
			} else {
				// Flush current group
				if (currentGroup.length > 0) {
					result.push(
						currentGroup.length === 1 ? currentGroup[0] : currentGroup,
					);
					currentGroup = [];
				}
				result.push(el);
			}
		}

		// Flush remaining group
		if (currentGroup.length > 0) {
			result.push(currentGroup.length === 1 ? currentGroup[0] : currentGroup);
		}

		return result;
	};

	// Process elements: ensure IDs, then group consecutive grouped fields
	const processElements = (elements: any[]): any[] => {
		const withIds = ensureIds(elements);
		return groupFields(withIds);
	};

	// Client tool that updates form state when AI calls it with generated form data
	const generateFormTool = generateFormDef.client(
		({ title, description, isMultiStep, formElements, steps }) => {
			console.log("Client: generate_form called with:", {
				title,
				description,
				isMultiStep,
			});

			try {
				let fieldCount = 0;

				if (isMultiStep && steps && steps.length > 0) {
					// Multi-step form: convert steps to form elements with stepFields
					const stepsWithIds = steps.map((step: any) => ({
						id: step.id || uuid(),
						stepFields: processElements(step.stepFields || []),
					}));

					// Set multi-step mode first
					setIsMS(true);
					setFormElements(stepsWithIds as any);
					fieldCount = steps.reduce(
						(acc: number, step: any) => acc + (step.stepFields?.length || 0),
						0,
					);
				} else if (formElements && formElements.length > 0) {
					// Single-page form
					const elementsWithIds = processElements(formElements);
					console.log(
						"Setting form elements:",
						JSON.stringify(elementsWithIds, null, 2),
					);

					// setFormElements also sets isMS internally based on the structure
					setFormElements(elementsWithIds as any);
					fieldCount = formElements.length;
				}

				// Update form metadata
				setFormMetadata({ title, description });
				if (title) {
					setFormName(title.toLowerCase().replace(/\s+/g, "_"));
				}

				// Return success
				return {
					success: true,
					message: `Form "${title}" generated successfully${isMultiStep ? ` with ${steps?.length || 0} steps` : ""}`,
					fieldCount,
				};
			} catch (error) {
				console.error("Error updating form:", error);
				return {
					success: false,
					message: `Error: ${error}`,
					fieldCount: 0,
				};
			}
		},
	);

	const { messages, sendMessage, isLoading, error } = useChat({
		connection: fetchServerSentEvents("/api/ai"),
		tools: clientTools(generateFormTool),
	});
	console.log(error);
	// No useEffect needed - the client tool handles the action directly when called

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim() && !isLoading) {
			sendMessage(input);
			setInput("");
		}
	};
	return (
		<div className="flex flex-col h-full">
			<div className="mb-4 p-4 border-b">
				<h3 className="text-lg font-semibold text-primary flex items-center gap-2">
					{formMetadata.title || "Generate"}
					<Badge variant="secondary">Beta</Badge>
				</h3>
				<p className="text-sm text-muted-foreground">
					{formMetadata.description || "Generate forms with AI"}
				</p>
			</div>

			<ScrollArea className="flex-1 min-h-0">
				<div className="p-4 space-y-6">
					{messages.length === 0 ? (
						<>
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">
									What can I help you build?
								</h2>
							</div>

							<div className="space-y-2">
								{[
									"Contact form with name, email, and message",
									"Job application form with resume upload",
									"Feedback survey with rating scale",
									"Event registration form with payment details",
									"Login form with email and password",
								].map((suggestion, i) => (
									<Button
										key={i}
										variant="ghost"
										onClick={() => sendMessage(suggestion)}
										className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
									>
										{suggestion}
									</Button>
								))}
							</div>
						</>
					) : (
						<div className="space-y-4">
							{messages.map((message) => (
								<div
									key={message.id}
									className={`p-3 rounded-lg ${
										message.role === "assistant"
											? "bg-muted/50"
											: "bg-primary/10"
									}`}
								>
									<div className="font-semibold text-sm mb-1 text-muted-foreground">
										{message.role === "assistant" ? "Assistant" : "You"}
									</div>
									<div className="space-y-2">
										{message.parts.map((part, idx) => {
											if (part.type === "text") {
												return (
													<div key={idx} className="text-sm">
														{part.content}
													</div>
												);
											}
											if (
												part.type === "tool-call" &&
												part.name === "generate_form"
											) {
												const output = part.output as {
													success?: boolean;
													fieldCount?: number;
													message?: string;
												};
												const fieldCount = output?.fieldCount || 0;
												const success = output?.success !== false;
												return (
													<div
														key={idx}
														className={`flex items-center gap-2 text-sm p-2 rounded-md ${
															success
																? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
																: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
														}`}
													>
														<Sparkles className="w-4 h-4" />
														<span>
															✓ Generated {fieldCount} form field
															{fieldCount !== 1 ? "s" : ""}
														</span>
													</div>
												);
											}
											return null;
										})}
									</div>
								</div>
							))}
							{isLoading && (
								<div className="p-3 rounded-lg bg-muted/50">
									<div className="font-semibold text-sm mb-1 text-muted-foreground">
										Assistant
									</div>
									<div className="text-sm text-muted-foreground animate-pulse">
										Thinking...
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</ScrollArea>

			<div className="p-4 border-t mt-auto">
				<form onSubmit={handleSubmit} className="relative">
					<Textarea
						placeholder="Describe your form..."
						className="min-h-[100px] resize-none pr-12 pb-12 bg-muted/50 border-none focus-visible:ring-1"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(e);
							}
						}}
					/>

					<div className="absolute bottom-3 left-3 flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 text-xs gap-1.5"
							onClick={() => window.location.reload()}
						>
							<Sparkles className="w-3 h-3" />
							New chat
						</Button>
						{/* <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
							<Image className="w-3 h-3" />
							Image
						</Button> */}
					</div>

					<Button
						type="submit"
						size="icon"
						disabled={isLoading || !input.trim()}
						className="absolute bottom-3 right-3 h-8 w-8 rounded-lg"
					>
						<Send className="w-4 h-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}
