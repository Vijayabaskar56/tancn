import { CodeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { RegistryItem } from "shadcn/registry";
import ComponentCli from "@/components/cli-commands";
import { CodeBlockCode } from "@/components/code-block";
import CopyRegistry from "@/components/copy-registry";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import OpenInV0 from "@/components/ui/open-in-v0";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useSettings from "@/hooks/use-settings";
import { getRegistryUrl } from "@/utils/utils";
import CopyButton from "./ui/copy-button";

export default function ComponentDetails({
	component,
	showRegistry = true,
	showV0 = true,
}: {
	component: RegistryItem;
	showRegistry?: boolean;
	showV0?: boolean;
}) {
	const [code, setCode] = useState<string | null>(null);
	// Removed pre-highlighting state; CodeBlockCode handles rendering
	const { preferredFramework } = useSettings();
	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		const handleEmptyCode = () => {
			if (!isMounted) return;
			setCode("");
		};

		const loadCode = async () => {
			try {
				const response = await fetch(
					`/r/${preferredFramework.toLowerCase()}/${component.name}.json`,
					{
						signal: controller.signal,
					},
				);
				if (!response.ok) {
					handleEmptyCode();
					return;
				}

				const contentType = response.headers.get("content-type");
				if (!contentType || !contentType.includes("application/json")) {
					handleEmptyCode();
					return;
				}

				type RegistryResponse = { files?: Array<{ content?: string }> };
				const data = (await response.json()) as RegistryResponse;
				const codeContent = data.files?.[0]?.content ?? "";
				if (!isMounted) return;
				setCode(codeContent);
			} catch (error) {
				if ((error as Error)?.name === "AbortError") return;
				console.error("Failed to load code:", error);
				handleEmptyCode();
			}
		};

		loadCode();
		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [component.name, preferredFramework.toLowerCase]);

	return (
		<div className="absolute top-2 right-2 flex gap-1 peer-data-comp-loading:hidden">
			{showRegistry && (
				<CopyRegistry
					url={`${getRegistryUrl(preferredFramework)}/${component.name}.json`}
				/>
			)}
			{showV0 && (
				<OpenInV0
					componentSource={`${getRegistryUrl(preferredFramework)}/${component.name}.json`}
				/>
			)}
			<Dialog>
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger asChild>
							<span>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="text-muted-foreground/80 hover:text-foreground transition-none hover:bg-transparent disabled:opacity-100 lg:opacity-0 lg:group-focus-within/item:opacity-100 lg:group-hover/item:opacity-100"
									>
										<CodeIcon size={16} aria-hidden={true} />
									</Button>
								</DialogTrigger>
							</span>
						</TooltipTrigger>
						<TooltipContent className="text-muted px-2 py-1 text-xs">
							View code
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle className="text-left">Installation</DialogTitle>
						<DialogDescription className="sr-only">
							Use the CLI to add components to your project
						</DialogDescription>
					</DialogHeader>
					<div className="min-w-0 space-y-5">
						<ComponentCli name={component.name} />
						<div className="space-y-4">
							<p className="text-lg font-semibold tracking-tight flex justify-between w-full">
								<span>Code</span>
								<CopyButton text={code ?? ""} />
							</p>
							<div className="relative">
								{code === "" ? (
									<p className="text-muted-foreground text-sm">
										No code available. If you think this is an error, please{" "}
										<a
											href="https://github.com/Vijayabaskar56/tancn/issues"
											target="_blank"
											className="text-foreground font-medium underline hover:no-underline"
											rel="noopener"
										>
											open an issue
										</a>
										.
									</p>
								) : (
									<CodeBlockCode code={code || ""} lang="tsx" />
								)}
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
