import { Link, useOutlet } from "@remix-run/react";
import {
  Button,
  Center,
  Pill,
  PillGroup,
  Stack,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import ProfileCareerHistoryTimeline from "./ProfileCareerHistoryTimeline";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export default function ProfileCareerTab() {
  const outlet = useOutlet();
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const theme = useMantineTheme();

  if (isOwnProfile && outlet) {
    return outlet;
  }

  return (
    <Stack justify="center" maw="800px" mx="auto" ta="center">
      {profile.profession ? (
        <Title my="md" order={3}>
          {profile.profession}
        </Title>
      ) : null}
      {profile.areasOfExpertise?.length ? (
        <Stack>
          <Title order={4}>Areas of expertise:</Title>
          <PillGroup maw="600px" mx="auto">
            {profile.areasOfExpertise.map((aoe) => (
              <Pill
                bg={theme.colors[profile.profileColor ?? "pink"][3]}
                c="black"
                key={aoe}
                size="md"
                variant="contrast"
              >
                {aoe}
              </Pill>
            ))}
          </PillGroup>
        </Stack>
      ) : null}
      <ProfileCareerHistoryTimeline />
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
