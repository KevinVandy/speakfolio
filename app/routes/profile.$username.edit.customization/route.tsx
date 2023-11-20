import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useOutletContext } from "@remix-run/react";
import {
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { IconCircle } from "@tabler/icons-react";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profileColors, profilesTable } from "db/schema";
import { type EditProfileOutletContext } from "../profile.$username.edit/route";
import { SaveContinueCancelButtons } from "~/components/SaveContinueCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { transformDotNotation } from "~/util/transformDotNotation";

const profileCustomizationSchema = z.object({
  headline: z
    .string()
    .max(100, { message: "Headline max 100 characters" })
    .optional()
    .nullish(),
  id: z.string().uuid(),
  location: z
    .string()
    .max(100, { message: "Location max 100 characters" })
    .optional()
    .nullish(),
  name: z.string().min(1, { message: "Display Name is required" }),
  profileColor: z.enum(profileColors),
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
  const validationResult = profileCustomizationSchema.safeParse(rawData);
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

  //update profile bio
  try {
    await db
      .update(profilesTable)
      .set({
        headline: data.headline,
        location: data.location,
        name: data.name,
        profileColor: data.profileColor,
      })
      .where(eq(profilesTable.id, data.id));
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

export default function EditProfileCustomizationTab() {
  const { onCancel, setIsDirty } = useOutletContext<EditProfileOutletContext>();
  const theme = useMantineTheme();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileCustomizationSchema),
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
      <input name="id" type="hidden" value={profile.id} />
      <input name="userId" type="hidden" value={profile.userId!} />
      <Stack gap="md">
        <Select
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
      <SaveContinueCancelButtons
        disabled={!form.isDirty()}
        onCancel={onCancel}
      />
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
