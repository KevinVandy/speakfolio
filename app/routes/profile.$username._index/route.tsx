import { Link, useOutlet } from "@remix-run/react";
import { Button, Center, TypographyStylesProvider } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import xss from "xss";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { xssOptions } from "~/util/xssOptions";

export default function ProfileBioTab() {
  const outlet = useOutlet();
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const dirtyBio = profile.bio?.bio || "";
  const cleanBio = xss(dirtyBio, xssOptions);

  if (isOwnProfile && outlet) {
    return outlet;
  }

  return (
    <>
      {profile.bio?.bio ? (
        <TypographyStylesProvider
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
            to={`bio/edit`}
            variant="subtle"
          >
            Edit Bio
          </Button>
        </Center>
      )}
    </>
  );
}
