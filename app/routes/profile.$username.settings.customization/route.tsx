import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import {
  Flex,
  Group,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCircle, IconLock } from "@tabler/icons-react";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profileColors, profileVisibilities, profilesTable } from "db/schema";
import { type EditProfileOutletContext } from "../profile.$username.edit/route";
import {
  getProfileErrorNotification,
  getProfileSavingNotification,
  getProfileSuccessNotification,
} from "~/components/Notifications";
import { SaveCancelButtons } from "~/components/SaveCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient.server";
import { transformDotNotation } from "~/util/transformDotNotation";
import { validateAuth } from "~/util/validateAuth.server";

const profileCustomizationSchema = z.object({
  headline: z
    .string()
    .max(100, { message: "Headline max 100 characters" })
    .nullish(),
  location: z
    .string()
    .max(100, { message: "Location max 100 characters" })
    .nullish(),
  name: z.string().min(1, { message: "Display Name is required" }),
  profileColor: z.enum(profileColors),
  profileId: z.string().uuid(),
  visibility: z.enum(profileVisibilities),
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
  if (
    !(await validateAuth({
      args,
      profileId: data.profileId,
    }))
  ) {
    return redirect("/sign-in");
  }

  //update profile bio
  try {
    const updateResult = await db
      .update(profilesTable)
      .set({
        headline: data.headline,
        location: data.location,
        name: data.name,
        profileColor: data.profileColor,
        visibility: data.visibility,
      })
      .where(eq(profilesTable.id, data.profileId));
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

export default function EditProfileCustomizationTab() {
  // const { onCancel, setIsDirty } = useOutletContext<EditProfileOutletContext>();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const theme = useMantineTheme();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? {
      headline: profile?.headline ?? "",
      location: profile?.location ?? "",
      name: profile?.name ?? "",
      profileColor: profile?.profileColor ?? "pink",
      profileId: profile.id,
    },
    validate: zodResolver(profileCustomizationSchema),
  });

  useEffect(() => {
    // setIsDirty(form.isDirty());
  }, [form]);

  useEffect(() => {
    if (actionData?.success) {
      //show success notification
      notifications.update(
        getProfileSuccessNotification("customization-update")
      );
      navigate(`/profile/${profile?.username}/settings`);
    } else if (actionData?.errors) {
      //show error notification
      notifications.update(getProfileErrorNotification("customization-update"));
      //sync back-end errors with form
      if (Object.keys(actionData?.errors ?? {}).length) {
        form.setErrors({ ...form.errors, ...actionData.errors });
      }
    }
  }, [actionData]);

  return (
    <Form
      action={`/profile/${profile?.username}/settings/customization`}
      method="post"
      onSubmit={(event) =>
        form.validate().hasErrors
          ? event.preventDefault()
          : notifications.show(
              getProfileSavingNotification("customization-update")
            )
      }
    >
      <input name="profileId" type="hidden" value={profile.id} />
      <Stack gap="md">
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
        <Select
          data={[
            "blue",
            "cyan",
            "grape",
            "green",
            "indigo",
            "lime",
            "orange",
            "pink",
            "red",
            "teal",
            "violet",
            "yellow",
          ]}
          label="Profile Theme Color"
          leftSection={
            <IconCircle
              color={
                theme.colors[form.getInputProps("profileColor").value]["7"]
              }
              size="1rem"
            />
          }
          name="profileColor"
          {...form.getInputProps("profileColor")}
        />
        <TextInput
          description="The name you want to be displayed on your profile (Full Name)"
          label="Display Name"
          name="name"
          placeholder="Enter your name"
          withAsterisk
          {...form.getInputProps("name")}
        />
        <TextInput
          description="(Optional) The region you are willing to travel to for speaking engagements"
          label="Location"
          name="location"
          placeholder="Location"
          {...form.getInputProps("location")}
        />
        <Textarea
          description="(Optional) A short 1-line description of yourself"
          label="Headline"
          maxRows={2}
          name="headline"
          placeholder="Headline"
          {...form.getInputProps("headline")}
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
