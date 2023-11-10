import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import { Avatar, BackgroundImage, Flex, Stack, Title } from "@mantine/core";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfileFull, profilesTable } from "db/schemas/profilesTable";
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
          bio: {
            columns: {
              id: true,
              plainText: true,
              richText: true,
            },
          },
          presentations: true,
        },
      })
    : null;

  const isOwnProfile = profile?.userId === session?.user?.id;

  if (!profile || (!isOwnProfile && profile.visibility === "private")) {
    return redirect("/unknown-profile");
  }

  const returnData = {
    ...profile,
    isOwnProfile,
  } as IProfileFull;

  return json(returnData);
}

export default function ProfileIdPage() {
  const { username } = useParams();

  const { data: profile } = useFetchProfile({ username });

  const { isOwnProfile } = profile;

  return (
    <Stack gap="md">
      {isOwnProfile && <Outlet />}
      <BackgroundImage mb="xl" radius="xs" src={profile.coverImageUrl ?? ""}>
        <Flex mih="200px" style={{ alignItems: "flex-end" }}>
          <Avatar
            color={profile.profileColor ?? "blue"}
            radius="100%"
            size="120px"
            src={profile.profileImageUrl ?? ""}
            style={{ transform: "translateY(50px)" }}
            variant="filled"
          />
        </Flex>
      </BackgroundImage>
      <Title mt="lg" order={2} ta="center">
        {profile.name}
      </Title>

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(profile, null, 2)}
      </pre>
    </Stack>
  );
}
