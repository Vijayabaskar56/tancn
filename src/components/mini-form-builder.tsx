import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteIcon } from "@/components/ui/delete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/utils";
import { useForm } from "@tanstack/react-form";
import {
	Calendar,
	CheckSquare,
	ChevronDown,
	GripVertical,
	Heading1,
	List,
	Lock,
	Mail,
	RadioReceiver,
	Text,
	ToggleLeft,
	Type,
} from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

type FieldType =
	| "Input"
	| "Textarea"
	| "Checkbox"
	| "Select"
	| "Switch"
	| "Date Picker"
	| "Password"
	| "Email"
	| "Heading";

type FormElement = {
	id: string;
	type: FieldType;
	label: string;
	placeholder?: string;
	required?: boolean;
	options?: string[];
};

const availableFields: { type: FieldType; icon: any; label: string }[] = [
	{ type: "Checkbox", icon: CheckSquare, label: "Checkbox" },
	{ type: "Date Picker", icon: Calendar, label: "Date Picker" },
	{ type: "Input", icon: Type, label: "Input" },
	{ type: "Password", icon: Lock, label: "Password" },
	{ type: "Email", icon: Mail, label: "Email" },
	{ type: "Select", icon: List, label: "Select" },
	{ type: "Switch", icon: ToggleLeft, label: "Switch" },
	{ type: "Textarea", icon: Text, label: "Textarea" },
	{ type: "Heading", icon: Heading1, label: "Heading 1" },
];

const initialElements: FormElement[] = [
	{ id: "1", type: "Heading", label: "Contact us" },
	{
		id: "2",
		type: "Input",
		label: "Name",
		placeholder: "Enter your name",
		required: true,
	},
	{
		id: "3",
		type: "Email",
		label: "Email",
		placeholder: "Enter your email",
		required: true,
	},
	{
		id: "4",
		type: "Textarea",
		label: "Message",
		placeholder: "Enter your message",
		required: true,
	},
	{ id: "5", type: "Checkbox", label: "I agree to the terms and conditions" },
];

function FieldItem({
	item,
	onClick,
}: {
	item: { type: FieldType; icon: any; label: string };
	onClick: () => void;
}) {
	const Icon = item.icon;
	return (
		<button
			onClick={onClick}
			className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
		>
			<Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
			<span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
				{item.label}
			</span>
		</button>
	);
}

function EditorItem({
	element,
	onDelete,
}: { element: FormElement; onDelete: (id: string) => void }) {
	const dragControls = useDragControls();

	return (
		<Reorder.Item
			value={element}
			id={element.id}
			dragListener={false}
			dragControls={dragControls}
			className="relative group bg-card border border-border rounded-lg mb-2 overflow-hidden"
		>
			<div className="flex items-center p-3 gap-3">
				<div
					className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none text-muted-foreground hover:text-foreground transition-colors"
					onPointerDown={(e) => dragControls.start(e)}
				>
					<GripVertical size={16} />
				</div>
				<div className="flex-1 min-w-0">
					<div className="font-medium text-sm truncate">{element.label}</div>
					<div className="text-xs text-muted-foreground">Customize Field</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={() => onDelete(element.id)}
				>
					<DeleteIcon size={16} />
				</Button>
				<div className="opacity-0 group-hover:opacity-100 transition-opacity">
					<ChevronDown size={16} className="text-muted-foreground" />
				</div>
			</div>
		</Reorder.Item>
	);
}

