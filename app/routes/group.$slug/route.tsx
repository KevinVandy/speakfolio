import { useMemo, useState } from "react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Link,
  Outlet,
  useMatches,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { MantineProvider, Stack, Tabs, useMantineTheme } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfileFull, profilesTable } from "db/schemas/profilesTable";
import { colorSchemeManager } from "~/root";
import { groupsTable } from "db/schema";

export async function loader(args: LoaderFunctionArgs) {
  const { params } = args;
  const response = new Response();
  const { slug } = params;

  try {
    const { userId: authUserId } = await getAuth(args);

    let group = slug
      ? await db.query.groupsTable.findFirst({
          where: eq(groupsTable.slug, slug),
          with: { profilesToGroups: true },
        })
      : null;

    const userMembership = group?.profilesToGroups.find(
      (ptg) => ptg.userId === authUserId
    );
    const isUserMember = !!userMembership;
    const isUserAdmin = !!(isUserMember && userMembership.isAdmin);

    if (
      !group ||
      (group.visibility === "signed_in_users" && !authUserId) ||
      (group.visibility === "admins_only" && !isUserAdmin) ||
      (group.visibility === "members_only" && !isUserMember)
    ) {
      return redirect("/unknown-group");
    }

    const returnData = {
      ...group,
      isUserMember,
      isUserAdmin,
    };

    return json(returnData, { headers: response.headers });
  } catch (error) {
    console.error(error);
    return redirect("/unknown-profile");
  }
}

export default function ProfileIdPage() {
  const { username } = useParams();
  const matches = useMatches();
  const navigate = useNavigate();

  const theme = useMantineTheme();

  const tabs = useMemo(
    () =>
      [
        {
          Icon: () => <IconUser />,
          id: "_index",
          title: "Overview",
        },
      ].filter(Boolean) as Array<{
        Icon: () => JSX.Element;
        id: string;
        title: string;
      }>,
    []
  );

  const [tab, _setTab] = useState<null | string>(
    () => matches[2]?.id?.split?.(".")?.pop() ?? "_index"
  );

  const setTab = (newTab: null | string) => {
    _setTab(newTab);
    if (newTab === "_index") navigate(`/profile/${username}`);
    else if (newTab && newTab !== tab && tabs.map((t) => t.id).includes(newTab))
      navigate(`/profile/${username}/${newTab}`);
  };

  return (
    <MantineProvider
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="dark"
      theme={{ ...theme, primaryColor: profile.profileColor! }}
    >
      <Stack gap="md">
        <Tabs onChange={setTab} value={tab || "_index"}>
          <Tabs.List justify="center" mb="md">
            {tabs.map((t) => (
              <Tabs.Tab
                // @ts-ignore
                component={Link}
                key={t.id}
                leftSection={<t.Icon />}
                to={`/profile/${username}/${t.id}`.replace(/\/_index$/, "")}
                value={t.id}
              >
                {t.title}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Outlet context={{ setTab }} />
        </Tabs>
        <pre style={{ marginTop: "500px", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(profile, null, 2)}
        </pre>
      </Stack>
    </MantineProvider>
  );
}

export interface IProfileOutletContext {
  setTab: (newTab: null | string) => void;
}
