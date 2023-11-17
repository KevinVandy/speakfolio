import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { Autocomplete, Stack, Text, Textarea } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { modals } from "@mantine/modals";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profilesTable } from "db/schema";
import { SaveContinueCancelButtons } from "~/components/SaveContinueCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { transformDotNotation } from "~/util/transformDotNotation";

const profileCareerSchema = z.object({
  areasOfExpertise: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .optional()
    .nullish(),
  // company: z
  //   .string()
  //   .max(100, { message: "Company name max 100 characters" })
  //   .optional()
  //   .nullish(),
  id: z.string().uuid(),
  // jobTitle: z
  //   .string()
  //   .max(100, { message: "Job Title max 100 characters" })
  //   .optional()
  //   .nullish(),
  profession: z
    .string()
    .max(100, { message: "Profession max 100 characters" })
    .optional()
    .nullish(),
  userId: z.string().uuid(),
});

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

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

  //validate data
  const validationResult = profileCareerSchema.safeParse(rawData);
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

  //update profile bio
  try {
    await db
      .update(profilesTable)
      .set({
        areasOfExpertise: data.areasOfExpertise,
        profession: data.profession,
      })
      .where(eq(profilesTable.id, data.id));
    return redirect("..");
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

export default function EditProfileCareerTab() {
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? profile!,
    validate: zodResolver(profileCareerSchema),
  });

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

  const openConfirmCancelModal = (onConfirm?: () => void) =>
    modals.openConfirmModal({
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { cancel: "Continue Editing", confirm: "Discard" },
      onConfirm: onConfirm ?? (() => navigate("..")),
      title: "Are you sure you want to discard your changes?",
    });

  const handleCancel = () => {
    if (form.isDirty()) {
      openConfirmCancelModal();
    } else {
      navigate("..");
    }
  };

  return (
    <Form
      method="post"
      onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
    >
      <input name="id" type="hidden" value={profile.id} />
      <input name="userId" type="hidden" value={profile.userId!} />
      <Stack gap="md" m="auto" maw="600px" my="xl">
        <Autocomplete
          data={commonProfessions}
          description="(Optional) Your profession or industry"
          label="Profession"
          name="profession"
          placeholder="Profession"
          {...form.getInputProps("profession")}
        />
        {/* <TextInput
          description="(Optional) Your job title"
          label="Job Title"
          name="jobTitle"
          placeholder="Job Title"
          {...form.getInputProps("jobTitle")}
        /> */}
        {/* <TextInput
          description="(Optional) Your company"
          label="Company"
          name="company"
          placeholder="Company"
          {...form.getInputProps("company")}
        /> */}
        <Textarea
          label="Areas of Expertise"
          maxLength={100}
          minRows={2}
          name="areasOfExpertise"
          placeholder="List up to 10 areas of expertise"
          {...form.getInputProps("areasOfExpertise")}
        />
        {Object.values(form?.errors ?? []).map((error, i) => (
          <Text c="red" key={i}>
            {error}
          </Text>
        ))}
        <SaveContinueCancelButtons
          disabled={!form.isDirty()}
          onCancel={handleCancel}
        />
      </Stack>
    </Form>
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
