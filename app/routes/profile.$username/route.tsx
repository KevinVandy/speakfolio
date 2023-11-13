import { useState } from "react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Outlet, useSearchParams } from "@remix-run/react";
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
import { ProfileBio } from "./ProfileBio";
import { ProfileCareer } from "./ProfileCareer";
import { ProfileHead } from "./ProfileHead";
import { ProfilePastTalks } from "./ProfilePastTalks";
import { ProfilePreparedTalks } from "./ProfilePreparedTalks";
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

interface TabProps {}

const tabs = [
  {
    Component: (props: TabProps) => <ProfileBio {...props} />,
    Icon: () => <IconUser />,
    id: "bio",
    title: "Bio",
  },
  {
    Component: (props: TabProps) => <ProfileCareer {...props} />,
    Icon: () => <IconBriefcase />,
    id: "career",
    title: "Career",
  },
  {
    Component: (props: TabProps) => <ProfilePastTalks {...props} />,
    Icon: () => <IconPodium />,
    id: "past-talks",
    title: "Past Talks",
  },
  {
    Component: (props: TabProps) => <ProfilePreparedTalks {...props} />,
    Icon: () => <IconPresentation />,
    id: "prepared-talks",
    title: "Prepared Talks",
  },
];

export default function ProfileIdPage() {
  const [searchParams] = useSearchParams();

  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const initialCurrentStep = searchParams.get("tab") ?? "bio";
  const [tab, _setTab] = useState<null | string | undefined>(
    initialCurrentStep
  );
  const setTab = (newTab: null | string) => {
    _setTab(newTab !== "bio" ? newTab : undefined);
    const url = new URL(window.location.href);
    if (newTab === "bio") {
      url.searchParams.delete("tab");
    } else if (newTab) {
      url.searchParams.set("tab", newTab);
    }
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <Stack gap="md">
      {isOwnProfile && <Outlet />}
      <ProfileHead />
      <Tabs
        color={profile.profileColor ?? "pink"}
        onChange={setTab}
        value={tab || "bio"}
      >
        <Tabs.List justify="center">
          {tabs.map((t) => (
            <Tabs.Tab key={t.id} leftSection={<t.Icon />} value={t.id}>
              {t.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {tabs.map((t) => (
          <Tabs.Panel key={t.id} value={t.id}>
            <t.Component />
          </Tabs.Panel>
        ))}
      </Tabs>
      <pre style={{ marginTop: "500px", whiteSpace: "pre-wrap" }}>
        {JSON.stringify(profile, null, 2)}
      </pre>
    </Stack>
  );
}
