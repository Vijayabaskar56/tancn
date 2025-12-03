import type React from "react";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { useTheme } from "@/components/theme-provider";
import CopyButton from "@/components/ui/copy-button";
import { cn } from "@/utils/utils";

export type CodeBlockProps = {
	children?: React.ReactNode;
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
	return (
		<div
			className={cn(
				"not-prose flex w-full flex-col overflow-clip border",
				"border-border bg-card text-card-foreground rounded-xl",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export type CodeBlockCodeProps = {
	code: string;
	language?: string;
	theme?: string;
	className?: string;
	copyButton?: boolean;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
	code,
	language = "tsx",
	theme: themeProp,
	className,
	copyButton = true,
	...props
}: CodeBlockCodeProps) {
	const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
	const { theme: themeMode, systemTheme } = useTheme();

	// Auto-detect theme if not provided
	const theme =
		themeProp ||
		(themeMode === "system"
			? systemTheme === "dark"
				? "github-dark"
				: "github-light"
			: themeMode === "dark"
				? "github-dark"
				: "github-light");

	useEffect(() => {
		async function highlight() {
			if (!code) {
				setHighlightedHtml("<pre><code></code></pre>");
				return;
			}

			const html = await codeToHtml(code, { lang: language, theme });
			setHighlightedHtml(html);
		}
		highlight();
	}, [code, language, theme]);

	const classNames = cn(
		"w-full [&_pre]:text-wrap text-[13px] [&_pre]:px-4 [&_pre]:py-4",
		className,
	);

	// Render with an inline Copy button (works for both highlighted and fallback)
	return (
		<div className={cn("relative group", classNames)} {...props}>
			{/* Copy button */}
			{copyButton && (
				<div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
					<CopyButton text={code} />
				</div>
			)}

			{/* Highlighted or fallback content */}
			{highlightedHtml ? (
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Need to highlight the code
				<div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
			) : (
				<pre>
					<code>{code}</code>
				</pre>
			)}
		</div>
	);
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
	children,
	className,
	...props
}: CodeBlockGroupProps) {
	return (
		<div
			className={cn("flex items-center justify-between", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
