import { type MetaFunction } from "@remix-run/node";
import { Button, Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Speakerscape" },
    { name: "description", content: "Welcome to Speakerscape!" },
  ];
};

export default function IndexPage() {
  

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
        <SimpleGrid cols={2} spacing="xl" p="md" my="md">
          <Button size="xl" color="blue" onClick={() => {}}>
            Sign up as a Speaker
          </Button>
          <Button size="xl" color="pink" onClick={() => {}}>
            Search for Speakers
          </Button>
        </SimpleGrid>
        <Link to={`/profile`} style={{ display: "grid" }}>
          <Button size="xl" color="pink">
            Go to my Profile
          </Button>
        </Link>
      </Card>
    </Stack>
  );
}
