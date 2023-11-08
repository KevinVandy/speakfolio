import { useEffect } from "react";
import { useRouteLoaderData } from "@remix-run/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type loader } from "~/routes/profile.$username/route";

interface Params {
  username?: string;
}

export function useFetchProfile({ username }: Params) {
  const queryClient = useQueryClient();
  const routeId = `routes/profile.$username`;
  const routeUrl = `/profile/${username}/?_data=routes%2Fprofile.%24username`;

  const loaderData = useRouteLoaderData<typeof loader>(routeId)!;

  useEffect(() => {
    queueMicrotask(() =>
      queryClient.setQueryData([routeId, routeUrl], loaderData as any)
    );
  }, [loaderData]);

  return useQuery({
    initialData: loaderData,
    queryFn: () =>
      fetch(routeUrl).then((res) => res.json()) as Promise<typeof loaderData>,
    queryKey: [routeId, routeUrl],
  });
}
