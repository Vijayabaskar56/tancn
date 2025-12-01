import CopyButton from "@/components/ui/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingsCollection } from "@/db-collections/settings.collections";
import useSettings from "@/hooks/use-settings";
import { updatePreferredPackageManager } from "@/utils/utils";

export default function CliCommands({ name }: { name: string }) {
	const { preferredPackageManager, preferredFramework } = useSettings();
	const commands = {
		pnpm: `pnpm dlx shadcn@latest add https://tancn.dev/r/${preferredFramework}${name}.json`,
		npm: `npx shadcn@latest add https://tancn.dev/r/${preferredFramework}${name}.json`,
		yarn: `yarn shadcn@latest add https://tancn.dev/r/${preferredFramework}${name}.json`,
		bun: `bunx --bun shadcn@latest add https://tancn.dev/r/${preferredFramework}${name}.json`,
	};

	return (
		<div className="relative">
			<Tabs
				value={preferredPackageManager}
				onValueChange={(value) =>
					updatePreferredPackageManager(
						value as SettingsCollection["preferredPackageManager"],
					)
				}
				className="rounded-md bg-card"
			>
				<TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent px-4 py-0">
					<TabsTrigger
						className="data-[state=active]:after:bg-primary relative rounded-none py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
						value="pnpm"
					>
						pnpm
					</TabsTrigger>
					<TabsTrigger
						className="data-[state=active]:after:bg-primary relative rounded-none py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
						value="npm"
					>
						npm
					</TabsTrigger>
					<TabsTrigger
						className="data-[state=active]:after:bg-primary relative rounded-none py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
						value="yarn"
					>
						yarn
					</TabsTrigger>
					<TabsTrigger
						className="data-[state=active]:after:bg-primary relative rounded-none py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
						value="bun"
					>
						bun
					</TabsTrigger>
				</TabsList>
				{Object.entries(commands).map(([pkg, command]) => (
					<TabsContent className="m-0" key={pkg} value={pkg}>
						<div className="relative">
							<pre className="overflow-auto p-4 pr-12 font-mono text-[12.8px] bg-muted text-muted-foreground">
								{command}
							</pre>
							<div className="absolute bg-accent top-2 right-2">
								<CopyButton
									text={
										commands[preferredPackageManager as keyof typeof commands]
									}
								/>
							</div>
						</div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
