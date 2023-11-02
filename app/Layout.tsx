import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Button,
  Flex,
  Menu,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Link, useNavigate } from "@remix-run/react";
import type { Session, SupabaseClient } from "@supabase/auth-helpers-remix";
import { IconMoon, IconSun } from "@tabler/icons-react";

interface Props {
  children: React.ReactNode;
  supabase: SupabaseClient;
  session: Session;
}

export const Layout = ({ children, supabase, session }: Props) => {
  const navigate = useNavigate();

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
        collapsed: { mobile: !opened, desktop: true },
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
            {session ? (
              <Menu>
                <Menu.Target>
                  <Avatar />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item>{session.user.email}</Menu.Item>
                  <Menu.Item onClick={() => navigate("/profile")}>
                    Profile
                  </Menu.Item>
                  <Menu.Item onClick={() => supabase.auth.signOut()}>
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Link to="/sign-in">
                <Button>Sign In</Button>
              </Link>
            )}
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
