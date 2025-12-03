import { FormBuilderTab } from "@/components/mini-builder/form-builder-tab";
import { TableBuilderTab } from "@/components/mini-builder/table-builder-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MiniFormBuilder() {
	return (
		<div className="w-full h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border shadow-2xl overflow-hidden flex flex-col">
			<Tabs defaultValue="form" className="flex-1 flex flex-col gap-0">
				{/* Browser Tab Header */}
				<div className="h-10 border-b border-border bg-muted/30 flex items-end px-2 gap-2 select-none">
					<TabsList className="bg-transparent p-0 h-full gap-2">
						<TabsTrigger
							value="form"
							className="relative group flex items-center gap-2 px-4 py-2 bg-background rounded-t-lg border-t border-x border-border -mb-[1px] shadow-sm min-w-[120px]  transition-all data-[state=active]:shadow-none rounded-b-none"
						>
							<div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
								<div className="w-1.5 h-1.5 rounded-full bg-primary" />
							</div>
							<span className="text-xs font-medium text-foreground">
								Form Builder
							</span>
							<div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
								<div className="w-3 h-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center cursor-pointer">
									<span className="text-[10px] leading-none text-muted-foreground">
										×
									</span>
								</div>
							</div>
						</TabsTrigger>
						<TabsTrigger
							value="table"
							className="relative group flex items-center gap-2 px-4 py-2 bg-background rounded-t-lg border-t border-x border-border -mb-[1px] shadow-sm min-w-[120px]  transition-all data-[state=active]:shadow-none rounded-b-none"
						>
							<div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
								<div className="w-1.5 h-1.5 rounded-full bg-primary" />
							</div>
							<span className="text-xs font-medium text-foreground">
								Table Builder
							</span>
							<div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
								<div className="w-3 h-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center cursor-pointer">
									<span className="text-[10px] leading-none text-muted-foreground">
										×
									</span>
								</div>
							</div>
						</TabsTrigger>
					</TabsList>

					<div className="flex-1 h-full flex items-center justify-end px-2">
						<div className="flex gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
							<div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
						</div>
					</div>
				</div>

				<div className="flex-1 overflow-hidden relative">
					<TabsContent
						value="form"
						className="h-full m-0 data-[state=inactive]:hidden"
					>
						<FormBuilderTab />
					</TabsContent>
					<TabsContent
						value="table"
						className="h-full m-0 data-[state=inactive]:hidden"
					>
						<TableBuilderTab />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
