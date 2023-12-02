import { Link, useNavigate } from "@remix-run/react";
import { useAuth } from "@clerk/remix";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Flex,
  Menu,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useRootLoader } from "~/hooks/loaders/useRootLoader";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const navigate = useNavigate();

  const { authProfile, authUser } = useRootLoader();
  const { isSignedIn, signOut } = useAuth();

  

  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={{
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
        width: 300,
      }}
      padding="md"
    >
      <AppShell.Header
        style={{
          alignItems: "center",
          display: "flex",
          opacity: 0.9,
        }}
      >
        <Flex align="center" justify="space-between" p="sm" w="100%">
          <Flex>
            <Burger
              display={isMobile ? "block" : "none"}
              onClick={toggle}
              opened={opened}
            />
            <Link style={{ textDecoration: "none" }} to="/">
              <Text
                c="pink"
                component="h1"
                fz="xl"
                gradient={{
                  from: "pink",
                  to: authProfile?.profileColor ?? "blue",
                }}
                lh="xs"
                m="0"
                variant="gradient"
              >
                Speakfolio
              </Text>
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
            {isSignedIn ? (
              <Menu trigger="hover">
                <Menu.Target>
                  <Avatar src={authProfile?.profileImageUrl} />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item>
                    {authProfile?.name ??
                      `${authUser?.firstName} ${authUser?.lastName}`}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    onClick={() =>
                      navigate(`/profile/${authProfile?.username}`)
                    }
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      navigate(`/profile/${authProfile?.username}/settings`)
                    }
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    onClick={() => {
                      signOut();
                      navigate("/");
                    }}
                  >
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
      <Box component="footer" mt="200px" p="md">
        © {new Date().getFullYear()} Kevin Van Cott{" "}
      </Box>
    </AppShell>
  );
};
