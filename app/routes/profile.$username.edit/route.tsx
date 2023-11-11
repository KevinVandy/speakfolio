import { useEffect, useMemo, useState } from "react";
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
  Flex,
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
import { profileBiosTable } from "db/schemas/profileBiosTable";
import {
  type IProfileFull,
  profileColors,
  profilesTable,
} from "db/schemas/profilesTable";
import { ProfileAboutFieldset } from "./ProfileAbout";
import { ProfileBioFieldset } from "./ProfileBio";
import { ProfileCustomizationFieldset } from "./ProfileCustomization";
import { ProfileLinksFieldset } from "./ProfileLinks";
import { useFetchProfile } from "~/hooks/queries/useFetchProfile";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { transformDotNotation } from "~/util/transformDotNotation";
import { linkSites, profileLinksTable } from "db/schema";

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
    .object({
      plainText: z
        .string()
        .max(4000, { message: "Bio max 4000 characters" })
        .optional()
        .nullish(),
    })
    .optional()
    .nullish(),
  company: z
    .string()
    .max(100, { message: "Company name max 100 characters" })
    .optional()
    .nullish(),
  contactEmail: z
    .union([
      z.string().email({ message: "Contact email is not a valid email" }),
      z.string().length(0),
    ])
    .optional()
    .nullish(),
  coverImageUrl: z
    .union([
      z.string().url({ message: "Cover Photo must be a valid URL" }),
      z.string().length(0),
    ])
    .optional()
    .nullish()
    .transform((s) => s || null),
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
  links: z
    .array(
      z.object({
        site: z.enum(linkSites),
        title: z
          .string()
          .max(100, { message: "Link label max 100 characters" })
          .optional()
          .nullish(),
        url: z
          .string()
          .url({ message: "Link URL must be a valid URL" })
          .max(100, { message: "Link URL max 100 characters" }),
      })
    )
    .optional()
    .nullish(),
  location: z
    .string()
    .max(100, { message: "Location max 100 characters" })
    .optional()
    .nullish(),
  name: z.string().min(1, { message: "Display Name is required" }),
  profession: z
    .string()
    .max(100, { message: "Profession max 100 characters" })
    .optional()
    .nullish(),
  profileColor: z.enum(profileColors),
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
  const rawData = transformDotNotation(
    Object.fromEntries(await request.formData())
  );

  console.log("links", rawData.links);

  console.log("raw", rawData);

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
    //TODO: update profile and profileBios in a transaction
    await db
      .update(profilesTable)
      .set({
        areasOfExpertise: data.areasOfExpertise,
        company: data.company,
        contactEmail: data.contactEmail,
        coverImageUrl: data.coverImageUrl,
        headline: data.headline,
        jobTitle: data.jobTitle,
        location: data.location,
        name: data.name,
        profession: data.profession,
        profileColor: data.profileColor,
        profileImageUrl: data.profileImageUrl,
      })
      .where(eq(profilesTable.id, data.id));
    if (data.bio?.plainText) {
      await db
        .update(profileBiosTable)
        .set({ plainText: data.bio.plainText })
        .where(eq(profileBiosTable.profileId, data.id));
    }
    await db
      .delete(profileLinksTable)
      .where(eq(profileLinksTable.profileId, data.id));
    if (data.links?.length) {
      await db
        .insert(profileLinksTable)
        .values(data.links.map((link) => ({ ...link, profileId: data.id })));
    }
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

interface StepProps {
  backNextButtons: React.ReactNode;
  form: ReturnType<typeof useForm<IProfileFull>>;
  setStep: (step: string) => void;
}

const steps = [
  {
    component: (props: StepProps) => (
      <ProfileCustomizationFieldset {...props} />
    ),
    id: "customization",
    title: "Profile Customization",
  },
  {
    component: (props: StepProps) => <ProfileAboutFieldset {...props} />,
    id: "about",
    title: "About You",
  },
  {
    component: (props: StepProps) => <ProfileBioFieldset {...props} />,
    id: "bio",
    title: "Your Bio",
  },
  {
    component: (props: StepProps) => <ProfileLinksFieldset {...props} />,
    id: "links",
    title: "Social Links",
  },
];

export default function EditProfileModal() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { username } = useParams();

  const { data: profile } = useFetchProfile({ username });
  const { isOwnProfile } = profile;

  const form = useForm<IProfileFull>({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileSchema),
  });

  const initialCurrentStep = searchParams.get("currentStep");
  const [currentStep, _setCurrentStep] = useState(initialCurrentStep);
  const setCurrentStep = (step: null | string) => {
    _setCurrentStep(step);
    history.replaceState(null, "", `?currentStep=${step}`);
  };

  const [opened, { close, open }] = useDisclosure(false);

  const closeEditModal = () => {
    close();
    setTimeout(() => navigate(".."), 500);
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

  const currentStepIndex = useMemo(
    () => steps.findIndex((step) => step.id === currentStep),
    [currentStep]
  );

  const goToNextStep = () => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const goToPreviousStep = () => {
    const previousStep = steps[currentStepIndex - 1];
    if (previousStep) {
      setCurrentStep(previousStep.id);
    }
  };

  const backNextButtons = (
    <Flex gap="md" justify="center">
      <Button
        disabled={currentStepIndex === 0}
        onClick={goToPreviousStep}
        variant="subtle"
      >
        Back
      </Button>
      <Button
        disabled={currentStepIndex === steps.length - 1}
        onClick={goToNextStep}
        variant="subtle"
      >
        Next
      </Button>
    </Flex>
  );

  return (
    <Modal
      closeOnClickOutside={!form.isDirty()}
      onClose={handleCancel}
      opened={opened}
      size="lg"
      title={"Edit Your Speakfolio"}
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
              <Accordion.Panel py="lg">
                {step.component({
                  backNextButtons,
                  form,
                  setStep: setCurrentStep,
                })}
              </Accordion.Panel>
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
