import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClerkApp, ClerkErrorBoundary } from "@clerk/remix";
import { dark } from "@clerk/themes";
import {
  MantineProvider,
  ColorSchemeScript,
  localStorageColorSchemeManager,
} from "@mantine/core";
import { Layout } from "./Layout";

//CSS
import theme from "./styles/theme";
import mantineCoreStyles from "@mantine/core/styles.layer.css";
import tailwindStyles from "./styles/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: mantineCoreStyles },
];

const colorSchemeManager = localStorageColorSchemeManager({ key: "default" });

export const loader: LoaderFunction = (args) => rootAuthLoader(args);

export const ErrorBoundary = ClerkErrorBoundary();

function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider colorSchemeManager={colorSchemeManager} theme={theme}>
          <Layout>
            <Outlet />
          </Layout>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App, {
  appearance: {
    baseTheme: dark,
  },
});
