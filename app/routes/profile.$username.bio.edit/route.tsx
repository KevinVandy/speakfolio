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
import { notifications } from "@mantine/notifications";
import xss from "xss";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfileFull, profileBiosTable, IProfileBio } from "db/schema";
import {
  getProfileErrorNotification,
  getProfileSavingNotification,
  getProfileSuccessNotification,
} from "~/components/Notifications";
import { RichTextInput } from "~/components/RichTextInput";
import { SaveCancelButtons } from "~/components/SaveCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { transformDotNotation } from "~/util/transformDotNotation";
import { xssOptions } from "~/util/xssOptions";
import { getAuth } from "@clerk/remix/ssr.server";

type IProfileBioForm = {
  bioId: string;
  bio: string;
}

const profileBioSchema = z.object({
  bioId: z.string().uuid(),
  bio: z.string().max(6000, { message: "Bio max 6000 characters" }),
});

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

export async function action(args: ActionFunctionArgs) {
  const { request } = args;

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
  const validationResult = profileBioSchema.safeParse(rawData);
  const { success } = validationResult;
  if (!success) {
    const errors = validationResult.error.formErrors.fieldErrors;
    returnData = { ...returnData, data: rawData, errors, success };
    return json(returnData, { status: 422 });
  }
  const { data } = validationResult;

  //validate auth
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }

  //update profile bio
  try {
    const cleanBio = xss(data.bio ?? "", xssOptions);
    if (data.bioId) {
      const updateResult = await db
        .update(profileBiosTable)
        .set({ bio: cleanBio })
        .where(
          and(
            eq(profileBiosTable.id, data.bioId),
            eq(profileBiosTable.profileId, userId)
          )
        );
      if (updateResult.count !== 1) {
        throw new Error("Error updating profile bio");
      }
    } else {
      const insertResult = await db.insert(profileBiosTable).values({
        bio: cleanBio,
        profileId: userId,
      });
      if (insertResult.count !== 1) {
        throw new Error("Error updating profile bio");
      }
    }
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
      bio: profile.bio?.bio,
      bioId: profile.bio?.id,
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
      <input name="bioId" type="hidden" value={form.values.bioId ?? ""} />
      <input name="bio" type="hidden" value={form.values.bio ?? ""} />
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={navigation.state === "submitting"} />
        <RichTextInput
          description="Tell your story"
          label="Bio"
          onChangeDebounced={(debouncedValue) =>
            form.setFieldValue("bio.richText", debouncedValue)
          }
          showHeadings
          showTextAlign
          value={form.values.bio ?? ""}
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
