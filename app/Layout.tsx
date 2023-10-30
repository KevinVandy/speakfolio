import { UserButton } from "@clerk/remix";
import {
  ActionIcon,
  AppShell,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  return (
    <AppShell
      header={{ height: 60 }}
      // navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header p="sm">
        <div className="flex justify-between w-full">
          <Title order={1}>Speakerscape</Title>
          <div className="flex gap-4 items-center">
            <ActionIcon
              onClick={() =>
                setColorScheme(
                  computedColorScheme === "light" ? "dark" : "light"
                )
              }
              variant="default"
              size="xl"
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun  />
              ) : (
                <IconMoon  />
              )}
            </ActionIcon>
            <UserButton />
          </div>
        </div>
      </AppShell.Header>
      {/* <AppShell.Navbar p="md">Navbar</AppShell.Navbar> */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
