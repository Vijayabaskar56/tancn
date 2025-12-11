import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { FormDevtoolsPlugin } from "@tanstack/react-form-devtools";
const DevTools = () => {
	return (
		<TanStackDevtools
			config={{
				position: "bottom-right",
			}}
			plugins={[
				FormDevtoolsPlugin(),
				// aiDevtoolsPlugin(),
				{
					name: "Tanstack Router",
					render: <TanStackRouterDevtoolsPanel />,
				},
				{
					name: "Tanstack Query",
					render: <ReactQueryDevtoolsPanel />,
				},
			]}
			eventBusConfig={{
        connectToServerBus: true,
      }}
		/>
	);
};

export default DevTools;
