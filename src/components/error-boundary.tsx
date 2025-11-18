import type { ErrorComponentProps } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorBoundary({ error, reset }: ErrorComponentProps) {
	const isDev = import.meta.env.DEV;

	const createGithubIssue = () => {
		const title = encodeURIComponent(`Error: ${error.message}`);
		const body = encodeURIComponent(`## Error Details

**Message:** ${error.message}

**Stack:**
\`\`\`
${error.stack || "No stack trace available"}
\`\`\`

**Location:** ${window.location.href}

**User Agent:** ${navigator.userAgent}

## Steps to Reproduce
1.
2.
3.

## Expected Behavior


## Actual Behavior

`);
		window.open(
			`https://github.com/Vijayabaskar56/tancn/issues/new?title=${title}&body=${body}`,
			"_blank",
		);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-destructive mb-2">
						Oops! Something went wrong.
					</h1>
					<p className="text-muted-foreground">
						An unexpected error occurred. Please try refreshing the page or
						report this issue on GitHub.
					</p>
				</div>
				<div className="bg-card border rounded-lg p-6 shadow-sm">
					<h2 className="text-lg font-semibold mb-3 text-card-foreground">
						Error Details
					</h2>
					<p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded break-all">
						{error.message || "Unknown error occurred"}
					</p>
					{isDev && error.stack && (
						<div className="mt-4">
							<h2 className="text-sm font-semibold mb-2 text-card-foreground">
								Stack Trace
							</h2>
							<div className="max-h-64 overflow-auto rounded bg-muted p-3">
								<pre className="text-xs font-mono text-muted-foreground">
									{error.stack}
								</pre>
							</div>
						</div>
					)}
				</div>
				<div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
					<Button onClick={reset} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						Reset and Try Again
					</Button>
					<Button onClick={createGithubIssue} variant="outline" className="gap-2">
						<svg
							className="h-4 w-4"
							fill="currentColor"
							viewBox="0 0 24 24"
							aria-label="GitHub"
						>
							<title>GitHub</title>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						Report on GitHub
					</Button>
				</div>
			</div>
		</div>
	);
}
