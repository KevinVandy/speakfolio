import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Flex, LoadingOverlay, Stack, Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import xss from "xss";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfileFull, profileBiosTable } from "db/schema";
import { SaveCancelButtons } from "~/components/SaveCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient.server";
import { transformDotNotation } from "~/util/transformDotNotation";
import { validateAuth } from "~/util/validateAuth.server";
import { xssOptions } from "~/util/xssOptions";
import { RichTextInput } from "~/components/RichTextInput";
import { notifications } from "@mantine/notifications";
import {
  getProfileErrorNotification,
  getProfileSavingNotification,
  getProfileSuccessNotification,
} from "~/components/Notifications";

type IProfileBioForm = Partial<Pick<IProfileFull, "bio" | "id" | "userId">>;

const profileBioSchema = z.object({
  bio: z.object({
    id: z.string().uuid(),
    richText: z.string().max(6000, { message: "Bio max 6000 characters" }),
  }),
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
});

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

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
    Object.fromEntries(await request.formData()),
  );

  //validate data
  const validationResult = profileBioSchema.safeParse(rawData);
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

  //update profile bio
  try {
    const cleanBio = xss(data.bio?.richText ?? "", xssOptions);
    const updateResult = await db
      .update(profileBiosTable)
      .set({ richText: cleanBio })
      .where(
        and(
          eq(profileBiosTable.id, data.bio.id),
          eq(profileBiosTable.profileId, data.profileId),
        ),
      );
    if (updateResult.count !== 1) throw new Error("Error updating profile bio");
    return json({
      ...returnData,
      data,
      success: true,
    });
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
    return json(returnData, { status: 400 });
  }
}

export default function EditProfileBioTab() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const form = useForm<IProfileBioForm>({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? {
      bio: {
        id: profile.bio?.id ?? "",
        richText: profile.bio?.richText ?? "",
      },
      profileId: profile.id,
      userId: profile.userId!,
    },
    validate: zodResolver(profileBioSchema),
  });

  useEffect(() => {
    if (actionData?.success) {
      //show success notification
      notifications.update(getProfileSuccessNotification("bio-update"));
      navigate("..");
    } else if (actionData?.errors) {
      //show error notification
      notifications.update(getProfileErrorNotification("bio-update"));
      //sync back-end errors with form
      if (Object.keys(actionData?.errors ?? {}).length) {
        form.setErrors({ ...form.errors, ...actionData.errors });
      }
    }
  }, [actionData]);

  const openConfirmCancelModal = (onConfirm?: () => void) =>
    modals.openConfirmModal({
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { cancel: "Continue Editing", confirm: "Discard" },
      onConfirm: onConfirm ?? (() => navigate("..")),
      title: "Are you sure you want to discard your changes?",
    });

  const handleCancel = () => {
    if (form.isDirty()) {
      openConfirmCancelModal();
    } else {
      navigate("..");
    }
  };

  return (
    <Form
      method="post"
      onSubmit={(event) =>
        form.validate().hasErrors
          ? event.preventDefault()
          : notifications.show(getProfileSavingNotification("bio-update"))
      }
    >
      <input name="profileId" type="hidden" value={profile.id} />
      <input name="userId" type="hidden" value={profile.userId!} />
      <input name="bio.id" type="hidden" value={form.values.bio?.id ?? ""} />
      <input
        name="bio.richText"
        type="hidden"
        value={form.values.bio?.richText ?? ""}
      />
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={navigation.state === "submitting"} />
        <RichTextInput
          label="Bio"
          description="Tell your story"
          value={form.values.bio?.richText ?? ""}
          onChangeDebounced={(debouncedValue) =>
            form.setFieldValue("bio.richText", debouncedValue)
          }
          showHeadings
          showTextAlign
        />
      </Stack>
      {Object.values(form?.errors ?? []).map((error, i) => (
        <Text c="red" key={i}>
          {error}
        </Text>
      ))}
      <Flex justify="flex-end" style={{ justifySelf: "flex-end" }}>
        <SaveCancelButtons
          disabled={!form.isDirty()}
          loading={navigation.state === "submitting"}
          maw="300px"
          onCancel={handleCancel}
        />
      </Flex>
    </Form>
  );
}
