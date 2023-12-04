import { useEffect } from "react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  Button,
  Checkbox,
  Fieldset,
  LoadingOverlay,
  Stack,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { db } from "db/connection";
import { profileBiosTable } from "db/schemas/profileBiosTable";
import { profilesTable } from "db/schemas/profilesTable";
import { getClerkServerClient } from "~/util/getClerkServerClient.server";

interface SignUpPostResponse {
  data: any;
  errors: any;
  success: boolean;
}

const signUpSchema = z.object({
  isOrganizer: z.coerce.boolean(),
  isSpeaker: z.coerce.boolean(),
});

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  return {};
}

export async function action(args: ActionFunctionArgs) {
  const { request } = args;

  let returnData: SignUpPostResponse = {
    data: {},
    errors: {},
    success: false,
  };

  const rawData = Object.fromEntries(await request.formData());
  const validationResult = signUpSchema.safeParse(rawData);
  const { success } = validationResult;
  if (!success) {
    const errors = validationResult.error.formErrors.fieldErrors;
    returnData = { ...returnData, data: rawData, errors, success };
    return json(returnData, { status: 422 });
  }
  const { data } = validationResult;

  try {
    const { userId } = await getAuth(args);

    if (!userId) {
      return redirect("/sign-in");
    }

    const user = await (await getClerkServerClient()).users.getUser(userId);

    const profileInsertResult = await db
      .insert(profilesTable)
      .values({
        id: userId,
        isOrganizer: data.isOrganizer,
        isSpeaker: data.isSpeaker,
        profileColor: "pink",
        profileImageUrl: user.imageUrl ?? null,
        username: user?.username ?? "",
        visibility: "public",
      })
      .returning({ insertedId: profilesTable.id });
    await db.insert(profileBiosTable).values({
      profileId: profileInsertResult[0].insertedId,
    });
    return redirect(`/profile/${user.username}`);
  } catch (error) {
    console.error(error);
    returnData = {
      ...returnData,
      data,
      errors: {
        username: "Unable to create user",
      },
      success: false,
    };
    return json(returnData, { status: 400 });
  }
}

export default function SignedUpPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? {
      isOrganizer: false,
      isSpeaker: false,
      name: "",
    },
    validate: zodResolver(signUpSchema),
  });

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
      <Fieldset disabled={navigation.state === "submitting"} pos="relative">
        <LoadingOverlay visible={navigation.state === "submitting"} />
        <Stack gap="md" m="auto" maw="600px">
          <Title order={3}></Title>
          <Stack>
            <Checkbox checked disabled label="Attendee" value="true" />
            <Checkbox
              label="Speaker"
              name="isSpeaker"
              {...form.getInputProps("isSpeaker")}
              value="true"
            />
            <Checkbox
              label="Organizer"
              name="isOrganizer"
              {...form.getInputProps("isOrganizer")}
              value="true"
            />
          </Stack>
          <Button color="blue" mt="md" type="submit">
            Finish Sign Up
          </Button>
        </Stack>
      </Fieldset>
    </Form>
  );
}
