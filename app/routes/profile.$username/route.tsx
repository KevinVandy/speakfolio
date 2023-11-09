import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useParams } from "@remix-run/react";
import { Button } from "@mantine/core";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfileFull, profilesTable } from "db/schemas/profiles";
import { useFetchProfile } from "~/hooks/queries/useFetchProfile";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;
  const response = new Response();

  const supabase = getSupabaseServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profile = username
    ? await db.query.profilesTable.findFirst({
        where: eq(profilesTable.username, username),
        with: {
          presentations: true,
        },
      })
    : null;

  const isOwnProfile = profile?.userId === session?.user?.id;

  if (!profile || (!isOwnProfile && profile.profileVisibility === "private")) {
    return redirect("/unknown-profile");
  }

  const returnData: IProfileFull = {
    ...profile,
    isOwnProfile,
  };

  return json(returnData);
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
