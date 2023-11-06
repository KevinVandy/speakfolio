import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Button } from "@mantine/core";
import { and, eq, ne } from "drizzle-orm";
import { db } from "db/connection";
import { profilesTable } from "db/schemas/profiles";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;
  const response = new Response();

  const supabase = getSupabaseServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const loggedInUserProfile = session?.user?.id
    ? (
        await db
          .select()
          .from(profilesTable)
          .where(eq(profilesTable.userId, session?.user?.id))
          .limit(1)
      )?.[0] ?? null
    : null;

  const isOwnProfile = loggedInUserProfile?.username === username;

  const profile = isOwnProfile
    ? loggedInUserProfile
    : username
    ? (
        await db
          .select()
          .from(profilesTable)
          .where(
            and(
              eq(profilesTable.username, username),
              !isOwnProfile
                ? ne(profilesTable.profileVisibility, "private")
                : undefined
            )
          )
          .limit(1)
      )?.[0] ?? null
    : null;

  if (!profile) return redirect("/unknown-profile");

  return json({ isOwnProfile, profile });
}

export default function ProfileIdPage() {
  const { isOwnProfile, profile } = useLoaderData<typeof loader>();

  return (
    <div>
      {isOwnProfile && (
        <>
          <Button component={Link} to="edit">
            Edit Profile
          </Button>
        </>
      )}
      <Outlet />
      <pre>
        <code>{JSON.stringify({ isOwnProfile, profile }, null, 2)}</code>
      </pre>
    </div>
  );
}
