import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/remix";
import {
  ActionIcon,
  AppShell,
  Burger,
  Flex,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Link } from "@remix-run/react";
import { IconMoon, IconSun } from "@tabler/icons-react";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened || isMobile },
      }}
      padding="md"
    >
      <AppShell.Header p="0">
        <Flex justify="space-between" w="100%" p="md">
          <Flex>
            <Burger
              display={isMobile ? "block" : "none"}
              opened={opened}
              onClick={toggle}
            />
            <Link to="/" style={{ textDecoration: "none" }}>
              <Title m="0" lh="xs" fz="xl" order={1}>
                Speakerscape
              </Title>
            </Link>
          </Flex>
          <Flex gap="md" align="center">
            <ActionIcon
              onClick={() =>
                setColorScheme(
                  computedColorScheme === "light" ? "dark" : "light"
                )
              }
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? <IconSun /> : <IconMoon />}
            </ActionIcon>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </Flex>
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>
      <AppShell.Main
        styles={{
          main: {
            margin: "0 auto",
            maxWidth: 1200,
          },
        }}
      >
        {children}
      </AppShell.Main>
      <AppShell.Footer p="md">Footer</AppShell.Footer>
    </AppShell>
  );
};
