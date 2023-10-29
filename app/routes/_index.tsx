import type { MetaFunction } from "@remix-run/node";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
} from "@clerk/remix";
import { Text, Title } from "@mantine/core";

export const meta: MetaFunction = () => {
  return [
    { title: "Speakerscape" },
    { name: "description", content: "Welcome to Speakerscape!" },
  ];
};

export default function Index() {
  return (
    <div>
      <SignedIn>
        <Title order={1}>Index route</Title>
        <Text>You are signed in!</Text>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}
