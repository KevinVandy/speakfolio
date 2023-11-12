import { Fieldset, Stack, Textarea } from "@mantine/core";
import { type useForm } from "@mantine/form";
import { type IProfileFull } from "db/schema";

interface Props {
  form: ReturnType<typeof useForm<IProfileFull>>;
}

export function EditProfileBioFieldset({ form }: Props) {
  return (
    <Fieldset variant="unstyled">
      <Stack gap="md">
        <Textarea
          autosize
          description="(Optional) A detailed bio about yourself (Max 4000 characters)"
          label="Bio"
          maxLength={4000}
          minRows={5}
          name="bio.plainText"
          placeholder="Bio"
          {...form.getInputProps("bio.plainText")}
        />
      </Stack>
    </Fieldset>
  );
}
