import { type MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  Anchor,
  Button,
  Card,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useRootLoader } from "~/hooks/loaders/useRootLoader";

export const meta: MetaFunction = () => {
  return [
    { title: "Speakfolio" },
    { content: "Welcome to Speakfolio!", name: "description" },
  ];
};

export default function IndexPage() {
  const { authProfile, authUserId } = useRootLoader();

  return (
    <Stack gap="xl" justify="center">
      <Title fz="48pt" order={1} ta="center">
        Speakfolio
      </Title>

      <Card m="auto" maw="720" shadow="xl" withBorder>
        <Title fz="32pt" order={2} ta="center">
          Connecting Speakers and Events
        </Title>
        <Text my="md" size="lg">
          Speakfolio is a platform that connects speakers with events and
          conferences. Whether you're a speaker looking for events, or an event
          looking for speakers, we've got you covered.
        </Text>
        {!authUserId ? (
          <Stack justify="center">
            <SimpleGrid cols={2} my="md" p="md" spacing="xl">
              <Button
                color="blue"
                component={Link}
                onClick={() => {}}
                size="xl"
                to="/sign-up"
              >
                Sign up as a Speaker
              </Button>
              <Button
                color="pink"
                component={Link}
                onClick={() => {}}
                size="xl"
                to="/sign-up"
              >
                Search for Speakers
              </Button>
            </SimpleGrid>
            <Text ta="center">
              Already have an account?{" "}
              <Anchor component={Link} to="/sign-in">
                Sign in
              </Anchor>
              .
            </Text>
          </Stack>
        ) : authProfile ? (
          <Button
            color="pink"
            component={Link}
            size="xl"
            to={`/profile/${authProfile.username}`}
          >
            Go to my Profile
          </Button>
        ) : null}
      </Card>
    </Stack>
  );
}
