import { useEffect, useRef, useState } from "react";
import {
  Outlet,
  useMatches,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  LoadingOverlay,
  Modal,
  Tabs,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { type useForm } from "@mantine/form";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconAdjustments,
  IconBriefcase,
  IconPodium,
  IconPresentation,
  IconSettings,
  IconSocial,
  IconUser,
} from "@tabler/icons-react";
import { type IProfileFull } from "db/schemas/profilesTable";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

const tabs = [
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
    Icon: (props: any) => <IconUser {...props} />,
    id: "bio",
    title: "Bio",
  },
  {
    Icon: (props: any) => <IconBriefcase {...props} />,
    id: "career",
    title: "Career",
  },
  {
    Icon: (props: any) => <IconPodium {...props} />,
    id: "past-talks",
    title: "Past Talks",
  },
  {
    Icon: (props: any) => <IconPresentation {...props} />,
    id: "prepared-talks",
    title: "Prepared Talks",
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

  const [tab, setTab] = useState<string>(
    () => matches.pop()?.id?.split?.(".")?.pop() ?? "customization"
  );

  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const [opened, { close, open }] = useDisclosure(false);

  const formRef = useRef<ReturnType<
    typeof useForm<Partial<IProfileFull>>
  > | null>(null);
  const form = formRef.current;

  const closeEditModal = () => {
    close();
    setTimeout(() => navigate(".."), 500);
  };

  const openConfirmCancelModal = (onConfirm?: () => void) =>
    modals.openConfirmModal({
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { cancel: "Continue Editing", confirm: "Discard" },
      onConfirm: onConfirm ?? closeEditModal,
      title: "Are you sure you want to discard your changes?",
    });

  const handleCancel = () => {
    if (form?.isDirty()) {
      openConfirmCancelModal();
    } else {
      closeEditModal();
    }
  };

  useEffect(() => {
    if (!profile || !isOwnProfile) {
      navigate("..");
    } else {
      open();
    }
  }, []);

  useEffect(() => {
    if (tab) navigate(tab);
  }, [tab]);

  return (
    <Modal
      closeOnClickOutside={!form?.isDirty()}
      onClose={handleCancel}
      opened={opened}
      size={"960px"}
      title={"Edit Your Speakfolio"}
    >
      <Tabs
        color={
          form?.getTransformedValues().profileColor ??
          profile.profileColor ??
          "pink"
        }
        mih="400px"
        my="md"
        onChange={(newTab) => setTab(newTab!)}
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
                      ? theme.colors[
                          form?.getTransformedValues().profileColor ??
                            profile.profileColor ??
                            "pink"
                        ][8]
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
        {tabs.map((t) => (
          <Tabs.Panel
            key={t.id}
            px={!isMobile ? "lg" : undefined}
            py={isMobile ? "md" : undefined}
            value={t.id}
          >
            <Outlet context={{ formRef, onCancel: handleCancel }} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Modal>
  );
}

export type EditProfileOutletContext = {
  formRef: React.MutableRefObject<ReturnType<
    typeof useForm<Partial<IProfileFull>>
  > | null>;
  onCancel: () => void;
};
