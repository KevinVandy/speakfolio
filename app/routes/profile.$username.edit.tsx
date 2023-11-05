import {
  Accordion,
  Autocomplete,
  Button,
  Fieldset,
  Flex,
  Group,
  Modal,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Form, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { profilesTable } from "db/schemas/profiles";
import { useSupabase } from "~/hooks/useSupabase";
import { type loader } from "./profile.$username";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().min(1, { message: "Display Name is required" }),
  contactEmail: z.string().email({ message: "Please enter a valid email" }),
  headline: z.string().max(100, { message: "Max 100 characters" }),
  jobTitle: z.string().max(100, { message: "Max 100 characters" }),
  company: z.string().max(100, { message: "Max 100 characters" }),
  bio: z.string().max(4000, { message: "Max 4000 characters" }),
});

export async function action({ request }: ActionFunctionArgs) {
  return {};
}

export default function EditProfileModal({}) {
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
  const [step, setStep] = useState<string | null>("account");

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
      onClose={() => {
        close();
        setTimeout(() => navigate("../"), 500);
      }}
    >
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <Accordion value={step} onChange={setStep}>
          <Accordion.Item value="account">
            {step !== "account" && (
              <Accordion.Control>Account Info</Accordion.Control>
            )}
            <Accordion.Panel>
              <Fieldset legend="Your Account">
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
                    {form.getTransformedValues().profileVisibility === "public"
                      ? "Everyone can search for and view your profile"
                      : form.getTransformedValues().profileVisibility ===
                        "private"
                      ? "Only you can view your profile"
                      : "Only other Speakerscape users can view your profile"}
                  </Text>
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
                    name="email"
                    placeholder="Enter your public contact email"
                    {...form.getInputProps("contactEmail")}
                  />
                </Stack>
              </Fieldset>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="about">
            {step !== "about" && (
              <Accordion.Control>Account Info</Accordion.Control>
            )}
            <Accordion.Panel>
              <Fieldset legend="About You">
                <Stack gap="md">
                  <TextInput
                    description="A 1-line description of yourself"
                    label="Headline"
                    name="headline"
                    placeholder="Headline"
                    {...form.getInputProps("headline")}
                  />
                  <Autocomplete
                    label="Profession"
                    placeholder="Profession"
                    data={[]}
                    {...form.getInputProps("profession")}
                  />
                  <TextInput
                    label="Job Title"
                    placeholder="Job Title"
                    {...form.getInputProps("jobTitle")}
                  />
                  <TextInput
                    label="Company"
                    placeholder="Company"
                    {...form.getInputProps("company")}
                  />
                  <Textarea
                    autosize
                    maxLength={4000}
                    minRows={3}
                    label="Bio"
                    placeholder="Bio"
                    {...form.getInputProps("bio")}
                  />
                </Stack>
              </Fieldset>
            </Accordion.Panel>
          </Accordion.Item>
          <SimpleGrid mt="xl" cols={2}>
            <Button onClick={close} type="submit" variant="default">
              Cancel
            </Button>
            <Button disabled={!form.isDirty()} type="submit" color="blue">
              Save Changes
            </Button>
          </SimpleGrid>
        </Accordion>
      </Form>
    </Modal>
  );
}
