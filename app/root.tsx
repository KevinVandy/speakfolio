import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import {
  MantineProvider,
  ColorSchemeScript,
  localStorageColorSchemeManager,
} from "@mantine/core";
import { Layout } from "./Layout";

//CSS
import theme from "./styles/theme";
import mantineCoreStyles from "@mantine/core/styles.layer.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: mantineCoreStyles },
];

const colorSchemeManager = localStorageColorSchemeManager({ key: "default" });

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

export default App;
