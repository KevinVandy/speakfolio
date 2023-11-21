import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { Stack, Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profilesTable } from "db/schema";
import { SaveContinueCancelButtons } from "~/components/SaveContinueCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { transformDotNotation } from "~/util/transformDotNotation";
import { validateAuth } from "~/util/validateAuth";

const profileCareerSchema = z.object({
  areasOfExpertise: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .nullish(),
  company: z
    .string()
    .max(100, { message: "Company name max 100 characters" })
    .nullish(),
  jobTitle: z
    .string()
    .max(100, { message: "Job Title max 100 characters" })
    .nullish(),
  profession: z
    .string()
    .max(100, { message: "Profession max 100 characters" })
    .nullish(),
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
    Object.fromEntries(await request.formData())
  );

  //validate data
  const validationResult = profileCareerSchema.safeParse(rawData);
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
    await db
      .update(profilesTable)
      .set({
        
      })
      .where(eq(profilesTable.id, data.profileId));
    return redirect("../..");
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

export default function EditProfilePastTalksTab() {
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileCareerSchema),
  });

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
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
      onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
    >
      <input name="profileId" type="hidden" value={profile.id} />
      <input name="userId" type="hidden" value={profile.userId!} />
      <Stack gap="md"></Stack>
      {Object.values(form?.errors ?? []).map((error, i) => (
        <Text c="red" key={i}>
          {error}
        </Text>
      ))}
      <SaveContinueCancelButtons
        disabled={!form.isDirty()}
        onCancel={handleCancel}
      />
    </Form>
  );
}
