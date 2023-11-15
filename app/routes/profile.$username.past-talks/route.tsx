import { Link } from "@remix-run/react";
import { Box, Button, Center } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export default function ProfilePastTalksTab() {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  return (
    <div>
      <h1>Past Talks</h1>
      <p>Coming soon...</p>
    </div>
  );
}
