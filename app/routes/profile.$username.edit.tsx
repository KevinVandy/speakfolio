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
import { Form, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { profilesTable } from "db/schemas/profiles";
import { useSupabase } from "~/hooks/useSupabase";
import { type loader } from "./profile.$username";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { IconAt, IconCircle, IconLock } from "@tabler/icons-react";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { modals } from "@mantine/modals";

interface ProfileUpdateResponse {
  success: boolean;
  data: any;
  errors: any;
}

const profileSchema = z.object({
  displayName: z.string().min(1, { message: "Display Name is required" }),
  contactEmail: z
    .string()
    .email({ message: "Please enter a valid email" })
    .optional(),
  headline: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  profession: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  jobTitle: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  company: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  bio: z
    .string()
    .max(4000, { message: "Max 4000 characters" })
    .optional()
    .nullish(),
  profileImageUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .nullish(),
  coverImageUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .nullish(),
  profileColor: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  console.log("action");
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  let returnData: ProfileUpdateResponse = {
    success: false,
    data: {},
    errors: {},
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

  const { profile, isOwnProfile } = useRouteLoaderData<typeof loader>(
    `routes/profile.$username`
  )!;

  const form = useForm({
    initialValues: profile!,
    validate: zodResolver(profileSchema),
  });

  const [opened, { open, close }] = useDisclosure(false);
  const [step, setStep] = useState<string | null>("customization");

  const closeEditModal = () => {
    close();
    setTimeout(() => navigate("../"), 500);
  };

  const openConfirmCancelModal = () =>
    modals.openConfirmModal({
      title: "Are you sure you want to discard your changes?",
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { confirm: "Discard", cancel: "Continue Editing" },
      onConfirm: closeEditModal,
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
      size="lg"
      title={"Edit Your Profile"}
      opened={opened}
      closeOnClickOutside={!form.isDirty()}
      onClose={handleCancel}
    >
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <Accordion value={step} onChange={setStep}>
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
                    name="contactEmail"
                    leftSection={<IconAt size="1rem" />}
                    placeholder="Enter your public contact email"
                    {...form.getInputProps("contactEmail")}
                  />
                  <Select
                    label="Profile Theme Color"
                    name="profileColor"
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
                    leftSection={
                      <IconCircle
                        size="1rem"
                        color={
                          theme.colors[
                            form.getInputProps("profileColor").value
                          ]["7"]
                        }
                      />
                    }
                    {...form.getInputProps("profileColor")}
                  />
                  <TextInput
                    label="Profile Picture URL"
                    description="A link to your profile picture"
                    name="profileImageUrl"
                    placeholder="Enter a link to your profile picture"
                    {...form.getInputProps("profileImageUrl")}
                  />
                  <TextInput
                    label="Cover Photo URL"
                    name="coverImageUrl"
                    description="A link to your cover photo"
                    placeholder="Enter a link to your cover photo"
                    {...form.getInputProps("coverImageUrl")}
                  />
                  <BackgroundImage
                    radius="xs"
                    mb="xl"
                    src={form.getTransformedValues().coverImageUrl ?? ""}
                  >
                    <Center style={{ alignItems: "flex-end" }} mih="100px">
                      <Avatar
                        color={
                          form.getTransformedValues().profileColor ?? "blue"
                        }
                        radius="100%"
                        variant="filled"
                        style={{ transform: "translateY(2rem)" }}
                        size="xl"
                        src={form.getTransformedValues().profileImageUrl ?? ""}
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
                    description="(Optional) Your profession or industry"
                    label="Profession"
                    placeholder="Profession"
                    name="profession"
                    data={[]}
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
                    maxLength={4000}
                    minRows={3}
                    label="Bio"
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
                    label="Profile Visibility"
                    name="profileVisibility"
                    description="Who can view your profile"
                    {...form.getInputProps("profileVisibility")}
                  >
                    <Group mt="md">
                      <Radio value="public" label="Public" />
                      <Radio value="private" label="Private" />
                      <Radio value="signed_in_users" label="Signed in users" />
                    </Group>
                  </Radio.Group>
                  <Text fs="italic" c="dimmed" size="sm">
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
        <SimpleGrid mt="xl" cols={2}>
          <Button onClick={handleCancel} type="submit" variant="default">
            Cancel
          </Button>
          <Button disabled={!form.isDirty()} type="submit" color="blue">
            Save Changes
          </Button>
        </SimpleGrid>
      </Form>
    </Modal>
  );
}
