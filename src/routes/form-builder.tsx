import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import type * as v from "valibot";
import { ErrorBoundary } from "@/components/error-boundary";
import FormHeader from "@/components/form-components/form-header";
import Loader from "@/components/loader";
import { NotFound } from "@/components/not-found";
import type { FormElementsSchema } from "@/lib/search-schema";
import { seo } from "@/utils/seo";

export const Route = createFileRoute("/form-builder")({
	head: () => ({
		meta: [...seo({ title: "Form Builder | TanCN - Form and Table Builder" })],
	}),
	component: FormBuilderLayout,
	errorComponent: ErrorBoundary,
	notFoundComponent: NotFound,
	loader: ({
		location,
	}): v.InferOutput<typeof FormElementsSchema> | undefined => {
		if ((location?.search as unknown as { share: string })?.share) {
			localStorage.setItem(
				"share",
				JSON.stringify((location.search as unknown as { share: string }).share),
			);
			throw redirect({
				to: "/form-builder",
			});
		}
		return undefined;
	},
	pendingComponent: Loader,
});

function FormBuilderLayout() {
	useEffect(() => {
		// initializeSettings is already called via createIsomorphicFn
	}, []);

	return (
		<>
			<FormHeader />
			<Outlet />
		</>
	);
}
