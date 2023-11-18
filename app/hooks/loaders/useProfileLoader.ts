import { useRouteLoaderData } from "@remix-run/react";
import { type loader } from "~/routes/profile.$username/route";

export function useProfileLoader() {
  return useRouteLoaderData<typeof loader>("routes/profile.$username")!;
}
