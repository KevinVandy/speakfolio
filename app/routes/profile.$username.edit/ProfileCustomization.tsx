import {
  Avatar,
  BackgroundImage,
  Button,
  Center,
  Fieldset,
  Flex,
  Select,
  Stack,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { type useForm } from "@mantine/form";
import { IconAt, IconCircle } from "@tabler/icons-react";
import { type IProfileFull } from "db/schema";

interface Props {
  form: ReturnType<typeof useForm<IProfileFull>>;
  setStep: (step: string) => void;
}

export function ProfileCustomizationFieldset({ form, setStep }: Props) {
  const theme = useMantineTheme();

  return (
    <Fieldset legend="Profile Customization">
      <Stack gap="md">
        <BackgroundImage
          mb="xl"
          radius="xs"
          src={form.getTransformedValues().coverImageUrl ?? ""}
        >
          <Center mih="100px" style={{ alignItems: "flex-end" }}>
            <Avatar
              color={form.getTransformedValues().profileColor ?? "blue"}
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
          description="Public email address"
          label="Contact Email"
          leftSection={<IconAt size="1rem" />}
          name="contactEmail"
          placeholder="Enter your public contact email"
          {...form.getInputProps("contactEmail")}
        />
        <Flex gap="md" justify="center">
          <Button disabled variant="subtle">
            Back
          </Button>
          <Button onClick={() => setStep("about")} variant="subtle">
            Next
          </Button>
        </Flex>
      </Stack>
    </Fieldset>
  );
}
