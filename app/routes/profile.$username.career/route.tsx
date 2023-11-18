import { Link, useOutlet } from "@remix-run/react";
import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export default function ProfileCareerTab() {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;
  
  const outlet = useOutlet();

  if (isOwnProfile && outlet) {
    return outlet;
  }

  return (
    <Stack justify="center">
      <Title mt="xl" ta="center">
        {profile.profession}
      </Title>
      <Text ta="center">{profile.areasOfExpertise}</Text>
      {isOwnProfile && (
        <Center>
          <Button
            component={Link}
            leftSection={<IconEdit size="10pt" />}
            size="xs"
            to={`edit`}
            variant="subtle"
          >
            Edit Career
          </Button>
        </Center>
      )}
    </Stack>
  );
}
