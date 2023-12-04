import { useEffect, useMemo } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import {
  LoadingOverlay,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import xss from "xss";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "db/connection";
import { profileCareerHistoriesTable } from "db/schema";
import {
  getProfileErrorNotification,
  getProfileSavingNotification,
  getProfileSuccessNotification,
} from "~/components/Notifications";
import { RichTextInput } from "~/components/RichTextInput";
import { SaveCancelButtons } from "~/components/SaveCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { transformDotNotation } from "~/util/transformDotNotation";
import { validateAuth } from "~/util/validateAuth.server";
import { xssOptions } from "~/util/xssOptions";
import { getAuth } from "@clerk/remix/ssr.server";

type IProfileCareerFormCareerHistory = {
  company: string;
  description: string;
  endDate: Date | null;
  careerHistoryId: string;
  jobTitle: string;
  profileId: string;
  startDate: Date | null;
  userId?: string;
};

export const careerHistorySchema = z.object({
  careerHistoryId: z.union([z.string().uuid(), z.string().length(0)]),
  company: z
    .string()
    .max(100, { message: "Company name max 100 characters" })
    .nullish(),
  description: z.string().nullish(),
  endDate: z.union([z.null(), z.string().length(0), z.coerce.date()]),
  jobTitle: z
    .string()
    .max(100, { message: "Job Title max 100 characters" })
    .nullish(),
  startDate: z.coerce.date(),
});

interface ProfileUpdateResponse {
  data: any;
  errors: any;
  success: boolean;
}

export async function action(args: ActionFunctionArgs) {
  const { request } = args;

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
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }

  //update or add career history
  try {
    const cleanDescription = xss(data.description ?? "", xssOptions);
    if (data.careerHistoryId) {
      const updateResult = await db
        .update(profileCareerHistoriesTable)
        .set({
          company: data.company,
          description: cleanDescription,
          endDate: data.endDate ? new Date(data.endDate).toDateString() : null,
          jobTitle: data.jobTitle,
          startDate: data.startDate?.toDateString(),
        })
        .where(
          and(
            eq(profileCareerHistoriesTable.id, data.careerHistoryId),
            eq(profileCareerHistoriesTable.profileId, userId)
          )
        );
      if (updateResult.count !== 1) throw new Error("Error updating profile");
    } else {
      const insertResult = await db.insert(profileCareerHistoriesTable).values({
        company: data.company,
        description: cleanDescription,
        endDate: data.endDate ? new Date(data.endDate)?.toDateString() : null,
        jobTitle: data.jobTitle,
        profileId: userId,
        startDate: data.startDate.toDateString(),
      });
      if (insertResult.count !== 1)
        throw new Error("Error adding career history");
    }
    return json({
      ...returnData,
      data,
      success: true,
    });
  } catch (error) {
    console.error(error);
    returnData = {
      ...returnData,
      data,
      errors: {
        form: data.careerHistoryId
          ? "Error updating career history"
          : "Error adding career history",
      },
      success: false,
    };
    return json(returnData, { status: 400 });
  }
}

export default function CareerAddHistoryModal() {
  const { id: careerHistoryId = "" } = useParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [opened, { close, open }] = useDisclosure(false);

  const initialCareerHistory = useMemo(() => {
    const history: any = careerHistoryId
      ? { ...profile.careerHistories?.find((ch) => ch.id === careerHistoryId) }
      : null;
    if (history) {
      history.startDate = new Date(history.startDate);
      history.startDate.setDate(15);
      if (history.endDate) {
        history.endDate = new Date(history.endDate);
        history.endDate.setDate(15);
      }
      if (history.description)
        history.description = xss(history.description, xssOptions);
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
      careerHistoryId,
    },
    validate: zodResolver(careerHistorySchema),
  });

  useEffect(() => {
    if (actionData?.success) {
      //show success notification
      notifications.update(
        getProfileSuccessNotification("career-history-update")
      );
      navigate("..");
    } else if (actionData?.errors) {
      //show error notification
      notifications.update(
        getProfileErrorNotification("career-history-update")
      );
      //sync back-end errors with form
      if (Object.keys(actionData?.errors ?? {}).length) {
        form.setErrors({ ...form.errors, ...actionData.errors });
      }
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
        onSubmit={(event) =>
          form.validate().hasErrors
            ? event.preventDefault()
            : notifications.show(
                getProfileSavingNotification("career-history-update")
              )
        }
      >
        <input name="careerHistoryId" type="hidden" value={careerHistoryId} />
        <input
          name="description"
          type="hidden"
          value={form.values.description ?? ""}
        />
        <Stack gap="md" p={isMobile ? "0" : "md"} pos="relative">
          <LoadingOverlay visible={navigation.state === "submitting"} />
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
              dropdownType={isMobile ? "modal" : "popover"}
              label="Start Date"
              maxDate={form.getTransformedValues().endDate ?? new Date()}
              name="startDate"
              placeholder="Start Date"
              withAsterisk
              {...form.getInputProps("startDate")}
              onChange={(newDate) => {
                if (newDate) {
                  newDate.setDate(15);
                }
                form.getInputProps("startDate").onChange(newDate);
              }}
            />
            <MonthPickerInput
              clearable
              description="(Optional) When did you stop working here?"
              dropdownType={isMobile ? "modal" : "popover"}
              label="End Date"
              maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
              minDate={form.getTransformedValues().startDate ?? undefined}
              name="endDate"
              placeholder="End Date (If not current)"
              {...form.getInputProps("endDate")}
              onChange={(newDate) => {
                if (newDate) {
                  newDate.setDate(15);
                }
                form.getInputProps("endDate").onChange(newDate);
              }}
            />
          </SimpleGrid>
          <Stack gap="0">
            <Text mt="xs">Description</Text>
            <Text c="dimmed" size="xs">
              Description of your role
            </Text>
          </Stack>
          <RichTextInput
            description="Description of your role"
            label="Description"
            onChangeDebounced={(debouncedValue) =>
              form.setFieldValue("description", debouncedValue)
            }
            showHeadings
            value={form.values.description ?? ""}
          />
          {Object.values(form?.errors ?? []).map((error, i) => (
            <Text c="red" key={i}>
              {error}
            </Text>
          ))}
          <SaveCancelButtons
            disabled={!form.isDirty()}
            onCancel={handleCancel}
          />
        </Stack>
      </Form>
    </Modal>
  );
}
