import { Link } from "@remix-run/react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { Box, Button, Center } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";

export default function ProfileCareerTab() {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  return (
    <div>
      <h1>Career</h1>
      <p>Coming soon...</p>
    </div>
  );
}
