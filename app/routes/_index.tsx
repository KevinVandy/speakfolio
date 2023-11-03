import { type MetaFunction } from "@remix-run/node";
import {
  Anchor,
  Button,
  Card,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { useSupabase } from "~/hooks/useSupabase";
import { db } from "db/connection";
import { profiles } from "db/schemas/profiles";

export const meta: MetaFunction = () => {
  return [
    { title: "Speakerscape" },
    { name: "description", content: "Welcome to Speakerscape!" },
  ];
};

export async function loader() {
  const result = await db.select().from(profiles);
  console.log(result);
  return {};
}

export default function IndexPage() {
  const { session } = useSupabase();

  return (
    <Stack justify="center" gap="xl">
      <Title ta="center" order={1} fz="48pt">
        Speakerscape
      </Title>

      <Card withBorder shadow="xl" m="auto" maw="720">
        <Title ta="center" fz="32pt" order={2}>
          Connecting Speakers and Events
        </Title>
        <Text my="md" size="lg">
          Speakerscape is a platform that connects speakers with events and
          conferences. Whether you're a speaker looking for events, or an event
          looking for speakers, we've got you covered.
        </Text>
        {!session ? (
          <Stack justify="center">
            <SimpleGrid cols={2} spacing="xl" p="md" my="md">
              <Button
                to="/sign-up"
                component={Link}
                size="xl"
                color="blue"
                onClick={() => {}}
              >
                Sign up as a Speaker
              </Button>
              <Button
                component={Link}
                to="/sign-up"
                size="xl"
                color="pink"
                onClick={() => {}}
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
        ) : (
          <Button component={Link} to="/profile" size="xl" color="pink">
            Go to my Profile
          </Button>
        )}
      </Card>
    </Stack>
  );
}
