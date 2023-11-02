import { Button, Fieldset, Stack, TextInput, Title } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useNavigate, useOutletContext } from "@remix-run/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
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

// export const a

export const meta = {
  title: "Sign Up",
  description: "Sign up for Speakerscape",
};

export default function SignUpPage() {
  const supabase = useOutletContext<SupabaseClient>();
  const navigate = useNavigate();

  const form = useForm({
    validate: zodResolver(signUpSchema),
    initialValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const handleSignUp = async (data: any) => {
    await supabase.auth.signUp({
      ...data,
    });
    navigate("/signed-up");
  };

  return (
    <Stack maw="400px" m="auto">
      <Title order={2}>Sign Up</Title>
      <form onSubmit={form.onSubmit(handleSignUp)}>
        <Fieldset legend="Sign Up">
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Enter your name"
              withAsterisk
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              placeholder="Enter your email"
              withAsterisk
              {...form.getInputProps("email")}
            />
            <TextInput
              autoComplete="new-password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              withAsterisk
              {...form.getInputProps("password")}
            />
            <TextInput
              autoComplete="new-password"
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
      </form>
    </Stack>
  );
}
