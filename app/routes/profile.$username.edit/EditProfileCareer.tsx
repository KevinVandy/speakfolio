import {
  Autocomplete,
  Fieldset,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { type useForm } from "@mantine/form";
import { type IProfileFull } from "db/schema";

interface Props {
  form: ReturnType<typeof useForm<IProfileFull>>;
}

export function EditProfileCareerFieldset({ form }: Props) {
  return (
    <Fieldset variant="unstyled">
      <Stack gap="md">
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
      </Stack>
    </Fieldset>
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
