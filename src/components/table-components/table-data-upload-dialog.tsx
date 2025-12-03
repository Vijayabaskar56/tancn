import { Loader2Icon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import FileUpload from "@/components/file-upload";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { Button } from "@/components/ui/button";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "@/components/ui/revola";
import { revalidateLogic, useAppForm } from "@/components/ui/tanstack-form";
import { Textarea } from "@/components/ui/textarea";
import { useDataProcessorWorker } from "@/hooks/use-data-processor-worker";
import { importData } from "@/services/table-builder.service";
import type { Column } from "@/workers/data-processor.worker";

const dataFormSchema = z.object({
	data: z.array(z.any()),
});

function DataUploadDialog() {
	const [open, setOpen] = useState(false);
	const [textareaText, setTextareaText] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const { parseData } = useDataProcessorWorker();

	const dataForm = useAppForm({
		defaultValues: {
			data: [],
		} as z.input<typeof dataFormSchema>,
		validationLogic: revalidateLogic(),
		validators: {
			onDynamic: dataFormSchema,
			onDynamicAsyncDebounceMs: 300,
		},
	});

	const updateTableData = (data: any[], columns?: Column[]) => {
		importData(data, columns);
		dataForm.setFieldValue("data", data);
	};

	const handleFileUpload = (files: any[]) => {
		const file = files[0]?.file;
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;

			// Only read and display the file content in textarea
			// Actual processing will happen when user clicks "Process Data"
			setTextareaText(text);
			toast.success("File loaded. Click 'Process Data' to import.");
		};
		reader.readAsText(file);
	};

	const handleTextareaSubmit = async () => {
		if (textareaText.trim() === "") {
			dataForm.setFieldValue("data", []);
			importData([]);
			toast.success("Data cleared");
			setTextareaText("[]");
			setOpen(false);
			return;
		}

		// Use worker to parse data
		setIsProcessing(true);
		parseData({
			content: textareaText,
			fileType: "auto",
			onSuccess: (data, columns) => {
				updateTableData(data, columns);
				setTextareaText("[]");
				dataForm.reset({ data: [] });
				setIsProcessing(false);
				toast.success("Data processed successfully");
				setOpen(false);
			},
			onError: (error) => {
				setIsProcessing(false);
				toast.error(error);
			},
		});
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={setOpen}>
			<ResponsiveDialogTrigger asChild>
				<AnimatedIconButton
					icon={<UploadIcon className="w-4 h-4 mr-1" />}
					text={<span className="hidden xl:block ml-1">Upload Data</span>}
					variant="ghost"
					size="sm"
				/>
			</ResponsiveDialogTrigger>
			<ResponsiveDialogContent className="max-w-4xl max-h-[85vh] p-0">
				<div className="flex flex-col h-full max-h-[85vh]">
					<ResponsiveDialogHeader className="p-6 pb-4 border-b">
						<ResponsiveDialogTitle>Upload Table Data</ResponsiveDialogTitle>
						<ResponsiveDialogDescription>
							Upload a CSV or JSON file, or paste your data directly
						</ResponsiveDialogDescription>
					</ResponsiveDialogHeader>
					<div className="flex-1 px-6 py-4 space-y-6">
						{/* File Upload Section */}
						<div className="space-y-4">
							<div className="text-sm font-medium">Upload File</div>
							<FileUpload onFilesAdded={handleFileUpload} />
							<div className="text-center text-sm text-muted-foreground">
								or paste CSV/JSON data below
							</div>
						</div>

						{/* Textarea Section */}
						<div className="space-y-4">
							<div className="text-sm font-medium">Paste Data</div>
							<Textarea
								placeholder="Enter your CSV or JSON data here..."
								value={textareaText}
								onChange={(e) => setTextareaText(e.target.value)}
								className="min-h-[200px] font-mono text-sm"
								disabled={isProcessing}
							/>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => setTextareaText("")}
									disabled={isProcessing}
								>
									Clear
								</Button>
								<Button onClick={handleTextareaSubmit} disabled={isProcessing}>
									{isProcessing && (
										<Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
									)}
									Process Data
								</Button>
							</div>
						</div>
					</div>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}

export default DataUploadDialog;
