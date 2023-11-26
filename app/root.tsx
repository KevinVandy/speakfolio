import { useEffect } from "react";
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
  useNavigation,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import mantineCarouselStyles from "@mantine/carousel/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  localStorageColorSchemeManager,
} from "@mantine/core";
import mantineCoreStyles from "@mantine/core/styles.layer.css";
import mantineDateStyles from "@mantine/dates/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import mantineNProgressStyles from "@mantine/nprogress/styles.css";
import mantineNotificationStyles from "@mantine/notifications/styles.css";
import mantineTipTapStyles from "@mantine/tiptap/styles.css";
import { type Session } from "@supabase/auth-helpers-remix";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfile, profilesTable } from "db/schemas/profilesTable";
import { Layout } from "./components/Layout";
import { useRootLoader } from "./hooks/loaders/useRootLoader";
import { SupabaseProvider } from "./hooks/useSupabase";
import globalStyles from "./styles/global.css";
import theme from "./styles/theme";
import { getSupabaseServerClient } from "./util/getSupabaseServerClient";

export const links: LinksFunction = () => [
  { href: mantineCoreStyles, rel: "stylesheet" },
  { href: mantineDateStyles, rel: "stylesheet" },
  { href: mantineNProgressStyles, rel: "stylesheet" },
  { href: mantineCarouselStyles, rel: "stylesheet" },
  { href: mantineTipTapStyles, rel: "stylesheet" },
  { href: mantineNotificationStyles, rel: "stylesheet" },
  { href: globalStyles, rel: "stylesheet" },
];

export const colorSchemeManager = localStorageColorSchemeManager({
  key: "colorScheme",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000, // 1 seconds
    },
  },
});

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const env = {
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
  };
  let loggedInUserProfile: IProfile | undefined = undefined;
  let session: Session | null = null;

  const supabase = getSupabaseServerClient({ request, response });

  try {
    session = (await supabase.auth.getSession()).data.session;

    if (session?.user?.id) {
      loggedInUserProfile = await db.query.profilesTable.findFirst({
        where: eq(profilesTable.userId, session.user.id),
      });
    }

    if (session?.user?.id && !loggedInUserProfile) {
      supabase.auth.signOut();
      throw new Error("User not found for session");
    }
  } catch (e) {
    console.error(e);
  }

  return json(
    {
      env,
      loggedInUserProfile,
      session,
    },
    {
      headers: response.headers,
    },
  );
}

export default function App() {
  const navigation = useNavigation();
  const { env, loggedInUserProfile, session } = useRootLoader();

  useEffect(() => {
    if (navigation.state === "loading") {
      nprogress.set(50);
      nprogress.start();
    } else if (navigation.state === "submitting") {
      nprogress.set(30);
      nprogress.start();
    } else {
      nprogress.complete();
    }
  }, [navigation.state]);

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
          <QueryClientProvider client={queryClient}>
            <MantineProvider
              colorSchemeManager={colorSchemeManager}
              defaultColorScheme="dark"
              theme={theme}
            >
              <ModalsProvider>
                <NavigationProgress />
                <Notifications
                  position="top-right"
                  autoClose={10_000}
                  top="70px"
                />
                <Layout>
                  <Outlet />
                </Layout>
              </ModalsProvider>
            </MantineProvider>
          </QueryClientProvider>
        </SupabaseProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
