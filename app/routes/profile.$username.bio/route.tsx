import { Link, useOutlet } from "@remix-run/react";
import { Box, Button, Center } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import xss from "xss";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { xssOptions } from "~/util/xssOptions";

export default function ProfileBioTab() {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const dirtyBio = profile.bio?.richText || "";
  const cleanBio = xss(dirtyBio, xssOptions);

  const outlet = useOutlet();

  if (isOwnProfile && outlet) {
    return outlet;
  }

  return (
    <>
      {profile.bio?.richText ? (
        <Box
          className="rich-markup"
          dangerouslySetInnerHTML={{ __html: cleanBio }}
        />
      ) : (
        <p>No bio yet.</p>
      )}{" "}
      {isOwnProfile && (
        <Center>
          <Button
            component={Link}
            leftSection={<IconEdit size="10pt" />}
            size="xs"
            to={`edit`}
            variant="subtle"
          >
            Edit Bio
          </Button>
        </Center>
      )}
    </>
  );
}
