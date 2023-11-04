import { Modal, Text, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Form, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { IProfile, insertProfileSchema } from "db/schemas/profiles";
import { useSupabase } from "~/hooks/useSupabase";
import { type loader } from "./profile.$username";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import { ActionFunctionArgs } from "@remix-run/node";

// id: uuid("id").defaultRandom().primaryKey().notNull(),
// userId: uuid("user_id"), //fk to auth.users
// username: varchar("username", { length: 256 }).notNull(),
// displayName: varchar("display_name", { length: 256 }).notNull(),
// contactEmail: varchar("contact_email", { length: 256 }).notNull(),
// profileVisibility: profileVisibilityEnum("profile_visibility")
//   .notNull()
//   .default("public"),
// profileImageUrl: varchar("profile_image_url", { length: 1024 }),
// coverImageUrl: varchar("cover_image_url", { length: 1024 }),
// headline: varchar("headline", { length: 256 }),
// bio: text("bio"),
// profession: varchar("profession", { length: 128 }),
// jobTitle: varchar("job_title", { length: 256 }),
// company: varchar("company", { length: 256 }),
// profileColor: profileColorEnum("profile_color").default("blue"),

export async function action({ request }: ActionFunctionArgs) {
  return {};
}

export default function EditProfileModal({}) {
  const navigate = useNavigate();
  const { session } = useSupabase();

  const { profile, isOwnProfile } = useRouteLoaderData<typeof loader>(
    `routes/profile.$username`
  )!;

  const form = useForm({
    initialValues: profile!,
    validate: zodResolver(insertProfileSchema),
  });

  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (!isOwnProfile) return navigate("../");
    else open();
  }, []);

  return (
    <Modal
      title={"Edit Your Profile"}
      opened={opened}
      onClose={() => {
        close();
        setTimeout(() => navigate("../"), 500);
      }}
    >
      <Text></Text>
      <Form>
        <TextInput
          description="Your username cannot be changed."
          disabled
          label="Username"
          name="username"
          readOnly
          withAsterisk
          {...form.getInputProps("username")}
        />
        <TextInput
          description="The name you want to be displayed on your profile"
          label="Display Name"
          name="displayName"
          placeholder="Enter your name"
          withAsterisk
          {...form.getInputProps("displayName")}
        />
        <TextInput
          label="Contact Email"
          name="email"
          placeholder="Enter your email"
          withAsterisk
          {...form.getInputProps("contactEmail")}
        />
      </Form>
    </Modal>
  );
}
