import { useEffect, useMemo } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate, useParams } from "@remix-run/react";
import { Modal, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import {
  useDebouncedValue,
  useDisclosure,
  useMediaQuery,
} from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { Link, RichTextEditor } from "@mantine/tiptap";
import Highlight from "@tiptap/extension-highlight";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import xss from "xss";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profileCareerHistoriesTable } from "db/schema";
import { SaveContinueCancelButtons } from "~/components/SaveContinueCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { transformDotNotation } from "~/util/transformDotNotation";
import { xssOptions } from "~/util/xssOptions";

type IProfileCareerFormCareerHistory = {
  company: string;
  description: string;
  endDate: Date | null;
  id: string;
  jobTitle: string;
  profileId: string;
  startDate: Date | null;
  userId?: string;
};

export const careerHistorySchema = z.object({
  company: z
    .string()
    .max(100, { message: "Company name max 100 characters" })
    .optional()
    .nullish(),
  description: z.string().optional().nullish(),
  endDate: z.coerce.date().optional().nullish(),
  id: z.union([z.string().uuid(), z.string().length(0)]),
  jobTitle: z
    .string()
    .max(100, { message: "Job Title max 100 characters" })
    .optional()
    .nullish(),
  profileId: z.string().uuid(),
  startDate: z.coerce.date(),
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
  const validationResult = careerHistorySchema.safeParse(rawData);
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

  console.log(data);

  //update or add career history
  try {
    const cleanDescription = xss(data.description ?? "", xssOptions);
    if (data.id) {
      await db
        .update(profileCareerHistoriesTable)
        .set({
          company: data.company,
          description: cleanDescription,
          endDate: data.endDate?.toDateString(),
          jobTitle: data.jobTitle,
          startDate: data.startDate?.toDateString(),
        })
        .where(eq(profileCareerHistoriesTable.id, data.id));
    } else {
      await db.insert(profileCareerHistoriesTable).values({
        company: data.company,
        description: cleanDescription,
        endDate: data.endDate?.toDateString(),
        jobTitle: data.jobTitle,
        profileId: data.profileId,
        startDate: data.startDate.toDateString(),
      });
    }
    return redirect("..");
  } catch (error) {
    console.error(error);
    returnData = {
      ...returnData,
      data,
      errors: {
        form: data.id
          ? "Error updating career history"
          : "Error adding career history",
      },
      success: false,
    };
    return json(returnData, { status: 422 });
  }
}

export default function CareerAddHistoryModal() {
  const { id: careerHistoryId } = useParams();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [opened, { close, open }] = useDisclosure(false);

  const initialCareerHistory = useMemo(() => {
    const history: any = careerHistoryId
      ? profile.careerHistories?.find((ch) => ch.id === careerHistoryId)
      : null;
    if (history) {
      history.startDate = new Date(history.startDate);
      history.endDate = new Date(history.endDate);
    }
    return history;
  }, []);

  const form = useForm<IProfileCareerFormCareerHistory>({
    initialErrors: actionData?.errors,
    initialValues: {
      ...(actionData?.data ??
        initialCareerHistory ?? {
          company: "",
          description: "",
          endDate: null,
          jobTitle: "",
          startDate: null,
        }),
      id: careerHistoryId ?? "",
      profileId: profile.id,
      userId: profile.userId!,
    },
    validate: zodResolver(careerHistorySchema),
  });

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

  const closeEditModal = () => {
    close();
    setTimeout(() => {
      navigate("..");
    }, 500);
  };

  const openConfirmCancelModal = (onConfirm?: () => void) =>
    modals.openConfirmModal({
      children: <Text size="sm">None of your changes will be saved</Text>,
      labels: { cancel: "Continue Editing", confirm: "Discard" },
      onConfirm: onConfirm ?? closeEditModal,
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
    open();
  }, []);

  const editor = useEditor({
    content: form.values.description || "",
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
  });

  const [debouncedBio] = useDebouncedValue(editor?.getHTML() || "", 500);

  useEffect(() => {
    if (!debouncedBio) return;
    if (debouncedBio !== form.values.description) {
      form.setFieldValue("description", debouncedBio);
    }
  }, [debouncedBio]);

  return (
    <Modal
      closeOnClickOutside={!form.isDirty()}
      onClose={handleCancel}
      opened={opened}
      size={"lg"}
      title={`${careerHistoryId ? "Update" : "Add"} Career History`}
    >
      <Form
        method="post"
        onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
      >
        <input name="profileId" type="hidden" value={profile.id} />
        <input name="userId" type="hidden" value={profile.userId!} />
        <input name="id" type="hidden" value={careerHistoryId} />
        <input
          name="description"
          type="hidden"
          value={form.values.description ?? ""}
        />
        <Stack gap="md" p={isMobile ? "0" : "md"}>
          <TextInput
            description="Company or Organization"
            label="Company"
            name="company"
            placeholder="Company"
            {...form.getInputProps("company")}
          />
          <TextInput
            description="Your role in this position"
            label="Job Title"
            name="jobTitle"
            placeholder="Job Title"
            {...form.getInputProps("jobTitle")}
          />
          <SimpleGrid cols={isMobile ? 1 : 2}>
            <MonthPickerInput
              description="When did you start working here?"
              label="Start Date"
              maxDate={form.getTransformedValues().endDate ?? new Date()}
              name="startDate"
              placeholder="Start Date"
              withAsterisk
              {...form.getInputProps("startDate")}
            />
            <MonthPickerInput
              description="When did you stop working here?"
              label="End Date"
              minDate={form.getTransformedValues().startDate ?? new Date()}
              name="endDate"
              placeholder="(Optional if current) End Date"
              {...form.getInputProps("endDate")}
            />
          </SimpleGrid>
          <Stack gap="0">
            <Text mt="xs">Description</Text>
            <Text c="dimmed" size="xs">
              Description of your role
            </Text>
          </Stack>
          <RichTextEditor editor={editor}>
            <RichTextEditor.Toolbar
              sticky
              stickyOffset={0}
              style={{ justifyContent: "center" }}
            >
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H5 />
                <RichTextEditor.H6 />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
            <RichTextEditor.Content />
            <BubbleMenu editor={editor!}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Link />
                <RichTextEditor.OrderedList />
                <RichTextEditor.BulletList />
                <RichTextEditor.ClearFormatting />
              </RichTextEditor.ControlsGroup>
            </BubbleMenu>
          </RichTextEditor>
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
    </Modal>
  );
}
