import { Modal, ModalProps, Title } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Form } from "@remix-run/react";
import { IProfile, insertProfileSchema } from "db/schemas/profiles";

// const profileSchema = insertProfileSchema.merge({});

interface Props extends ModalProps {
  profile: IProfile;
}

export function EditProfileModal({ profile, ...rest }: Props) {
  const form = useForm({
    initialValues: profile,
    validate: zodResolver(insertProfileSchema),
  });

  return <Modal {...rest}>
    <Title order={3}>Edit Your Profile</Title>
    <Form>
      
    </Form>
  </Modal>;
}
