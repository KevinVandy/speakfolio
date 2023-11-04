import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "db/connection";
import { IProfile, profilesTable } from "db/schemas/profiles";
import { and, eq, ne } from "drizzle-orm";
import { EditProfileModal } from "~/components/modals/EditProfileModal";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

export async function loader({ params, request, context }: LoaderFunctionArgs) {
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
  const { profile, isOwnProfile } = useLoaderData<typeof loader>();

  const [opened, { open, close }] = useDisclosure(false);

  // return null;

  return (
    <div>
      {isOwnProfile && <Button onClick={open}>Edit Profile</Button>}

      <EditProfileModal
        profile={profile as IProfile}
        opened={opened}
        onClose={close}
      />
      <pre>
        <code>{JSON.stringify({ profile, isOwnProfile }, null, 2)}</code>
      </pre>
    </div>
  );
}
