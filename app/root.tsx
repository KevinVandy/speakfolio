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
  useRevalidator,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import {
  type Session,
  createBrowserClient,
  createServerClient,
} from "@supabase/auth-helpers-remix";
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const response = new Response();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    }
  );

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
};

function App() {
  const { env, session } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "INITIAL_SESSION" &&
        session?.access_token !== serverAccessToken
      ) {
        // server and client are out of sync.
        revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, revalidate]);

  // const signUp = () => {
  //   supabase.auth.signUp({
  //     email: "kevinvandy656@gmail.com",
  //     password: "password",
  //   });
  // };

  // const signIn = () => {
  //   supabase.auth.signInWithPassword({
  //     email: "kevinvandy656@gmail.com",
  //     password: "password",
  //   });
  // };

  // const signOut = () => {
  //   supabase.auth.signOut();
  // };

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
          <Layout supabase={supabase} session={session as Session}>
            <Outlet context={{ session, supabase }} />
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
