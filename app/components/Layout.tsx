import { Link, useNavigate } from "@remix-run/react";
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
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useSupabase } from "../hooks/useSupabase";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const navigate = useNavigate();

  const { session, supabase, loggedInUserProfile } = useSupabase();

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
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
        width: 300,
      }}
      padding="md"
    >
      <AppShell.Header p="0">
        <Flex justify="space-between" p="md" w="100%">
          <Flex>
            <Burger
              display={isMobile ? "block" : "none"}
              onClick={toggle}
              opened={opened}
            />
            <Link style={{ textDecoration: "none" }} to="/">
              <Title fz="xl" lh="xs" m="0" order={1}>
                Speakerscape
              </Title>
            </Link>
          </Flex>
          <Flex align="center" gap="md">
            <ActionIcon
              aria-label="Toggle color scheme"
              onClick={() =>
                setColorScheme(
                  computedColorScheme === "light" ? "dark" : "light"
                )
              }
              size="lg"
              variant="default"
            >
              {colorScheme === "dark" ? <IconSun /> : <IconMoon />}
            </ActionIcon>
            {session?.user ? (
              <Menu trigger="hover">
                <Menu.Target>
                  <Avatar src={loggedInUserProfile?.profileImageUrl} />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item>{session.user.email}</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    onClick={() =>
                      navigate(`/profile/${loggedInUserProfile?.username}`)
                    }
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      navigate(`/profile/${loggedInUserProfile?.username}/edit`)
                    }
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
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
