import { useEffect } from "react";
import { Link } from "@remix-run/react";
import {
  ActionIcon,
  Alert,
  Anchor,
  Avatar,
  BackgroundImage,
  Collapse,
  Flex,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
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
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export function ProfileHead() {
  const { colorScheme } = useMantineColorScheme();
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const [isAlertVisible, setIsAlertVisible] = useSessionStorage({
    defaultValue: false,
    key: "profileVisibilityAlert",
  });

  useEffect(() => {
    const storedAlertVisibility = sessionStorage.getItem(
      "profileVisibilityAlert"
    );
    if (
      isOwnProfile &&
      profile.visibility !== "public" &&
      storedAlertVisibility !== "false"
    ) {
      setIsAlertVisible(true);
    }
  }, []);

  const linkIconMap = {
    Facebook: <IconBrandFacebook color="#4267B2" />,
    GitHub: (
      <IconBrandGithub color={colorScheme === "light" ? "#333" : "#bbb"} />
    ),
    Instagram: <IconBrandInstagram color="#E1306C" />,
    LinkedIn: <IconBrandLinkedin color="#0077B5" />,
    Medium: (
      <IconBrandMedium color={colorScheme === "light" ? "#000" : "#fff"} />
    ),
    Other: <IconBrandX color={colorScheme === "light" ? "#000" : "#fff"} />,
    TikTok: (
      <IconBrandTiktok color={colorScheme === "light" ? "#000" : "#fff"} />
    ),
    Twitch: <IconBrandTwitch color="#9146FF" />,
    Twitter: <IconBrandTwitter color="#1DA1F2" />,
    YouTube: <IconBrandYoutube color="#FF0000" />,
  } as Record<string, React.ReactNode>;

  return (
    <>
      {profile.isOwnProfile && profile.visibility !== "public" ? (
        <Collapse in={isAlertVisible}>
          <>
            {profile.visibility === "private" ? (
              <Alert
                color="orange"
                onClose={() => setIsAlertVisible(false)}
                title="Your profile is currently private."
                withCloseButton
              >
                Only you can see it. You can change your{" "}
                <Anchor component={Link} to="edit/settings">
                  visibility settings here
                </Anchor>
              </Alert>
            ) : (
              <Alert
                color="blue"
                onClose={() => setIsAlertVisible(false)}
                title="Your profile is hidden from search engines."
                withCloseButton
              >
                Only you and other logged in Speakfolio users can see it. You
                can change your{" "}
                <Anchor component={Link} to="edit/settings">
                  visibility settings here
                </Anchor>
              </Alert>
            )}
          </>
        </Collapse>
      ) : null}
      <BackgroundImage
        pos="relative"
        radius="sm"
        src={profile.coverImageUrl ?? ""}
      >
        {isOwnProfile && (
          <Tooltip label="Edit Your Profile">
            <ActionIcon
              component={Link}
              pos="absolute"
              right={10}
              to={`/profile/${profile.username}/edit/customization`}
              top={10}
            >
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        )}
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
        <Flex gap="4px">
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
      <Title fs="italic" fw="normal" my="md" order={3} size="xl" ta="center">
        {profile.headline}
      </Title>
    </>
  );
}
