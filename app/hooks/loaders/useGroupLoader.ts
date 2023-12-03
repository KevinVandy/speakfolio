import { useRouteLoaderData } from "@remix-run/react";
import { type loader } from "~/routes/group.$slug/route";

export function useGroupLoader() {
  return useRouteLoaderData<typeof loader>("routes/group.$slug")!;
}
