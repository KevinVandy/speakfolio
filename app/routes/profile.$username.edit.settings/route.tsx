import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useOutletContext } from "@remix-run/react";
import { Flex, Group, Radio, Stack, Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { IconLock } from "@tabler/icons-react";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profileVisibilities, profilesTable } from "db/schemas/profilesTable";
import { type EditProfileOutletContext } from "../profile.$username.edit/route";
import { SaveContinueCancelButtons } from "~/components/SaveContinueCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { useRootLoader } from "~/hooks/loaders/useRootLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { validateAuth } from "~/util/validateAuth";

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

const profileSchema = z.object({
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
  visibility: z.enum(profileVisibilities),
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
  if (
    !(await validateAuth({
      profileId: data.profileId,
      supabase,
      userId: data.userId,
    }))
  ) {
    return redirect("/sign-in");
  }

  //update profile
  try {
    await db
      .update(profilesTable)
      .set({
        visibility: data.visibility,
      })
      .where(eq(profilesTable.id, data.profileId));
    return redirect("../..");
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
  const { onCancel, setIsDirty } = useOutletContext<EditProfileOutletContext>();
  const actionData = useActionData<typeof action>();
  const { session } = useRootLoader();

  const profile = useProfileLoader();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileSchema),
  });

  useEffect(() => {
    setIsDirty(form.isDirty());
  }, [form]);

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
    >
      <input name="profileId" type="hidden" value={profile.id} />
      <input name="userId" type="hidden" value={profile.userId!} />
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
            <Flex align="center" component="span" gap="xs">
              <IconLock size="1rem" /> Only you can view your profile
            </Flex>
          ) : (
            "Only other Speakfolio users can view your profile"
          )}
        </Text>
      </Stack>
      {Object.values(form.errors).map((error, i) => (
        <Text c="red" key={i}>
          {error}
        </Text>
      ))}
      <SaveContinueCancelButtons
        disabled={!form.isDirty()}
        onCancel={onCancel}
      />
    </Form>
  );
}
