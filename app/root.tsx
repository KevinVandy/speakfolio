import {
  type LinksFunction,
  type LoaderFunctionArgs,
  json,
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
import {
  ColorSchemeScript,
  MantineProvider,
  localStorageColorSchemeManager,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { type Session } from "@supabase/auth-helpers-remix";
import { eq } from "drizzle-orm";
import { Layout } from "./components/Layout";
import { SupabaseProvider } from "./hooks/useSupabase";
import theme from "./styles/theme";
import { getSupabaseServerClient } from "./util/getSupabaseServerClient";
import mantineCoreStyles from "@mantine/core/styles.layer.css";
import { db } from "db/connection";
import { profilesTable } from "db/schemas/profiles";

export const links: LinksFunction = () => [
  { href: mantineCoreStyles, rel: "stylesheet" },
];

const colorSchemeManager = localStorageColorSchemeManager({
  key: "colorScheme",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
  };

  const response = new Response();

  const supabase = getSupabaseServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const loggedInUserProfile = session?.user?.id
    ? (
        await db
          .select()
          .from(profilesTable)
          .where(eq(profilesTable.userId, session?.user?.id))
          .limit(1)
      )?.[0] ?? null
    : null;

  return json(
    {
      env,
      loggedInUserProfile,
      session,
    },
    {
      headers: response.headers,
    }
  );
}

function App() {
  const { env, loggedInUserProfile, session } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <SupabaseProvider
          env={env}
          loggedInUserProfile={loggedInUserProfile}
          session={session as Session}
        >
          <MantineProvider
            colorSchemeManager={colorSchemeManager}
            defaultColorScheme="dark"
            theme={theme}
          >
            <ModalsProvider>
              <Layout>
                <Outlet />
              </Layout>
            </ModalsProvider>
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
