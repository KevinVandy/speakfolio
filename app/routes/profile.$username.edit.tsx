import { useEffect, useState } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  Accordion,
  Autocomplete,
  Avatar,
  BackgroundImage,
  Button,
  Center,
  Collapse,
  Fieldset,
  Flex,
  LoadingOverlay,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconAt, IconCircle, IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profileColorEnum, profilesTable } from "db/schemas/profiles";
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
  const theme = useMantineTheme();

  const { data: profile } = useFetchProfile({ username });
  const { isOwnProfile } = profile;

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileSchema),
  });

  const [opened, { close, open }] = useDisclosure(false);
  const [step, setStep] = useState<null | string>("customization");

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
    if (!profile || !isOwnProfile) return navigate("../");
    else open();
  }, []);

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

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
          onChange={setStep}
          pos="relative"
          value={step}
        >
          <LoadingOverlay visible={navigation.state === "submitting"} />
          <Accordion.Item value="customization">
            <Collapse in={step !== "customization"}>
              <Accordion.Control>Profile Customization</Accordion.Control>
            </Collapse>
            <Accordion.Panel py="lg">
              <Fieldset legend="Profile Customization">
                <Stack gap="md">
                  <TextInput
                    description="The name you want to be displayed on your profile (Full Name)"
                    label="Display Name"
                    name="displayName"
                    placeholder="Enter your name"
                    withAsterisk
                    {...form.getInputProps("displayName")}
                  />
                  <TextInput
                    description="Public email address"
                    label="Contact Email"
                    leftSection={<IconAt size="1rem" />}
                    name="contactEmail"
                    placeholder="Enter your public contact email"
                    {...form.getInputProps("contactEmail")}
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
                          theme.colors[
                            form.getInputProps("profileColor").value
                          ]["7"]
                        }
                        size="1rem"
                      />
                    }
                    name="profileColor"
                    {...form.getInputProps("profileColor")}
                  />
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
                  <BackgroundImage
                    mb="xl"
                    radius="xs"
                    src={form.getTransformedValues().coverImageUrl ?? ""}
                  >
                    <Center mih="100px" style={{ alignItems: "flex-end" }}>
                      <Avatar
                        color={
                          form.getTransformedValues().profileColor ?? "blue"
                        }
                        radius="100%"
                        size="xl"
                        src={form.getTransformedValues().profileImageUrl ?? ""}
                        style={{ transform: "translateY(2rem)" }}
                        variant="filled"
                      />
                    </Center>
                  </BackgroundImage>
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
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="about">
            <Collapse in={step !== "about"}>
              <Accordion.Control>About You</Accordion.Control>
            </Collapse>
            <Accordion.Panel py="lg">
              <Fieldset legend="About You">
                <Stack gap="md">
                  <TextInput
                    description="(Optional) A 1-line description of yourself"
                    label="Headline"
                    name="headline"
                    placeholder="Headline"
                    {...form.getInputProps("headline")}
                  />
                  <Autocomplete
                    data={commonProfessions}
                    description="(Optional) Your profession or industry"
                    label="Profession"
                    name="profession"
                    placeholder="Profession"
                    {...form.getInputProps("profession")}
                  />
                  <TextInput
                    description="(Optional) Your job title"
                    label="Job Title"
                    name="jobTitle"
                    placeholder="Job Title"
                    {...form.getInputProps("jobTitle")}
                  />
                  <TextInput
                    description="(Optional) Your company"
                    label="Company"
                    name="company"
                    placeholder="Company"
                    {...form.getInputProps("company")}
                  />
                  <Textarea
                    label="Areas of Expertise"
                    maxLength={100}
                    minRows={2}
                    name="areasOfExpertise"
                    placeholder="List up to 10 areas of expertise"
                    {...form.getInputProps("areasOfExpertise")}
                  />
                  <Flex gap="md" justify="center">
                    <Button
                      onClick={() => setStep("customization")}
                      variant="subtle"
                    >
                      Back
                    </Button>
                    <Button onClick={() => setStep("bio")} variant="subtle">
                      Next
                    </Button>
                  </Flex>
                </Stack>
              </Fieldset>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="bio">
            <Collapse in={step !== "bio"}>
              <Accordion.Control>Your Bio</Accordion.Control>
            </Collapse>
            <Accordion.Panel py="lg">
              <Fieldset legend="Your Bio">
                <Stack gap="md">
                  <Textarea
                    autosize
                    description="(Optional) A detailed bio about yourself (Max 4000 characters)"
                    label="Bio"
                    maxLength={4000}
                    minRows={5}
                    name="bio"
                    placeholder="Bio"
                    {...form.getInputProps("bio")}
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
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        {Object.values(form.errors).map((error, i) => (
          <Text c="red" key={i}>
            {error}
          </Text>
        ))}
        <SimpleGrid cols={2} mt="xl">
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

const commonProfessions = [
  "Accountant",
  "Administrative Assistant",
  "Aerospace Engineer",
  "Biochemist",
  "Biomedical Engineer",
  "Business Analyst",
  "Business Development Manager",
  "Chemical Engineer",
  "Chief Executive Officer",
  "Chief Financial Officer",
  "Chief Operating Officer",
  "Civil Engineer",
  "Compliance Officer",
  "Computer Scientist",
  "Cybersecurity Analyst",
  "Data Analyst",
  "Data Scientist",
  "Database Administrator",
  "DevOps Engineer",
  "Digital Marketing Manager",
  "E-commerce Manager",
  "Electrical Engineer",
  "Environmental Scientist",
  "Executive Assistant",
  "Financial Analyst",
  "Financial Planner",
  "Geneticist",
  "Graphic Designer",
  "Human Resources Director",
  "Human Resources Manager",
  "IT Consultant",
  "IT Project Manager",
  "Industrial Engineer",
  "Information Technology Manager",
  "Investment Banker",
  "Legal Counsel",
  "Logistics Manager",
  "Machine Learning Engineer",
  "Management Consultant",
  "Marketing Manager",
  "Materials Scientist",
  "Mechanical Engineer",
  "Microbiologist",
  "Network Administrator",
  "Operations Manager",
  "Pharmaceutical Sales Representative",
  "Physicist",
  "Product Manager",
  "Product Marketing Manager",
  "Project Manager",
  "Public Relations Specialist",
  "Quality Assurance Engineer",
  "Real Estate Developer",
  "Research Scientist",
  "Research and Development Engineer",
  "Risk Manager",
  "Robotics Engineer",
  "Sales Director",
  "Sales Manager",
  "Sales Representative",
  "Software Developer",
  "Software Engineer",
  "Statistician",
  "Strategic Planner",
  "Structural Engineer",
  "Supply Chain Manager",
  "Systems Analyst",
  "Systems Architect",
  "Systems Engineer",
  "Talent Acquisition Specialist",
  "Tax Advisor",
  "Technical Sales Engineer",
  "Technical Support Specialist",
  "Technical Writer",
  "Training and Development Manager",
  "UI/UX Designer",
  "Venture Capitalist",
  "Web Developer",
];
