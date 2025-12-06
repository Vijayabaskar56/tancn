import { FileStack, Heart, SquareStack, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { templates } from "@/constants/templates";
import { useFormStore } from "@/hooks/use-form-store";

const formTemplates = Object.entries(templates).map((template) => ({
	label: template[1].name,
	value: template[0],
	isMS: template[1].template.some((el) => Object.hasOwn(el, "stepFields")),
}));

export function TemplateSidebar() {
	const [searchQuery, _setSearchQuery] = useState("");
	const [savedForms, setSavedForms] = useState<
		Array<{ name: string; data: Record<string, unknown>; createdAt: string }>
	>([]);
	const { actions } = useFormStore();

	// Load saved forms on component mount
	useEffect(() => {
		setSavedForms(actions.getSavedForms());
	}, [actions]);

	const handleLoadSavedForm = (formName: string) => {
		const success = actions.loadForm(formName);
		if (success) {
			toast("Form loaded successfully");
		} else {
			toast("Failed to load form");
		}
		// Refresh the saved forms list after loading
		setSavedForms(actions.getSavedForms());
	};

	const handleDeleteSavedForm = (formName: string) => {
		const success = actions.deleteSavedForm(formName);
		if (success) {
			toast(`Form "${formName}" deleted`);
		} else {
			toast("Failed to delete form");
		}
		setSavedForms(actions.getSavedForms());
	};

	const filteredTemplates = searchQuery
		? formTemplates.filter((template) =>
				template.label.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: formTemplates;

	return (
		<div className="flex flex-col h-full">
			<div className="mb-4 p-4 border-b">
				<h3 className="text-lg font-semibold text-primary">Template</h3>
				<p className="text-sm text-muted-foreground">Predefined Template's</p>
			</div>
			<ScrollArea className="flex-1 min-h-0">
				<div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
					{/* Saved Forms */}
					{savedForms.length > 0 && (
						<div>
							<h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
								<Heart className="size-4" />
								Saved Forms
							</h3>
							<div className="space-y-2">
								{savedForms.map((template) => (
									<div key={template.name} className="flex items-center gap-2">
										<Button
											onClick={() => handleLoadSavedForm(template.name)}
											className="justify-start text-[12px] flex-1"
											variant="ghost"
										>
											<FileStack className="size-4 mr-2" />
											{template.name}
										</Button>
										<Button
											onClick={() => handleDeleteSavedForm(template.name)}
											size="sm"
											variant="ghost"
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="size-4" />
										</Button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Built-in Templates */}
					{filteredTemplates.length > 0 && (
						<div>
							<h3 className="text-sm font-medium text-muted-foreground mb-2">
								Templates
							</h3>
							<div className="space-y-2">
								{filteredTemplates.map(({ label, value, isMS }) => (
									<Button
										key={label}
										onClick={() => actions.setTemplate(value)}
										className="justify-start text-[12px] w-full"
										variant="ghost"
									>
										{isMS ? (
											<SquareStack className="size-4 mr-2" />
										) : (
											<FileStack className="size-4 mr-2" />
										)}
										{label}
									</Button>
								))}
							</div>
						</div>
					)}

					{/* No results message */}
					{filteredTemplates.length === 0 &&
						savedForms.length === 0 &&
						searchQuery && (
							<div className="text-sm text-muted-foreground p-3">
								No templates or saved forms match your query
							</div>
						)}

					{/* Empty state when no saved forms */}
					{filteredTemplates.length === 0 &&
						savedForms.length === 0 &&
						!searchQuery && (
							<div className="text-sm text-muted-foreground p-3">
								No saved forms yet. Save a form to see it here.
							</div>
						)}
				</div>
			</ScrollArea>
		</div>
	);
}
