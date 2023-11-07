import { useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useNavigation,
} from "@remix-run/react";
import {
  Anchor,
  Button,
  Collapse,
  Fieldset,
  Loader,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { z } from "zod";
import { db } from "db/connection";
import { profilesTable } from "db/schemas/profiles";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

interface SignUpPostResponse {
  data: any;
  errors: any;
  success: boolean;
}

const signUpSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email" }),
    name: z.string().min(1, { message: "Name is required" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    passwordConfirmation: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    username: z.string().min(2, { message: "Username is required" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    return redirect("/");
  }
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

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
    const authResult = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (!authResult?.data?.user?.id) {
      throw new Error("Failed to create user");
    }
    await db.insert(profilesTable).values({
      displayName: data.name,
      profileVisibility: "public",
      userId: authResult.data.user.id,
      username: data.username,
    });
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

  return redirect("/signed-up");
}

export const meta: MetaFunction = () => {
  return [
    { title: "Sign up for Speakfolio" },
    {
      content: "Sign up for Speakfolio",
      property: "og:title",
    },
    {
      content: "Sign up for Speakfolio",
      name: "description",
    },
  ];
};

export default function SignUpPage() {
  const actionData = useActionData<typeof action>();
  const usernameAvailableFetcher = useFetcher<any>({
    key: "username-available",
  });
  const navigation = useNavigation();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? {
      email: "",
      name: "",
      password: "",
      passwordConfirmation: "",
      username: "",
    },
    validate: zodResolver(signUpSchema),
  });

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

  const [debouncedUsername] = useDebouncedValue(
    form.getTransformedValues().username,
    500
  );

  useEffect(() => {
    if (debouncedUsername) {
      usernameAvailableFetcher.load(
        `/api/username-available/${debouncedUsername}`
      );
    }
  }, [debouncedUsername]);

  const isUsernameAvailable =
    usernameAvailableFetcher.data?.isAvailable === true;

  useEffect(() => {
    if (usernameAvailableFetcher.data?.isAvailable === false) {
      form.setErrors({
        ...form.errors,
        username: `Username "${usernameAvailableFetcher.data?.username}" is not available`,
      });
    }
  }, [usernameAvailableFetcher.data?.isAvailable]);

  return (
    <Stack m="auto" maw="400px">
      <Title order={2}>Sign Up</Title>
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <Fieldset
          disabled={navigation.state === "submitting"}
          legend="Sign Up"
          pos="relative"
        >
          <LoadingOverlay visible={navigation.state === "submitting"} />
          <Stack gap="md">
            <TextInput
              description="The name you want to be displayed on your profile"
              label="Name"
              name="name"
              placeholder="Enter your name"
              withAsterisk
              {...form.getInputProps("name")}
            />
            <TextInput
              description="The name you want to use in your profile URL"
              label="Username"
              name="username"
              placeholder="Enter your username"
              rightSection={
                usernameAvailableFetcher.state !== "idle" ? (
                  <Loader size="xs" />
                ) : null
              }
              withAsterisk
              {...form.getInputProps("username")}
            />
            <Collapse
              in={
                usernameAvailableFetcher.state !== "idle" &&
                debouncedUsername?.length > 2 &&
                isUsernameAvailable
              }
            >
              <Text color="green">{`${debouncedUsername} is available!`}</Text>
            </Collapse>
            <TextInput
              label="Email"
              name="email"
              placeholder="Enter your email"
              withAsterisk
              {...form.getInputProps("email")}
            />
            <TextInput
              autoComplete="new-password"
              label="Password"
              name="password"
              placeholder="Enter your password"
              type="password"
              withAsterisk
              {...form.getInputProps("password")}
            />
            <TextInput
              autoComplete="new-password"
              label="Password Confirmation"
              name="passwordConfirmation"
              placeholder="Confirm your password"
              type="password"
              withAsterisk
              {...form.getInputProps("passwordConfirmation")}
            />
            <Button color="blue" mt="md" type="submit">
              Sign Up
            </Button>
          </Stack>
        </Fieldset>
      </Form>
      <Text ta="center">
        Already have an account?{" "}
        <Anchor component={Link} to="/sign-in">
          Sign in
        </Anchor>
        .
      </Text>
    </Stack>
  );
}
