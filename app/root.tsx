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
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { ClerkApp, ClerkErrorBoundary } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
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
import mantineNotificationStyles from "@mantine/notifications/styles.css";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import mantineNProgressStyles from "@mantine/nprogress/styles.css";
import mantineTipTapStyles from "@mantine/tiptap/styles.css";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfile, profilesTable } from "db/schemas/profilesTable";
import { Layout } from "./components/Layout";
import { useRootLoader } from "./hooks/loaders/useRootLoader";
import globalStyles from "./styles/global.css";
import theme from "./styles/theme";
import { type ClerkState } from "node_modules/@clerk/remix/dist/client/types";

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

export async function loader(args: LoaderFunctionArgs): Promise<{
  clerkState: ClerkState;
  loggedInUserProfile: IProfile | null;
}> {
  //@ts-ignore
  return rootAuthLoader(
    args,
    async ({ request }) => {
      const { userId } = request.auth;
      if (!userId) {
        return null;
      }
      try {
        const loggedInUserProfile = await db.query.profilesTable.findFirst({
          where: eq(profilesTable.userId, userId),
        });
        return json({
          loggedInUserProfile,
        });
      } catch (error) {
        console.error("Error fetching user profile", error);
        return json({ loggedInUserProfile: null });
      }
    },
    { loadUser: true }
  );
}

export const ErrorBoundary = ClerkErrorBoundary();

function App() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { authProfile, authUserId } = useRootLoader();

  useEffect(() => {
    if (!authProfile && authUserId) {
      navigate("/finish-sign-up");
    }
  }, [authProfile, authUserId]);

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
        <QueryClientProvider client={queryClient}>
          <MantineProvider
            colorSchemeManager={colorSchemeManager}
            defaultColorScheme="dark"
            theme={theme}
          >
            <ModalsProvider>
              <NavigationProgress />
              <Notifications
                autoClose={10_000}
                position="top-right"
                top="70px"
              />
              <Layout>
                <Outlet />
              </Layout>
            </ModalsProvider>
          </MantineProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App);
