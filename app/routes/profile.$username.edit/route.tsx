import { useEffect, useState } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import {
  Button,
  LoadingOverlay,
  Modal,
  SimpleGrid,
  Tabs,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
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
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { linkSites, profileLinksTable } from "db/schema";
import { profileBiosTable } from "db/schemas/profileBiosTable";
import {
  type IProfileFull,
  profileColors,
  profilesTable,
} from "db/schemas/profilesTable";
import { EditProfileBioFieldset } from "./EditProfileBio";
import { EditProfileCareerFieldset } from "./EditProfileCareer";
import { EditProfileCustomizationFieldset } from "./EditProfileCustomization";
import { EditProfileLinksFieldset } from "./EditProfileLinks";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { transformDotNotation } from "~/util/transformDotNotation";
import xss from "xss";

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

const profileSchema = z.object({
  areasOfExpertise: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  bio: z
    .object({
      plainText: z
        .string()
        .max(4000, { message: "Bio max 4000 characters" })
        .optional()
        .nullish(),
      richText: z
        .string()
        .max(6000, { message: "Bio max 6000 characters" })
        .optional()
        .nullish(),
    })
    .optional()
    .nullish(),
  company: z
    .string()
    .max(100, { message: "Company name max 100 characters" })
    .optional()
    .nullish(),
  contactEmail: z
    .union([
      z.string().email({ message: "Contact email is not a valid email" }),
      z.string().length(0),
    ])
    .optional()
    .nullish(),
  coverImageUrl: z
    .union([
      z.string().url({ message: "Cover Photo must be a valid URL" }),
      z.string().length(0),
    ])
    .optional()
    .nullish()
    .transform((s) => s || null),
  headline: z
    .string()
    .max(100, { message: "Headline max 100 characters" })
    .optional()
    .nullish(),
  id: z.string().uuid(),
  jobTitle: z
    .string()
    .max(100, { message: "Job Title max 100 characters" })
    .optional()
    .nullish(),
  links: z
    .array(
      z.object({
        site: z.enum(linkSites),
        title: z
          .string()
          .max(100, { message: "Link label max 100 characters" })
          .optional()
          .nullish(),
        url: z
          .string()
          .url({ message: "Link URL must be a valid URL" })
          .max(100, { message: "Link URL max 100 characters" }),
      })
    )
    .optional()
    .nullish(),
  location: z
    .string()
    .max(100, { message: "Location max 100 characters" })
    .optional()
    .nullish(),
  name: z.string().min(1, { message: "Display Name is required" }),
  profession: z
    .string()
    .max(100, { message: "Profession max 100 characters" })
    .optional()
    .nullish(),
  profileColor: z.enum(profileColors),
  profileImageUrl: z
    .union([
      z.string().url({ message: "Profile Image must be a valid URL" }),
      z.string().length(0),
    ])
    .optional()
    .nullish()
    .transform((s) => s || null),
  userId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  let returnData: ProfileUpdateResponse = {
    data: {},
    errors: {},
    success: false,
  };

  //get data from form
  const rawData = transformDotNotation(
    Object.fromEntries(await request.formData())
  );

  //validate data
  const validationResult = profileSchema.safeParse(rawData);
  const { success } = validationResult;
  if (!success) {
    const errors = validationResult.error.formErrors.fieldErrors;
    returnData = { ...returnData, data: rawData, errors, success };
    return json(returnData, { status: 422 });
  }
  const { data } = validationResult;

  //validate auth
  const authUser = await supabase.auth.getUser();
  if (!authUser || authUser.data.user?.id !== data.userId) {
    return redirect("/sign-in");
  }

  //update profile
  try {
    //TODO: update profile and profileBios in a transaction
    await db
      .update(profilesTable)
      .set({
        areasOfExpertise: data.areasOfExpertise,
        company: data.company,
        contactEmail: data.contactEmail,
        coverImageUrl: data.coverImageUrl,
        headline: data.headline,
        jobTitle: data.jobTitle,
        location: data.location,
        name: data.name,
        profession: data.profession,
        profileColor: data.profileColor,
        profileImageUrl: data.profileImageUrl,
      })
      .where(eq(profilesTable.id, data.id));
    if (data.bio?.richText) {
      const cleanBio = xss(data.bio.richText);
      await db
        .update(profileBiosTable)
        .set({ richText: cleanBio })
        .where(eq(profileBiosTable.profileId, data.id));
    }
    await db
      .delete(profileLinksTable)
      .where(eq(profileLinksTable.profileId, data.id));
    if (data.links?.length) {
      await db
        .insert(profileLinksTable)
        .values(data.links.map((link) => ({ ...link, profileId: data.id })));
    }
    return redirect("..");
  } catch (error) {
    console.error(error);
    returnData = {
      ...returnData,
      data,
      errors: {
        form: "Error updating profile",
      },
      success: false,
    };
    return json(returnData, { status: 422 });
  }
}

interface StepProps {
  form: ReturnType<typeof useForm<IProfileFull>>;
}

const tabs = [
  {
    Component: (props: StepProps) => (
      <EditProfileCustomizationFieldset {...props} />
    ),
    Icon: (props: any) => <IconAdjustments {...props} />,
    id: "customization",
    title: "Profile Customization",
  },
  {
    Component: (props: StepProps) => <EditProfileLinksFieldset {...props} />,
    Icon: (props: any) => <IconSocial {...props} />,
    id: "links",
    title: "Social Links",
  },
  {
    Component: (props: StepProps) => <EditProfileBioFieldset {...props} />,
    Icon: (props: any) => <IconUser {...props} />,
    id: "bio",
    title: "Bio",
  },
  {
    Component: (props: StepProps) => <EditProfileCareerFieldset {...props} />,
    Icon: (props: any) => <IconBriefcase {...props} />,
    id: "career",
    title: "Career",
  },
  {
    Component: (props: StepProps) => "hello",
    Icon: (props: any) => <IconPodium {...props} />,
    id: "past-talks",
    title: "Past Talks",
  },
  {
    Component: (props: StepProps) => "hello",
    Icon: (props: any) => <IconPresentation {...props} />,
    id: "prepared-talks",
    title: "Prepared Talks",
  },
  {
    Component: (props: StepProps) => null,
    Icon: (props: any) => <IconSettings {...props} />,
    id: "settings",
    title: "Account Settings",
  },
];

export default function EditProfileModal() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  const form = useForm<IProfileFull>({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileSchema),
  });

  const initialCurrentStep = searchParams.get("tab");
  const [tab, _setTab] = useState(initialCurrentStep);
  const setTab = (newStep: null | string) => {
    _setTab(newStep);
    const url = new URL(window.location.href);
    if (newStep) {
      url.searchParams.set("tab", newStep);
    }
    window.history.replaceState({}, "", url.toString());
  };

  const [opened, { close, open }] = useDisclosure(false);

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
    if (form.isDirty()) {
      openConfirmCancelModal();
    } else {
      closeEditModal();
    }
  };

  useEffect(() => {
    if (!profile || !isOwnProfile) {
      return navigate("../");
    } else {
      open();
    }
    if (!tab) {
      setTab("customization");
    }
  }, []);

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

  return (
    <Modal
      closeOnClickOutside={!form.isDirty()}
      onClose={handleCancel}
      opened={opened}
      size={tab === "bio" ? "clamp(800px, 80vw, 960px)" : "xl"}
      title={"Edit Your Speakfolio"}
    >
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <input name="id" type="hidden" value={profile.id} />
        <input name="userId" type="hidden" value={profile.userId!} />
        <Tabs
          color={form.getTransformedValues().profileColor ?? "pink"}
          mih="400px"
          my="md"
          onChange={(newTab) => newTab !== "settings" && setTab(newTab)}
          orientation={isMobile ? "horizontal" : "vertical"}
          pos="relative"
          value={tab || "bio"}
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
                            form.getTransformedValues().profileColor ?? "pink"
                          ][8]
                        : undefined
                    }
                  />
                }
                miw={!isMobile ? "220px" : undefined}
                value={t.id}
                {...(t.id === "settings" && {
                  bottom: 0,
                  onClick: () => {
                    if (form.isDirty()) {
                      openConfirmCancelModal(() => navigate("../settings"));
                    } else {
                      navigate("../settings");
                    }
                  },
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
              <t.Component form={form} />
              {Object.values(form.errors).map((error, i) => (
                <Text c="red" key={i}>
                  {error}
                </Text>
              ))}
              <SimpleGrid
                bg="inherit"
                bottom={0}
                cols={2}
                mt="xl"
                p="2px"
                pos="sticky"
                w="100%"
              >
                <Button onClick={handleCancel} type="button" variant="default">
                  Cancel
                </Button>
                <Button
                  color="blue"
                  disabled={!form.isDirty()}
                  loading={navigation.state === "submitting"}
                  type="submit"
                >
                  Save Changes
                </Button>
              </SimpleGrid>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Form>
    </Modal>
  );
}
