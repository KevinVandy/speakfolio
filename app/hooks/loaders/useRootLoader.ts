import { useRouteLoaderData } from "@remix-run/react";
import { type loader } from "~/root";

export function useRootLoader() {
  const rootData = useRouteLoaderData<typeof loader>("root")!;
  return {
    authProfile: rootData.loggedInUserProfile || null,
    authSessionId:
      rootData?.clerkState?.__internal_clerk_state?.__clerk_ssr_state
        ?.sessionId || null,
    authUser:
      rootData?.clerkState?.__internal_clerk_state?.__clerk_ssr_state?.user ||
      null,
    authUserId:
      rootData.clerkState.__internal_clerk_state.__clerk_ssr_state.userId ||
      null,
  };
}
