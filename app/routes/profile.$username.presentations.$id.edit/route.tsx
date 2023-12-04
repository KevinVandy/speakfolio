import { useEffect, useMemo } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate, useParams } from "@remix-run/react";
import { Stack, Text, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import xss from "xss";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "db/connection";
import { presentationsTable } from "db/schema";
import {
  getProfileErrorNotification,
  getProfileSavingNotification,
  getProfileSuccessNotification,
} from "~/components/Notifications";
import { RichTextInput } from "~/components/RichTextInput";
import { SaveCancelButtons } from "~/components/SaveCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { transformDotNotation } from "~/util/transformDotNotation";
import { validateAuth } from "~/util/validateAuth.server";
import { xssOptions } from "~/util/xssOptions";
import { getAuth } from "@clerk/remix/ssr.server";

const presentationSchema = z.object({
  abstract: z
    .string()
    .max(1000, {
      message: "Abstract max 1000 characters",
    })
    .nullish(),
  coverImageUrl: z
    .union([
      z.string().url({ message: "Cover Photo must be a valid URL" }),
      z.string().length(0),
    ])
    .nullish()
    .transform((s) => s || null),
  presentationId: z.union([z.string().uuid(), z.string().length(0)]).nullish(),
  title: z.string().max(100, { message: "Title max 100 characters" }),
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
  const validationResult = presentationSchema.safeParse(rawData);
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
    if (data.presentationId) {
      const updateResult = await db
        .update(presentationsTable)
        .set({
          abstract: xss(data.abstract ?? "", xssOptions),
          coverImageUrl: data.coverImageUrl,
          title: data.title,
        })
        .where(
          and(
            eq(presentationsTable.id, data.presentationId),
            eq(presentationsTable.profileId, userId)
          )
        );
      if (updateResult.count !== 1) throw new Error("Error updating profile");
    } else {
      const insertResult = await db.insert(presentationsTable).values({
        abstract: xss(data.abstract ?? "", xssOptions),
        coverImageUrl: data.coverImageUrl,
        profileId: userId,
        title: data.title,
      });
      if (insertResult.count !== 1) throw new Error("Error updating profile");
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

export default function ProfileNewPresentationPage() {
  const { id: presentationId } = useParams();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const initialPresentation = useMemo(() => {
    if (!presentationId || presentationId === "new") return null;
    const presentation = profile.presentations?.find(
      (p) => p.id === presentationId
    );
    if (presentation?.abstract) {
      presentation.abstract = xss(presentation.abstract, xssOptions);
    }
    return presentation;
  }, [profile.presentations]);

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: {
      ...(actionData?.data ??
        initialPresentation ?? {
          abstract: "<p></p>",
          coverImageUrl: null,
          title: "",
        }),
      presentationId: (presentationId !== "new" && presentationId) || null,
    },
    validate: zodResolver(presentationSchema),
  });

  useEffect(() => {
    if (actionData?.success) {
      //show success notification
      notifications.update(
        getProfileSuccessNotification("presentation-update")
      );
      navigate("../..");
    } else if (actionData?.errors) {
      //show error notification
      notifications.update(getProfileErrorNotification("presentation-update"));
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
      navigate("../..");
    }
  };

  return (
    <Form
      method="post"
      onSubmit={(event) =>
        form.validate().hasErrors
          ? event.preventDefault()
          : notifications.show(
              getProfileSavingNotification("presentation-update")
            )
      }
    >
      {presentationId && presentationId !== "new" ? (
        <input name="presentationId" type="hidden" value={presentationId} />
      ) : null}
      <input name="abstract" type="hidden" value={form.values.abstract} />
      <Stack gap="md" maw="800px" mx="auto">
        <TextInput
          label="Title"
          name="title"
          required
          withAsterisk
          {...form.getInputProps("title")}
        />
        <RichTextInput
          description="Give a short 1-3 paragraph summary of your talk"
          label="Abstract"
          onChangeDebounced={(debouncedValue) =>
            form.setFieldValue("abstract", debouncedValue)
          }
          value={form.values.abstract ?? ""}
        />
        <TextInput
          description="A link to your cover photo"
          label="Cover Photo URL"
          name="coverImageUrl"
          placeholder="Enter a link to your cover photo"
          {...form.getInputProps("coverImageUrl")}
        />
        {Object.entries(form?.errors ?? []).map((errorEntry, i) => (
          <Text c="red" key={i}>
            {errorEntry[0]}: {errorEntry[1]}
          </Text>
        ))}
        <SaveCancelButtons disabled={!form.isDirty()} onCancel={handleCancel} />
      </Stack>
    </Form>
  );
}
