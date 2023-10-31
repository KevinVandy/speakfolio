import { json } from "@remix-run/node";
import { type DataFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useClerk,
} from "@clerk/remix";
import {
  Button,
  Card,
  Flex,
  Grid,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { getAuth } from "@clerk/remix/ssr.server";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Speakerscape" },
    { name: "description", content: "Welcome to Speakerscape!" },
  ];
};

// export const loader = async (args: DataFunctionArgs) => {
//   const { user, userId } = await getAuth(args);
//   return json({ user, userId });
// };

export default function IndexPage() {
  const { isLoaded, userId } = useAuth();
  const { openSignIn, openSignUp } = useClerk();

  console.log(isLoaded, userId);

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
        <SignedOut>
          <SimpleGrid cols={2} spacing="xl" p="md" my="md">
            <Button
              size="xl"
              color="blue"
              onClick={() => {
                openSignUp();
              }}
            >
              Sign up as a Speaker
            </Button>
            <Button
              size="xl"
              color="pink"
              onClick={() => {
                openSignUp();
              }}
            >
              Search for Speakers
            </Button>
          </SimpleGrid>
        </SignedOut>
        <SignedIn>
          <Link to={`/profile`} style={{display: 'grid'}}>
            <Button size="xl" color="pink">
              Go to my Profile
            </Button>
          </Link>
        </SignedIn>
      </Card>
    </Stack>
  );
}
