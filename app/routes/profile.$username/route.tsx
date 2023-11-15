import { useState } from "react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Outlet, useMatches, useNavigate, useParams } from "@remix-run/react";
import { Stack, Tabs } from "@mantine/core";
import {
  IconBriefcase,
  IconPodium,
  IconPresentation,
  IconUser,
} from "@tabler/icons-react";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfileFull, profilesTable } from "db/schemas/profilesTable";
import { ProfileHead } from "./ProfileHead";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
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
              richText: true,
            },
          },
          links: true,
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

const tabs = [
  {
    Icon: () => <IconUser />,
    id: "_index",
    title: "Bio",
  },
  {
    Icon: () => <IconBriefcase />,
    id: "career",
    title: "Career",
  },
  {
    Icon: () => <IconPodium />,
    id: "past-talks",
    title: "Past Talks",
  },
  {
    Icon: () => <IconPresentation />,
    id: "prepared-talks",
    title: "Prepared Talks",
  },
];

export default function ProfileIdPage() {
  const { username } = useParams();
  const matches = useMatches();
  const navigate = useNavigate();

  const profile = useProfileLoader();

  const [tab, _setTab] = useState<null | string>(
    () => matches.pop()?.id?.split?.(".")?.pop() ?? "_index"
  );

  const setTab = (tab: null | string) => {
    _setTab(tab);
    if (tab === "_index") navigate(`/profile/${username}`);
    else if (tab && tab !== "_index" && tabs.map((t) => t.id).includes(tab))
      navigate(`/profile/${username}/${tab}`);
  };

  return (
    <Stack gap="md">
      <ProfileHead />
      <Tabs
        color={profile.profileColor ?? "pink"}
        onChange={setTab}
        value={tab || "_index"}
      >
        <Tabs.List justify="center">
          {tabs.map((t) => (
            <Tabs.Tab key={t.id} leftSection={<t.Icon />} value={t.id}>
              {t.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Outlet />
      </Tabs>
      <pre style={{ marginTop: "500px", whiteSpace: "pre-wrap" }}>
        {JSON.stringify(profile, null, 2)}
      </pre>
    </Stack>
  );
}
