import { useState } from "react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useParams, useSearchParams } from "@remix-run/react";
import {
  ActionIcon,
  Avatar,
  BackgroundImage,
  Flex,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandMedium,
  IconBrandTiktok,
  IconBrandTwitch,
  IconBrandTwitter,
  IconBrandX,
  IconBrandYoutube,
  IconEdit,
  IconMapPin,
} from "@tabler/icons-react";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfileFull, profilesTable } from "db/schemas/profilesTable";
import { useFetchProfile } from "~/hooks/queries/useFetchProfile";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

const linkIconMap = {
  Facebook: <IconBrandFacebook color="#4267B2" />,
  GitHub: <IconBrandGithub color="#333" />,
  Instagram: <IconBrandInstagram color="#E1306C" />,
  LinkedIn: <IconBrandLinkedin color="#0077B5" />,
  Medium: <IconBrandMedium color="#000" />,
  Other: <IconBrandX color="#000" />,
  TikTok: <IconBrandTiktok color="#000" />,
  Twitch: <IconBrandTwitch color="#9146FF" />,
  Twitter: <IconBrandTwitter color="#1DA1F2" />,
  YouTube: <IconBrandYoutube color="#FF0000" />,
} as Record<string, React.ReactNode>;

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

export default function ProfileIdPage() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  const { data: profile } = useFetchProfile({ username });
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
      <BackgroundImage
        pos="relative"
        radius="sm"
        src={profile.coverImageUrl ?? ""}
      >
        <Tooltip label="Edit Your Profile">
          <ActionIcon
            component={Link}
            pos="absolute"
            right={10}
            to="edit"
            top={10}
          >
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Flex align="flex-end" mih="200px" ml="lg">
          <Avatar
            color={profile.profileColor ?? "blue"}
            radius="100%"
            size="160px"
            src={profile.profileImageUrl ?? ""}
            style={{ transform: "translateY(72px)" }}
            variant="filled"
          />
        </Flex>
      </BackgroundImage>
      <Flex justify="space-between">
        <Flex mt="-8px">
          <Title ml="190px" order={2}>
            {profile.name}
          </Title>
          {profile.location ? (
            <Flex align="center" c="dimmed" gap="4px" pl="md">
              <IconMapPin />
              <Text c="dimmed" size="xl">
                {profile.location}
              </Text>
            </Flex>
          ) : null}
        </Flex>
        <Flex>
          {profile.links?.map((link) => (
            <Tooltip key={link.site} label={link.title || link.site}>
              <a href={link.url} rel="noreferrer" target="_blank">
                <ActionIcon color="none" variant="transparent">
                  {linkIconMap[link.site!]}
                </ActionIcon>
              </a>
            </Tooltip>
          ))}
        </Flex>
      </Flex>
      <Title fw="normal" my="md" order={3} size="lg" ta="center">
        {profile.headline}
      </Title>
      <Tabs
        color={profile.profileColor ?? "pink"}
        onChange={setTab}
        value={tab || "bio"}
      >
        <Tabs.List justify="center">
          <Tabs.Tab value="bio">Bio</Tabs.Tab>
          <Tabs.Tab value="career">Career</Tabs.Tab>
          <Tabs.Tab value="past-talks">Past Talks</Tabs.Tab>
          <Tabs.Tab value="prepared-talks">Prepared Talks</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="bio">
          <pre style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}>
            {profile.bio?.plainText}
          </pre>
        </Tabs.Panel>
        <Tabs.Panel value="career">Career</Tabs.Panel>
        <Tabs.Panel value="past-talks">Past Talks</Tabs.Panel>
        <Tabs.Panel value="prepared-talks">Prepared Talks</Tabs.Panel>
      </Tabs>

      <pre style={{ marginTop: "500px", whiteSpace: "pre-wrap" }}>
        {JSON.stringify(profile, null, 2)}
      </pre>
    </Stack>
  );
}
