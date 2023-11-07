import { useRouteLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { type loader } from "~/routes/profile.$username";

interface Params {
  username?: string;
}

export function useFetchProfile({ username }: Params) {
  const routeId = `routes/profile.$username`;
  const routeUrl = `/profile/${username}/?_data=routes%2Fprofile.%24username`;

  const initialData = useRouteLoaderData<typeof loader>(routeId)!;

  return useQuery({
    initialData,
    queryFn: () => {
      console.log("fetching", routeUrl);
      return fetch(routeUrl).then((res) => res.json()) as Promise<
        typeof initialData
      >;
    },
    queryKey: [routeId, routeUrl],
  });
}
