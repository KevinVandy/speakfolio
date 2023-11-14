import {
  Avatar,
  BackgroundImage,
  Center,
  Fieldset,
  Select,
  Stack,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { type useForm } from "@mantine/form";
import { IconCircle } from "@tabler/icons-react";
import { type IProfileFull } from "db/schema";

interface Props {
  form: ReturnType<typeof useForm<IProfileFull>>;
}

export function EditProfileCustomizationFieldset({ form }: Props) {
  const theme = useMantineTheme();

  return (
    <Fieldset variant="unstyled">
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
          description="(Optional) The region where you live or are willing to travel to"
          label="Location"
          name="location"
          placeholder="Location"
          {...form.getInputProps("location")}
        />
        <TextInput
          description="(Optional) A 1-line description of yourself"
          label="Headline"
          name="headline"
          placeholder="Headline"
          {...form.getInputProps("headline")}
        />
      </Stack>
    </Fieldset>
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