function PreviewForm({ elements }: { elements: FormElement[] }) {
	// Generate Zod schema dynamically based on elements
	const formSchema = useMemo(() => {
		const schemaShape: Record<string, any> = {};
		elements.forEach((element) => {
			if (element.type === "Heading") return;

			let validator: any;
			switch (element.type) {
				case "Email":
					validator = z.string().email("Invalid email address");
					break;
				case "Checkbox":
				case "Switch":
					validator = z.boolean();
					break;
				case "Date Picker":
					validator = z.date().optional();
					break;
				default:
					validator = z.string();
			}

			if (element.required) {
				if (element.type === "Checkbox" || element.type === "Switch") {
					validator = validator.refine((val: boolean) => val === true, {
						message: "This field is required",
					});
				} else if (element.type !== "Date Picker") {
					validator = validator.min(1, "This field is required");
				}
			} else {
				if (element.type !== "Checkbox" && element.type !== "Switch") {
					validator = validator.optional();
				}
			}

			schemaShape[element.id] = validator;
		});
		return z.object(schemaShape);
	}, [elements]);

	const form = useForm({
		defaultValues: elements.reduce(
			(acc, el) => {
				if (el.type === "Heading") return acc;
				acc[el.id] =
					el.type === "Checkbox" || el.type === "Switch" ? false : "";
				return acc;
			},
			{} as Record<string, any>,
		),
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			console.log(value);
			toast.success("Form submitted successfully!");
		},
	});

	// Reset form when elements change to avoid stale state issues
	// In a real app, you might want to preserve values where possible
	useEffect(() => {
		form.reset();
	}, [elements, form]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="max-w-md mx-auto space-y-6"
		>
			{elements.map((element) => {
				if (element.type === "Heading") {
					return (
						<h1 key={element.id} className="text-2xl font-bold mb-4">
							{element.label}
						</h1>
					);
				}

				return (
					<form.Field
						key={element.id}
						name={element.id}
						children={(field) => (
							<div className="space-y-2">
								{element.type !== "Checkbox" && element.type !== "Switch" && (
									<Label
										htmlFor={element.id}
										className={cn(
											field.state.meta.errors.length > 0 && "text-destructive",
										)}
									>
										{element.label}{" "}
										{element.required && <span className="text-red-500">*</span>}
									</Label>
								)}

								{element.type === "Input" ||
								element.type === "Email" ||
								element.type === "Password" ? (
									<Input
										id={element.id}
										placeholder={element.placeholder}
										type={element.type.toLowerCase()}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className={cn(
											field.state.meta.errors.length > 0 &&
												"border-destructive focus-visible:ring-destructive",
										)}
									/>
								) : element.type === "Textarea" ? (
									<Textarea
										id={element.id}
										placeholder={element.placeholder}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className={cn(
											field.state.meta.errors.length > 0 &&
												"border-destructive focus-visible:ring-destructive",
										)}
									/>
								) : element.type === "Checkbox" ? (
									<div className="flex items-center space-x-2">
										<Checkbox
											id={element.id}
											checked={field.state.value}
											onCheckedChange={(checked) =>
												field.handleChange(checked)
											}
											className={cn(
												field.state.meta.errors.length > 0 &&
													"border-destructive",
											)}
										/>
										<Label
											htmlFor={element.id}
											className={cn(
												"font-normal",
												field.state.meta.errors.length > 0 &&
													"text-destructive",
											)}
										>
											{element.label}{" "}
											{element.required && (
												<span className="text-red-500">*</span>
											)}
										</Label>
									</div>
								) : element.type === "Switch" ? (
									<div className="flex items-center space-x-2">
										<Switch
											id={element.id}
											checked={field.state.value}
											onCheckedChange={(checked) =>
												field.handleChange(checked)
											}
										/>
										<Label htmlFor={element.id}>{element.label}</Label>
									</div>
								) : element.type === "Select" ? (
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											className={cn(
												field.state.meta.errors.length > 0 &&
													"border-destructive focus:ring-destructive",
											)}
										>
											<SelectValue placeholder="Select an option" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="option1">Option 1</SelectItem>
											<SelectItem value="option2">Option 2</SelectItem>
										</SelectContent>
									</Select>
								) : element.type === "Date Picker" ? (
									<Button
										variant={"outline"}
										className={cn(
											"w-full justify-start text-left font-normal",
											"text-muted-foreground",
											field.state.meta.errors.length > 0 &&
												"border-destructive text-destructive",
										)}
									>
										<Calendar className="mr-2 h-4 w-4" />
										<span>Pick a date</span>
									</Button>
								) : null}

								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive font-medium">
										{field.state.meta.errors
											.map((e: any) => e?.message || (typeof e === "string" ? e : "Error"))
											.join(", ")}
									</p>
								)}
							</div>
						)}
					/>
				);
			})}

			<div className="pt-4">
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit}
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{isSubmitting ? "Submitting..." : "Submit"}
						</Button>
					)}
				/>
			</div>
		</form>
	);
}

