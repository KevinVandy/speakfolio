import { Link, useOutlet } from "@remix-run/react";
import { Box, Button, Center } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export default function ProfilePresentationPage() {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const outlet = useOutlet();

  if (isOwnProfile && outlet) {
    return outlet;
  }

  return (
    <div>
      <h1>Presentation</h1>
      <p>Coming soon...</p>
    </div>
  );
}
