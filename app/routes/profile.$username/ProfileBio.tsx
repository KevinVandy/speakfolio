import { Link } from "@remix-run/react";
import { Box, Button, Center } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import xss from "xss";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export function ProfileBio() {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const dirtyBio = profile.bio?.richText || "";
  const cleanBio = xss(dirtyBio);

  return (
    <>
      {profile.bio?.richText ? (
        <Box dangerouslySetInnerHTML={{ __html: cleanBio }} />
      ) : (
        "No bio yet."
      )}{" "}
      {isOwnProfile && (
        <Center>
          <Button
            component={Link}
            leftSection={<IconEdit size="10pt" />}
            size="xs"
            to="edit/bio"
            variant="subtle"
          >
            Edit Bio
          </Button>
        </Center>
      )}
    </>
  );
}