export function MiniFormBuilder() {
	const [elements, setElements] = useState<FormElement[]>(initialElements);
	const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

	const handleAddField = (type: FieldType) => {
		const newElement: FormElement = {
			id: Math.random().toString(36).substr(2, 9),
			type,
			label: type === "Heading" ? "New Heading" : `New ${type}`,
			placeholder: `Enter ${type.toLowerCase()}`,
			required: false,
		};
		setElements([...elements, newElement]);
	};

	const handleDelete = (id: string) => {
		setElements(elements.filter((el) => el.id !== id));
	};

	return (
		<div className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border shadow-2xl overflow-hidden flex flex-col">
			{/* Browser Tab Header */}
			<div className="h-10 border-b border-border bg-muted/30 flex items-end px-2 gap-2 select-none">
				<div className="relative group flex items-center gap-2 px-4 py-2 bg-background rounded-t-lg border-t border-x border-border -mb-[1px] shadow-sm min-w-[120px]">
					<div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
						<div className="w-1.5 h-1.5 rounded-full bg-primary" />
					</div>
					<span className="text-xs font-medium text-foreground">TanCN</span>
					<div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
						<div className="w-3 h-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center cursor-pointer">
							<span className="text-[10px] leading-none text-muted-foreground">×</span>
						</div>
					</div>
				</div>
				<div className="flex-1 h-full flex items-center justify-end px-2">
					<div className="flex gap-1.5">
						<div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
						<div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
					</div>
				</div>
			</div>

			{/* Mobile Tab Navigation */}
			<div className="lg:hidden flex border-b border-border bg-muted/10">
				<button
					onClick={() => setActiveTab("editor")}
					className={cn(
						"flex-1 py-2 text-sm font-medium transition-colors relative",
						activeTab === "editor"
							? "text-primary bg-background"
							: "text-muted-foreground hover:bg-muted/20",
					)}
				>
					Design
					{activeTab === "editor" && (
						<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
					)}
				</button>
				<button
					onClick={() => setActiveTab("preview")}
					className={cn(
						"flex-1 py-2 text-sm font-medium transition-colors relative",
						activeTab === "preview"
							? "text-primary bg-background"
							: "text-muted-foreground hover:bg-muted/20",
					)}
				>
					Preview
					{activeTab === "preview" && (
						<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
					)}
				</button>
			</div>

			<div className="flex-1 flex overflow-hidden relative">
				{/* Left Column: Fields */}
				<div
					className={cn(
						"border-r border-border bg-card/50 flex flex-col transition-all duration-300",
						"lg:w-64 lg:relative lg:flex", // Desktop: Fixed width, always visible
						activeTab === "editor"
							? "w-1/3 absolute inset-y-0 left-0 z-10 lg:static lg:w-64" // Mobile Editor: 1/3 width
							: "hidden lg:flex", // Mobile Preview: Hidden
					)}
				>
					<div className="p-4 border-b border-border">
						<h3 className="font-semibold text-primary">Fields</h3>
						<p className="text-xs text-muted-foreground">
							Select Field
						</p>
					</div>
					<div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
						<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Elements
						</div>
						{availableFields.map((field) => (
							<FieldItem
								key={field.type}
								item={field}
								onClick={() => handleAddField(field.type)}
							/>
						))}
					</div>
				</div>

				{/* Middle Column: Editor */}
				<div
					className={cn(
						"border-r border-border bg-background/50 flex flex-col transition-all duration-300",
						"lg:w-80 lg:relative lg:flex", // Desktop: Fixed width, always visible
						activeTab === "editor"
							? "w-2/3 absolute inset-y-0 right-0 z-10 lg:static lg:w-80" // Mobile Editor: 2/3 width
							: "hidden lg:flex", // Mobile Preview: Hidden
					)}
				>
					<div className="p-4 border-b border-border">
						<h3 className="font-semibold text-primary">Editor</h3>
						<p className="text-xs text-muted-foreground">
							Design form
						</p>
					</div>
					<div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-muted/10">
						<Reorder.Group
							axis="y"
							values={elements}
							onReorder={setElements}
							className="min-h-[100px] space-y-2"
							layoutScroll
						>
							{elements.map((element) => (
								<EditorItem
									key={element.id}
									element={element}
									onDelete={handleDelete}
								/>
							))}
						</Reorder.Group>
					</div>
				</div>

				{/* Right Column: Preview */}
				<div
					className={cn(
						"bg-background flex flex-col transition-all duration-300",
						"lg:flex-1 lg:relative lg:flex", // Desktop: Flex 1, always visible
						activeTab === "preview"
							? "absolute inset-0 z-20 lg:static" // Mobile Preview: Full screen
							: "hidden lg:flex", // Mobile Editor: Hidden
					)}
				>
					<div className="p-4 border-b border-border">
						<h3 className="font-semibold text-primary">Preview</h3>
						<p className="text-xs text-muted-foreground">
							Live preview
						</p>
					</div>
					<div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
						<PreviewForm elements={elements} />
					</div>
				</div>
			</div>
		</div>
	);
}
