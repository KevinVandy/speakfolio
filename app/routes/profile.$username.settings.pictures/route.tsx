import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  Avatar,
  BackgroundImage,
  Center,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profilesTable } from "db/schema";
import { type EditProfileOutletContext } from "../profile.$username.edit/route";
import {
  getProfileErrorNotification,
  getProfileSavingNotification,
  getProfileSuccessNotification,
} from "~/components/Notifications";
import { SaveCancelButtons } from "~/components/SaveCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getClerkServerClient } from "~/util/getClerkServerClient.server";
import { transformDotNotation } from "~/util/transformDotNotation";
import { validateAuth } from "~/util/validateAuth.server";

const profileCustomizationSchema = z.object({
  coverImageUrl: z
    .union([
      z.string().url({ message: "Cover Photo must be a valid URL" }),
      z.string().length(0),
    ])
    .nullish()
    .transform((s) => s || null),
  profileImageUrl: z
    .union([
      z.string().url({ message: "Profile Image must be a valid URL" }),
      z.string().length(0),
    ])
    .nullish()
    .transform((s) => s || null),
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
  const validationResult = profileCustomizationSchema.safeParse(rawData);
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
    // (await getClerkServerClient()).users.updateUserProfileImage(
    //   userId,
    //   data.profileImageUrl
    // );
    const updateResult = await db
      .update(profilesTable)
      .set({
        coverImageUrl: data.coverImageUrl,
      })
      .where(eq(profilesTable.id, userId));
    if (updateResult.count !== 1) throw new Error("Error updating profile");
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

export default function EditProfilePicturesTab() {
  // const { onCancel, setIsDirty } = useOutletContext<EditProfileOutletContext>();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? {
      coverImageUrl: profile?.coverImageUrl ?? "",
      profileImageUrl: profile?.profileImageUrl ?? "",
    },
    validate: zodResolver(profileCustomizationSchema),
  });

  useEffect(() => {
    // setIsDirty(form.isDirty());
  }, [form]);

  useEffect(() => {
    if (actionData?.success) {
      //show success notification
      notifications.update(getProfileSuccessNotification("pictures-update"));
      navigate(`/profile/${profile?.username}/settings`);
    } else if (actionData?.errors) {
      //show error notification
      notifications.update(getProfileErrorNotification("pictures-update"));
      //sync back-end errors with form
      if (Object.keys(actionData?.errors ?? {}).length) {
        form.setErrors({ ...form.errors, ...actionData.errors });
      }
    }
  }, [actionData]);

  return (
    <Form
      action={`/profile/${profile.username}/settings/pictures`}
      method="post"
      onSubmit={(event) =>
        form.validate().hasErrors
          ? event.preventDefault()
          : notifications.show(getProfileSavingNotification("pictures-update"))
      }
    >
      <Stack gap="md">
        <BackgroundImage
          mb="xl"
          radius="xs"
          src={form.getTransformedValues().coverImageUrl ?? ""}
        >
          <Center mih="100px" style={{ alignItems: "flex-end" }}>
            <Avatar
              radius="100%"
              size="xl"
              src={form.getTransformedValues().profileImageUrl ?? ""}
              style={{ transform: "translateY(2rem)" }}
              variant="filled"
            />
          </Center>
        </BackgroundImage>
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
      </Stack>
      {Object.values(form?.errors ?? []).map((error, i) => (
        <Text c="red" key={i}>
          {error}
        </Text>
      ))}
      <SaveCancelButtons disabled={!form.isDirty()} />
    </Form>
  );
}

export const usRegions = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Southern California",
  "Northern California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "New England",
  "Pacific Northwest",
  "The Midwest",
  "The Bay Area",
  "Appalachia",
];
