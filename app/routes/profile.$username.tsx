import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useParams } from "@remix-run/react";
import { Button } from "@mantine/core";
import { and, eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfile, profilesTable } from "db/schemas/profiles";
import { useFetchProfile } from "~/hooks/queries/useFetchProfile";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;
  const response = new Response();

  const supabase = getSupabaseServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let _profile = username
    ? (
        await db
          .select()
          .from(profilesTable)
          .where(and(eq(profilesTable.username, username)))
          .limit(1)
      )?.[0] ?? null
    : null;

  const isOwnProfile = _profile?.userId === session?.user?.id;

  if (
    !_profile ||
    (!isOwnProfile && _profile.profileVisibility === "private")
  ) {
    return redirect("/unknown-profile");
  }

  const profile: IProfile & { isOwnProfile?: boolean } = {
    ..._profile,
    isOwnProfile,
  };

  return json(profile);
}

export default function ProfileIdPage() {
  const { username } = useParams();

  const { data: profile, refetch } = useFetchProfile({ username });
  const { isOwnProfile } = profile;

  return (
    <div>
      <button onClick={() => refetch()}>Refetch</button>
      {isOwnProfile && (
        <>
          <Button component={Link} to="edit">
            Edit Profile
          </Button>
        </>
      )}
      <Outlet />
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
