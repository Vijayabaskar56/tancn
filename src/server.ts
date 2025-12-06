import handler from "@tanstack/react-start/server-entry";
export type RequestContext = {
	env: Env;
	waitUntil: (promise: Promise<unknown>) => void;
	passThroughOnException: () => void;
};
declare module "@tanstack/react-start" {
	interface Register {
		server: {
			requestContext: RequestContext;
		};
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return handler.fetch(request, {
			context: {
				env,
				waitUntil: ctx.waitUntil.bind(ctx),
				passThroughOnException: ctx.passThroughOnException.bind(ctx),
			},
		});
	},
};
