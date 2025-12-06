import { Heart, Table, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tableTemplates } from "@/constants/table-templates";
import type { SavedTableTemplate } from "@/db-collections/table-builder.collections";
import {
	deleteTableTemplate,
	getSavedTableTemplates,
	loadTableTemplate,
} from "@/services/table-builder.service";

export function TableTemplates() {
	const [savedTemplates, setSavedTemplates] = useState<SavedTableTemplate[]>(
		[],
	);

	const refreshSavedTemplates = useCallback(() => {
		setSavedTemplates(getSavedTableTemplates());
	}, []);

	useEffect(() => {
		refreshSavedTemplates();

		// Listen for storage changes to refresh saved templates
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key?.startsWith("saved-table-template-")) {
				refreshSavedTemplates();
			}
		};

		// Listen for custom template change events
		const handleTemplateChange = () => {
			refreshSavedTemplates();
		};

		window.addEventListener("storage", handleStorageChange);
		window.addEventListener("tableTemplateChanged", handleTemplateChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("tableTemplateChanged", handleTemplateChange);
		};
	}, [refreshSavedTemplates]);

	const applyTemplate = (templateKey: string) => {
		const success = applyTemplate(templateKey);
		if (success) {
			toast("Template applied successfully");
		} else {
			toast("Failed to apply template");
		}
	};

	const applySavedTemplate = (templateId: string) => {
		const success = loadTableTemplate(templateId);
		if (success) {
			toast("Saved table loaded successfully");
			// Refresh saved templates in case any were modified
			setSavedTemplates(getSavedTableTemplates());
		} else {
			toast("Failed to load saved table");
		}
	};

	const deleteSavedTemplate = (templateId: string, templateName: string) => {
		const success = deleteTableTemplate(templateId);
		if (success) {
			toast(`Template "${templateName}" deleted`);
			setSavedTemplates(getSavedTableTemplates());
		} else {
			toast("Failed to delete template");
		}
	};

	return (
		<div className="flex flex-col h-full md:h-full max-h-[35vh] md:max-h-none">
			<div className="mb-4 p-4 border-b">
				<h3 className="text-lg font-semibold text-primary">Table Templates</h3>
				<p className="text-sm text-muted-foreground">
					Predefined table templates
				</p>
			</div>
			<ScrollArea className="flex-1 overflow-auto max-h-[calc(35vh-8rem)] md:max-h-none">
				<div className="px-3 sm:px-4 space-y-4 sm:space-y-6">
					{savedTemplates.length > 0 && (
						<div>
							<h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
								<Heart className="size-4" />
								Saved Tables
							</h3>
							<div className="space-y-2">
								{savedTemplates.map((template) => (
									<div key={template.id} className="flex items-center gap-2">
										<Button
											onClick={() => applySavedTemplate(template.id)}
											className="justify-start text-[12px] flex-1"
											variant="ghost"
										>
											<Table className="size-4 mr-2" />
											{template.name}
										</Button>
										<Button
											onClick={() =>
												deleteSavedTemplate(template.id, template.name)
											}
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
					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Templates
						</h3>
						<div className="space-y-2">
							{Object.entries(tableTemplates).map(([key, template]) => (
								<Button
									key={key}
									onClick={() => applyTemplate(key)}
									className="justify-start text-[12px] w-full"
									variant="ghost"
								>
									<Table className="size-4 mr-2" />
									{template.name}
								</Button>
							))}
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
