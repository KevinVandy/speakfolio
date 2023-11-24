import { Link, useOutlet } from "@remix-run/react";
import { Button, Stack } from "@mantine/core";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export default function ProfilePresentationsTab() {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const outlet = useOutlet();

  if (isOwnProfile && outlet) {
    return outlet;
  }

  return (
    <Stack>
      <Button component={Link} leftSection={<IconPlus />} to="new/edit">
        Create New Presentation
      </Button>
    </Stack>
  );
}
