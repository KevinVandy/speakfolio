import { useEffect, useState } from "react";
import {
  Form,
  Outlet,
  useMatches,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  Box,
  LoadingOverlay,
  Modal,
  Select,
  Stack,
  Tabs,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconApi,
  IconBrandYoutube,
  IconRss,
  IconSocial,
} from "@tabler/icons-react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { IProfileContentFeed, contentFeedTypes } from "db/schema";

const profileContentFeedSchema = z.object({
  name: z.string(),
  profileId: z.string().uuid(),
  schema: z.string(),
  type: z.enum(contentFeedTypes),
  url: z.string().url(),
  userId: z.string().uuid(),
});

const contentFeedTypeOptions = contentFeedTypes.map((type) => ({
  value: type,
  label: type,
}));

export default function EditProfileContentModal() {
  const navigation = useNavigation();
  const navigate = useNavigate();

  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const [opened, { close, open }] = useDisclosure(false);

  const form = useForm<Partial<IProfileContentFeed & { userId: string }>>({
    initialValues: {
      type: "blog-rss",
      schema: "",
      name: "",
      profileId: profile.id,
      userId: profile.userId!,
    },
    //@ts-ignore
    validationSchema: profileContentFeedSchema,
  });

  const closeEditModal = () => {
    close();
    setTimeout(() => {
      navigate("..");
    }, 500);
  };

  const openConfirmCancelModal = (onConfirm?: () => void) =>
    modals.openConfirmModal({
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { cancel: "Continue Editing", confirm: "Discard" },
      onConfirm: onConfirm ?? closeEditModal,
      title: "Are you sure you want to discard your changes?",
    });

  const handleCancel = () => {
    if (form.isDirty()) {
      openConfirmCancelModal();
    } else {
      closeEditModal();
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
      closeOnClickOutside={!form.isDirty()}
      onClose={handleCancel}
      opened={opened}
      size={"lg"}
      title={"Add External Content Feeds to Your Profile"}
    >
      <Form method="post">
        <input name="profileId" type="hidden" value={profile.id} />
        <input name="userId" type="hidden" value={profile.userId!} />
        <Stack gap="md">
          <Select
            data={contentFeedTypeOptions}
            label="Content Feed Type"
            name="type"
            placeholder="Select a content feed type"
            required
            withAsterisk
            {...form.getInputProps("type")}
          />
        </Stack>
      </Form>
    </Modal>
  );
}

export type EditProfileOutletContext = {
  onCancel: () => void;
  setIsDirty: (isDirty: boolean) => void;
};
