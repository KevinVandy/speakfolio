import { type ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import {
  Accordion,
  Autocomplete,
  Avatar,
  BackgroundImage,
  Button,
  Center,
  Collapse,
  Fieldset,
  Flex,
  Group,
  Modal,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconAt, IconCircle, IconLock } from "@tabler/icons-react";
import { z } from "zod";
import { type loader } from "./profile.$username";
import { useSupabase } from "~/hooks/useSupabase";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { profilesTable } from "db/schemas/profiles";

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

const profileSchema = z.object({
  bio: z
    .string()
    .max(4000, { message: "Max 4000 characters" })
    .optional()
    .nullish(),
  company: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  contactEmail: z
    .string()
    .email({ message: "Please enter a valid email" })
    .optional(),
  coverImageUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .nullish(),
  displayName: z.string().min(1, { message: "Display Name is required" }),
  headline: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  jobTitle: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  profession: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  profileColor: z.string().optional(),
  profileImageUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .nullish(),
});

export async function action({ request }: ActionFunctionArgs) {
  console.log("action");
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  let returnData: ProfileUpdateResponse = {
    data: {},
    errors: {},
    success: false,
  };

  const rawData = Object.fromEntries(await request.formData());
  console.log("raw", rawData);

  const validationResult = profileSchema.safeParse(rawData);
  const { success } = validationResult;
  if (!success) {
    const errors = validationResult.error.formErrors.fieldErrors;
    returnData = { ...returnData, data: rawData, errors, success };
    return json(returnData, { status: 422 });
  }
  const { data } = validationResult;

  console.log(success, data);

  return json(returnData);
}

export default function EditProfileModal({}) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { session } = useSupabase();

  const { isOwnProfile, profile } = useRouteLoaderData<typeof loader>(
    `routes/profile.$username`
  )!;

  const form = useForm({
    initialValues: profile!,
    validate: zodResolver(profileSchema),
  });

  const [opened, { close, open }] = useDisclosure(false);
  const [step, setStep] = useState<null | string>("customization");

  const closeEditModal = () => {
    close();
    setTimeout(() => navigate("../"), 500);
  };

  const openConfirmCancelModal = () =>
    modals.openConfirmModal({
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { cancel: "Continue Editing", confirm: "Discard" },
      onConfirm: closeEditModal,
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
    if (!isOwnProfile) return navigate("../");
    else open();
  }, []);

  return (
    <Modal
      closeOnClickOutside={!form.isDirty()}
      onClose={handleCancel}
      opened={opened}
      size="lg"
      title={"Edit Your Profile"}
    >
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <Accordion onChange={setStep} value={step}>
          <Accordion.Item value="customization">
            <Collapse in={step !== "customization"}>
              <Accordion.Control>Profile Customization</Accordion.Control>
            </Collapse>
            <Accordion.Panel py="lg">
              <Fieldset legend="Profile Customization">
                <Stack gap="md">
                  <TextInput
                    description="The name you want to be displayed on your profile (Full Name)"
                    label="Display Name"
                    name="displayName"
                    placeholder="Enter your name"
                    withAsterisk
                    {...form.getInputProps("displayName")}
                  />
                  <TextInput
                    description="Public email address"
                    label="Contact Email"
                    leftSection={<IconAt size="1rem" />}
                    name="contactEmail"
                    placeholder="Enter your public contact email"
                    {...form.getInputProps("contactEmail")}
                  />
                  <Select
                    data={[
                      "red",
                      "blue",
                      "green",
                      "grape",
                      "yellow",
                      "orange",
                      "violet",
                      "pink",
                      "indigo",
                      "cyan",
                      "lime",
                      "teal",
                      "gray",
                    ]}
                    label="Profile Theme Color"
                    leftSection={
                      <IconCircle
                        color={
                          theme.colors[
                            form.getInputProps("profileColor").value
                          ]["7"]
                        }
                        size="1rem"
                      />
                    }
                    name="profileColor"
                    {...form.getInputProps("profileColor")}
                  />
                  <TextInput
                    description="A link to your profile picture"
                    label="Profile Picture URL"
                    name="profileImageUrl"
                    placeholder="Enter a link to your profile picture"
                    {...form.getInputProps("profileImageUrl")}
                  />
                  <TextInput
                    description="A link to your cover photo"
                    label="Cover Photo URL"
                    name="coverImageUrl"
                    placeholder="Enter a link to your cover photo"
                    {...form.getInputProps("coverImageUrl")}
                  />
                  <BackgroundImage
                    mb="xl"
                    radius="xs"
                    src={form.getTransformedValues().coverImageUrl ?? ""}
                  >
                    <Center mih="100px" style={{ alignItems: "flex-end" }}>
                      <Avatar
                        color={
                          form.getTransformedValues().profileColor ?? "blue"
                        }
                        radius="100%"
                        size="xl"
                        src={form.getTransformedValues().profileImageUrl ?? ""}
                        style={{ transform: "translateY(2rem)" }}
                        variant="filled"
                      />
                    </Center>
                  </BackgroundImage>
                  <Flex justify="center">
                    <Button disabled variant="subtle">
                      Back
                    </Button>
                    <Button onClick={() => setStep("about")} variant="subtle">
                      Next
                    </Button>
                  </Flex>
                </Stack>
              </Fieldset>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="about">
            <Collapse in={step !== "about"}>
              <Accordion.Control>About You</Accordion.Control>
            </Collapse>
            <Accordion.Panel py="lg">
              <Fieldset legend="About You">
                <Stack gap="md">
                  <TextInput
                    description="(Optional) A 1-line description of yourself"
                    label="Headline"
                    name="headline"
                    placeholder="Headline"
                    {...form.getInputProps("headline")}
                  />
                  <Autocomplete
                    data={[]}
                    description="(Optional) Your profession or industry"
                    label="Profession"
                    name="profession"
                    placeholder="Profession"
                    {...form.getInputProps("profession")}
                  />
                  <TextInput
                    description="(Optional) Your job title"
                    label="Job Title"
                    name="jobTitle"
                    placeholder="Job Title"
                    {...form.getInputProps("jobTitle")}
                  />
                  <TextInput
                    description="(Optional) Your company"
                    label="Company"
                    name="company"
                    placeholder="Company"
                    {...form.getInputProps("company")}
                  />
                  <Textarea
                    autosize
                    description="(Optional) A detailed bio about yourself (Max 4000 characters)"
                    label="Bio"
                    maxLength={4000}
                    minRows={3}
                    name="bio"
                    placeholder="Bio"
                    {...form.getInputProps("bio")}
                  />
                  <Flex justify="center">
                    <Button
                      onClick={() => setStep("customization")}
                      variant="subtle"
                    >
                      Back
                    </Button>
                    <Button onClick={() => setStep("account")} variant="subtle">
                      Next
                    </Button>
                  </Flex>
                </Stack>
              </Fieldset>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="account">
            <Collapse in={step !== "account"}>
              <Accordion.Control>Account Settings</Accordion.Control>
            </Collapse>
            <Accordion.Panel py="lg">
              <Fieldset legend="Account Settings">
                <Stack gap="md">
                  <Flex gap="xs">
                    <Text fw="bold">Username:</Text>{" "}
                    <Text>{profile?.username}</Text>
                  </Flex>
                  <Flex gap="xs">
                    <Text fw="bold">Log in email:</Text>{" "}
                    <Text>{session?.user?.email}</Text>
                  </Flex>
                  <Radio.Group
                    description="Who can view your profile"
                    label="Profile Visibility"
                    name="profileVisibility"
                    {...form.getInputProps("profileVisibility")}
                  >
                    <Group mt="md">
                      <Radio label="Public" value="public" />
                      <Radio label="Private" value="private" />
                      <Radio label="Signed in users" value="signed_in_users" />
                    </Group>
                  </Radio.Group>
                  <Text c="dimmed" fs="italic" size="sm">
                    {form.getTransformedValues().profileVisibility ===
                    "public" ? (
                      "Everyone can search for and view your profile"
                    ) : form.getTransformedValues().profileVisibility ===
                      "private" ? (
                      <Flex align="center" gap="xs">
                        <IconLock size="1rem" /> Only you can view your profile
                      </Flex>
                    ) : (
                      "Only other Speakerscape users can view your profile"
                    )}
                  </Text>
                  <Flex justify="center">
                    <Button onClick={() => setStep("about")} variant="subtle">
                      Back
                    </Button>
                    <Button disabled variant="subtle">
                      Next
                    </Button>
                  </Flex>
                </Stack>
              </Fieldset>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <SimpleGrid cols={2} mt="xl">
          <Button onClick={handleCancel} type="submit" variant="default">
            Cancel
          </Button>
          <Button color="blue" disabled={!form.isDirty()} type="submit">
            Save Changes
          </Button>
        </SimpleGrid>
      </Form>
    </Modal>
  );
}
