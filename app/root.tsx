import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { type Session } from "@supabase/auth-helpers-remix";
import { getSupabaseServerClient } from "./util/getSupabaseServerClient";
import { SupabaseProvider } from "./hooks/useSupabase";
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

const colorSchemeManager = localStorageColorSchemeManager({
  key: "colorScheme",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const response = new Response();

  const supabase = getSupabaseServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json(
    {
      env,
      session,
    },
    {
      headers: response.headers,
    }
  );
}

function App() {
  const { env, session } = useLoaderData<typeof loader>();

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
        <SupabaseProvider env={env} session={session as Session}>
          <MantineProvider
            defaultColorScheme="dark"
            colorSchemeManager={colorSchemeManager}
            theme={theme}
          >
            <Layout>
              <Outlet />
            </Layout>
          </MantineProvider>
        </SupabaseProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default App;
