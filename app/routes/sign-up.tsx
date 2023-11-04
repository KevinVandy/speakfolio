import {
  Anchor,
  Button,
  Collapse,
  Fieldset,
  Loader,
  LoadingOverlay,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { redirect, json } from "@remix-run/node";
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useNavigation,
} from "@remix-run/react";
import { db } from "db/connection";
import { profilesTable } from "db/schemas/profiles";
import { useEffect } from "react";
import { z } from "zod";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

interface SignUpPostResponse {
  success: boolean;
  data: any;
  errors: any;
}

const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    username: z.string().min(2, { message: "Username is required" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    passwordConfirmation: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
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
    success: false,
    data: {},
    errors: {},
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
      contactEmail: data.email,
      displayName: data.name,
      profileVisibility: "public",
      userId: authResult.data.user.id,
      username: data.username,
    });
  } catch (error) {
    console.log(error);
    returnData = {
      ...returnData,
      data,
      success: false,
      errors: {
        username: "Unable to create user",
      },
    };
    return json(returnData, { status: 400 });
  }

  return redirect("/signed-up");
}

export const meta: MetaFunction = () => {
  return [
    { title: "Sign up for Speakerscape" },
    {
      property: "og:title",
      content: "Sign up for Speakerscape",
    },
    {
      name: "description",
      content: "Sign up for Speakerscape",
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
    validate: zodResolver(signUpSchema),
    initialValues: actionData?.data ?? {
      name: "",
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    initialErrors: actionData?.errors,
  });

  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Stack maw="400px" m="auto">
      <Title order={2}>Sign Up</Title>
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <Fieldset
          pos="relative"
          disabled={navigation.state === "submitting"}
          legend="Sign Up"
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
              onChange={(e) => {
                console.log(e.target.value);
                form.getInputProps("username").onChange(e);
              }}
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
              name="passwordConfirmation"
              label="Password Confirmation"
              placeholder="Confirm your password"
              type="password"
              withAsterisk
              {...form.getInputProps("passwordConfirmation")}
            />
            <Button type="submit" color="blue" mt="md">
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
