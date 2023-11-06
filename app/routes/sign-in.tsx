import { json, redirect } from "@remix-run/node";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useEffect } from "react";
import {
  Anchor,
  Button,
  Fieldset,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

interface SignInPostResponse {
  data: any;
  errors: any;
  success: boolean;
}

const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
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

  let returnData: SignInPostResponse = {
    data: {},
    errors: {},
    success: false,
  };

  const rawData = Object.fromEntries(await request.formData());
  const validationResult = signUpSchema.safeParse(rawData);
  const { success } = validationResult;
  if (!success) {
    const errors = validationResult.error.formErrors.fieldErrors;
    returnData = {
      ...returnData,
      data: rawData,
      errors,
      success,
    };
    return json(returnData, { headers: response.headers });
  } else {
    const { data } = validationResult;
    try {
      const result = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      supabase.auth.setSession(result.data.session);
      returnData = {
        ...returnData,
        data,
        success: true,
      };
    } catch (error) {
      returnData = {
        ...returnData,
        data,
        errors: {
          password: "Invalid email or password",
        },
        success: false,
      };
      return json(returnData, { headers: response.headers });
    }
  }

  return redirect("/", { headers: response.headers });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Sign into Speakerscape" },
    {
      content: "Sign into Speakerscape",
      property: "og:title",
    },
    {
      content: "Sign into Speakerscape",
      name: "description",
    },
  ];
};

export default function SignUpPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? {
      email: "",
      password: "",
    },
    validate: zodResolver(signUpSchema),
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

  return (
    <Stack m="auto" maw="400px">
      <Title order={2}>Sign In</Title>
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <Fieldset
          disabled={navigation.state !== "idle"}
          legend="Sign In"
          pos="relative"
        >
          <Stack gap="md">
            <TextInput
              label="Email"
              name="email"
              placeholder="Enter your email"
              {...form.getInputProps("email")}
            />
            <TextInput
              label="Password"
              name="password"
              placeholder="Enter your password"
              type="password"
              {...form.getInputProps("password")}
            />
            <Button
              color="blue"
              loading={navigation.state === "submitting"}
              mt="md"
              type="submit"
            >
              Sign In
            </Button>
          </Stack>
        </Fieldset>
      </Form>
      <Text>
        Don't have an account yet?{" "}
        <Anchor component={Link} to="/sign-up">
          Sign up
        </Anchor>
        .
      </Text>
    </Stack>
  );
}
