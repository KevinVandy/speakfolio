import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { OrganizationList, UserProfile } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { dark } from "@clerk/themes";
import { Flex } from "@mantine/core";
import { useRootLoader } from "~/hooks/loaders/useRootLoader";
import { colorSchemeManager } from "~/root";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("..");
  }
  return {};
}

export default function ProfileSettingsTab() {
  const colorScheme = colorSchemeManager.get("auto");
  const { authUser } = useRootLoader();

  return (
    <Flex justify="center">
      <OrganizationList
        hidePersonal
        appearance={{
          baseTheme: colorScheme === "dark" ? dark : undefined,
        }}
        path={`/profile/${authUser?.username}/organizations`}
        // routing="virtual"
      >
        {/* <UserProfile.Page
          label="Profile Pictures"
          labelIcon={<IconPhoto />}
          url="pictures"
        >
          <EditProfilePicturesTab />
        </UserProfile.Page>
        <UserProfile.Page
          label="Customization"
          labelIcon={<IconAdjustments />}
          url="customization"
        >
          <EditProfileCustomizationTab />
        </UserProfile.Page>
        <UserProfile.Page
          label="Social Links"
          labelIcon={<IconSocial />}
          url="links"
        >
          <EditProfileLinksTab />
        </UserProfile.Page> */}
      </OrganizationList>
    </Flex>
  );
}
