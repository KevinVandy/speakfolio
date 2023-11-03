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
import { redirect, json } from "@remix-run/node";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { z } from "zod";
import { useSupabase } from "~/hooks/useSupabase";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

interface SignInPostResponse {
  session: Session | null;
  success: boolean;
  data: any;
  errors: any;
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
    session: null,
    success: false,
    data: {},
    errors: {},
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
        session: result.data.session,
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
    }
  }

  return json({ ...returnData, headers: response.headers });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Sign into Speakerscape" },
    {
      property: "og:title",
      content: "Sign into Speakerscape",
    },
    {
      name: "description",
      content: "Sign into Speakerscape",
    },
  ];
};

export default function SignUpPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { supabase } = useSupabase();

  const form = useForm({
    validate: zodResolver(signUpSchema),
    initialValues: actionData?.data ?? {
      email: "",
      password: "",
    },
    initialErrors: actionData?.errors,
    validateInputOnBlur: true,
    clearInputErrorOnChange: true,
  });

  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
    if (actionData?.session?.user) {
      supabase.auth.setSession(actionData.session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <Stack maw="400px" m="auto">
      <Title order={2}>Sign In</Title>
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <Fieldset
          pos="relative"
          disabled={navigation.state !== "idle"}
          legend="Sign In"
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
              loading={navigation.state === "submitting"}
              type="submit"
              color="blue"
              mt="md"
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
