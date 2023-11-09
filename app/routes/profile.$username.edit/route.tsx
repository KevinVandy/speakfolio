import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import {
  Accordion,
  Button,
  Collapse,
  LoadingOverlay,
  Modal,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import {
  type IProfileFull,
  profileColorEnum,
  profilesTable,
} from "db/schemas/profiles";
import { ProfileAboutFieldset } from "./ProfileAbout";
import { ProfileBioFieldset } from "./ProfileBio";
import { ProfileCustomizationFieldset } from "./ProfileCustomization";
import { useFetchProfile } from "~/hooks/queries/useFetchProfile";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

const profileSchema = z.object({
  areasOfExpertise: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  bio: z
    .string()
    .max(4000, { message: "Bio max 4000 characters" })
    .optional()
    .nullish(),
  company: z
    .string()
    .max(100, { message: "Company name max 100 characters" })
    .optional()
    .nullish(),
  contactEmail: z
    .string()
    .email({ message: "Contact email is not a valid email" })
    .optional(),
  coverImageUrl: z
    .union([
      z.string().url({ message: "Cover Photo must be a valid URL" }),
      z.string().length(0),
    ])
    .optional()
    .nullish()
    .transform((s) => s || null),
  displayName: z.string().min(1, { message: "Display Name is required" }),
  headline: z
    .string()
    .max(100, { message: "Headline max 100 characters" })
    .optional()
    .nullish(),
  id: z.string().uuid(),
  jobTitle: z
    .string()
    .max(100, { message: "Job Title max 100 characters" })
    .optional()
    .nullish(),
  profession: z
    .string()
    .max(100, { message: "Profession max 100 characters" })
    .optional()
    .nullish(),
  profileColor: z.enum(profileColorEnum.enumValues),
  profileImageUrl: z
    .union([
      z.string().url({ message: "Profile Image must be a valid URL" }),
      z.string().length(0),
    ])
    .optional()
    .nullish()
    .transform((s) => s || null),
  userId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  let returnData: ProfileUpdateResponse = {
    data: {},
    errors: {},
    success: false,
  };

  //get data from form
  const rawData = Object.fromEntries(await request.formData());

  //validate data
  const validationResult = profileSchema.safeParse(rawData);
  const { success } = validationResult;
  if (!success) {
    const errors = validationResult.error.formErrors.fieldErrors;
    returnData = { ...returnData, data: rawData, errors, success };
    return json(returnData, { status: 422 });
  }
  const { data } = validationResult;

  //validate auth
  const authUser = await supabase.auth.getUser();
  if (!authUser || authUser.data.user?.id !== data.userId) {
    return redirect("/sign-in");
  }

  //update profile
  try {
    await db
      .update(profilesTable)
      .set({
        areasOfExpertise: data.areasOfExpertise,
        bio: data.bio,
        company: data.company,
        contactEmail: data.contactEmail,
        coverImageUrl: data.coverImageUrl,
        displayName: data.displayName,
        headline: data.headline,
        jobTitle: data.jobTitle,
        profession: data.profession,
        profileColor: data.profileColor,
        profileImageUrl: data.profileImageUrl,
      })
      .where(eq(profilesTable.id, data.id));
    return redirect("../");
  } catch (error) {
    console.error(error);
    returnData = {
      ...returnData,
      data,
      errors: {
        form: "Error updating profile",
      },
      success: false,
    };
    return json(returnData, { status: 422 });
  }
}

export default function EditProfileModal() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { username } = useParams();

  const { data: profile } = useFetchProfile({ username });
  const { isOwnProfile } = profile;

  const form = useForm<IProfileFull>({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileSchema),
  });

  const [opened, { close, open }] = useDisclosure(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const currentStep = searchParams.get("currentStep");
  const setCurrentStep = (step: null | string) => {
    setSearchParams((prev) => ({ ...prev, currentStep: step }));
  };

  const closeEditModal = () => {
    close();
    setTimeout(() => navigate("../"), 500);
  };

  const openConfirmCancelModal = () =>
    modals.openConfirmModal({
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { cancel: "Continue Editing", confirm: "Discard" },
      onConfirm: closeEditModal,
      title: "Are you sure you want to discard your changes?",
    });

  const handleCancel = () => {
    if (form.isDirty()) {
      openConfirmCancelModal();
    } else {
      closeEditModal();
    }
  };

  useEffect(() => {
    if (!profile || !isOwnProfile) {
      return navigate("../");
    } else {
      open();
    }
    if (!currentStep) {
      setCurrentStep("customization");
    }
  }, []);

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

  const steps = [
    {
      component: (
        <ProfileCustomizationFieldset form={form} setStep={setCurrentStep} />
      ),
      id: "customization",
      title: "Profile Customization",
    },
    {
      component: <ProfileAboutFieldset form={form} setStep={setCurrentStep} />,
      id: "about",
      title: "About You",
    },
    {
      component: <ProfileBioFieldset form={form} setStep={setCurrentStep} />,
      id: "bio",
      title: "Your Bio",
    },
  ];

  return (
    <Modal
      closeOnClickOutside={!form.isDirty()}
      onClose={handleCancel}
      opened={opened}
      size="lg"
      title={"Edit Your Profile"}
    >
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <input name="id" type="hidden" value={profile.id} />
        <input name="userId" type="hidden" value={profile.userId!} />
        <Accordion
          chevron={<IconPlus />}
          onChange={setCurrentStep}
          pos="relative"
          value={currentStep}
        >
          <LoadingOverlay visible={navigation.state === "submitting"} />
          {steps.map((step) => (
            <Accordion.Item key={step.id} value={step.id}>
              <Collapse in={currentStep !== step.id}>
                <Accordion.Control>{step.title}</Accordion.Control>
              </Collapse>
              <Accordion.Panel py="lg">{step.component}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
        {Object.values(form.errors).map((error, i) => (
          <Text c="red" key={i}>
            {error}
          </Text>
        ))}
        <SimpleGrid
          bg="inherit"
          bottom={0}
          cols={2}
          my="xl"
          pos="sticky"
          w="100%"
        >
          <Button onClick={handleCancel} type="button" variant="default">
            Cancel
          </Button>
          <Button
            color="blue"
            disabled={!form.isDirty()}
            loading={navigation.state === "submitting"}
            type="submit"
          >
            Save Changes
          </Button>
        </SimpleGrid>
      </Form>
    </Modal>
  );
}
