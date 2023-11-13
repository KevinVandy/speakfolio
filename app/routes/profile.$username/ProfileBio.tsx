import { Link } from "@remix-run/react";
import { ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export function ProfileBio() {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  return (
    <pre style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}>
      {profile.bio?.richText ? (
        <Box dangerouslySetInnerHTML={{ __html: profile.bio.richText }} />
      ) : (
        "No bio yet."
      )}{" "}
      {isOwnProfile && (
        <Tooltip label="Edit Your Bio">
          <ActionIcon
            component={Link}
            size="xs"
            style={{ transform: "translateY(6px)" }}
            to="edit?tab=bio"
          >
            <IconEdit />
          </ActionIcon>
        </Tooltip>
      )}
    </pre>
  );
}
