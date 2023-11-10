import { Button, Fieldset, Flex, Stack, Textarea } from "@mantine/core";
import { type useForm } from "@mantine/form";
import { type IProfileFull } from "db/schema";

interface Props {
  form: ReturnType<typeof useForm<IProfileFull>>;
  setStep: (step: string) => void;
}

export function ProfileBioFieldset({ form, setStep }: Props) {
  return (
    <Fieldset legend="Your Bio">
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
        <Flex gap="md" justify="center">
          <Button onClick={() => setStep("about")} variant="subtle">
            Back
          </Button>
          <Button disabled variant="subtle">
            Next
          </Button>
        </Flex>
      </Stack>
    </Fieldset>
  );
}
