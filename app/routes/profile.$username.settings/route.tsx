import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  Button,
  Fieldset,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  Radio,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconLock } from "@tabler/icons-react";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profileVisibilityEnum, profilesTable } from "db/schemas/profilesTable";
import { useFetchProfile } from "~/hooks/queries/useFetchProfile";
import { useSupabase } from "~/hooks/useSupabase";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

const profileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  visibility: z.enum(profileVisibilityEnum.enumValues),
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
  const rawData = Object.fromEntries(await request.formData());

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
    await db
      .update(profilesTable)
      .set({
        visibility: data.visibility,
      })
      .where(eq(profilesTable.id, data.id));
    return redirect("../");
  } catch (error) {
    console.error(error);
    returnData = {
      ...returnData,
      data,
      errors: {
        form: "Error account settings",
      },
      success: false,
    };
    return json(returnData, { status: 422 });
  }
}

export default function EditProfileSettingsModal() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { username } = useParams();
  const { session } = useSupabase();

  const { data: profile } = useFetchProfile({ username });
  const { isOwnProfile } = profile;

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileSchema),
  });

  const [opened, { close, open }] = useDisclosure(false);

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
    if (!profile || !isOwnProfile) return navigate("../");
    else open();
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
      size="lg"
      title={"Edit Your Account Settings"}
    >
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <input name="id" type="hidden" value={profile.id} />
        <input name="userId" type="hidden" value={profile.userId!} />

        <Fieldset legend="Account Settings" pos="relative">
          <LoadingOverlay visible={navigation.state === "submitting"} />
          <Stack gap="md">
            <Flex gap="xs">
              <Text fw="bold">Username:</Text> <Text>{profile?.username}</Text>
            </Flex>
            <Flex gap="xs">
              <Text fw="bold">Log in email:</Text>{" "}
              <Text>{session?.user?.email}</Text>
            </Flex>
            <Radio.Group
              description="Who can view your profile"
              label="Profile Visibility"
              name="visibility"
              {...form.getInputProps("visibility")}
            >
              <Group mt="md">
                <Radio label="Public" value="public" />
                <Radio label="Private" value="private" />
                <Radio label="Signed in users" value="signed_in_users" />
              </Group>
            </Radio.Group>
            <Text c="dimmed" fs="italic" size="sm">
              {form.getTransformedValues().visibility === "public" ? (
                "Everyone can search for and view your profile"
              ) : form.getTransformedValues().visibility === "private" ? (
                <Flex align="center" gap="xs">
                  <IconLock size="1rem" /> Only you can view your profile
                </Flex>
              ) : (
                "Only other Speakfolio users can view your profile"
              )}
            </Text>
          </Stack>
        </Fieldset>
        {Object.values(form.errors).map((error, i) => (
          <Text c="red" key={i}>
            {error}
          </Text>
        ))}
        <SimpleGrid cols={2} mt="xl">
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
      </Form>
    </Modal>
  );
}
