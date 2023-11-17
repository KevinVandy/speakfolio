import { useEffect, useState } from "react";
import {
  Outlet,
  useMatches,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  Box,
  LoadingOverlay,
  Modal,
  Tabs,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconAdjustments,
  IconPhoto,
  IconSettings,
  IconSocial,
} from "@tabler/icons-react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

const tabs = [
  {
    Icon: (props: any) => <IconPhoto {...props} />,
    id: "pictures",
    title: "Profile Pictures",
  },
  {
    Icon: (props: any) => <IconAdjustments {...props} />,
    id: "customization",
    title: "Profile Customization",
  },
  {
    Icon: (props: any) => <IconSocial {...props} />,
    id: "links",
    title: "Social Links",
  },
  {
    Icon: (props: any) => <IconSettings {...props} />,
    id: "settings",
    title: "Account Settings",
  },
];

export default function EditProfileModal() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const navigation = useNavigation();
  const navigate = useNavigate();
  const matches = useMatches();

  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const [opened, { close, open }] = useDisclosure(false);
  const [isDirty, setIsDirty] = useState(false);
  const [tab, _setTab] = useState<string>(() => {
    const path = matches[3]?.id?.split?.(".")?.pop() ?? "pictures";
    if (tabs.map((t) => t.id).includes(path)) return path;
    return "pictures";
  });

  const closeEditModal = () => {
    close();
    setTimeout(() => navigate(`/profile/${profile?.username}`), 500);
  };

  const openConfirmCancelModal = (onConfirm?: () => void) =>
    modals.openConfirmModal({
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { cancel: "Continue Editing", confirm: "Discard" },
      onConfirm: onConfirm ?? closeEditModal,
      title: "Are you sure you want to discard your changes?",
    });

  const handleCancel = () => {
    if (isDirty) {
      openConfirmCancelModal();
    } else {
      closeEditModal();
    }
  };

  const navigateTab = (newTab: string) => {
    _setTab(newTab);
    navigate(`/profile/${profile?.username}/edit/${newTab}`);
  };

  const setTab = (newTab: null | string) => {
    if (!newTab) return;
    if (isDirty) {
      openConfirmCancelModal(() => navigateTab(newTab));
    } else {
      navigateTab(newTab);
    }
  };

  useEffect(() => {
    if (!isOwnProfile) {
      navigate(`/profile/${profile?.username}`);
    } else {
      open();
    }
  }, []);

  return (
    <Modal
      closeOnClickOutside={!isDirty}
      onClose={handleCancel}
      opened={opened}
      size={"xl"}
      title={"Customize Your Speakfolio"}
    >
      <Tabs
        color={profile.profileColor!}
        mih="400px"
        my="md"
        onChange={setTab as any}
        orientation={isMobile ? "horizontal" : "vertical"}
        pos="relative"
        value={tab ?? "customization"}
      >
        <LoadingOverlay visible={navigation.state === "submitting"} />
        <Tabs.List>
          {tabs.map((t) => (
            <Tabs.Tab
              key={t.id}
              leftSection={
                <t.Icon
                  color={
                    t.id === tab
                      ? theme.colors[profile.profileColor!][8]
                      : undefined
                  }
                />
              }
              miw={!isMobile ? "220px" : undefined}
              value={t.id}
              {...(t.id === "settings" && {
                bottom: 0,
                pos: "absolute",
              })}
            >
              {t.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Box
          display="grid"
          px={!isMobile ? "lg" : undefined}
          py={isMobile ? "md" : undefined}
          w="100%"
        >
          <Outlet context={{ onCancel: handleCancel, setIsDirty }} />
        </Box>
      </Tabs>
    </Modal>
  );
}

export type EditProfileOutletContext = {
  onCancel: () => void;
  setIsDirty: (isDirty: boolean) => void;
};
