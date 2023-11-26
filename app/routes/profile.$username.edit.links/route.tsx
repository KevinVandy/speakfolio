import { Fragment, useEffect, useState } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import {
  Button,
  Collapse,
  Fieldset,
  Flex,
  Pill,
  PillsInput,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { IconAt } from "@tabler/icons-react";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { type IProfileFull, linkSites, profileLinksTable } from "db/schema";
import { type EditProfileOutletContext } from "../profile.$username.edit/route";
import { SaveCancelButtons } from "~/components/SaveCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { transformDotNotation } from "~/util/transformDotNotation";
import { validateAuth } from "~/util/validateAuth";
import { notifications } from "@mantine/notifications";
import {
  getProfileErrorNotification,
  getProfileSavingNotification,
  getProfileSuccessNotification,
} from "~/components/Notifications";

type IProfileLinks = Pick<
  IProfileFull,
  "contactEmail" | "id" | "links" | "userId"
>;

const profileLinksSchema = z.object({
  contactEmail: z
    .union([
      z.string().email({ message: "Contact email is not a valid email" }),
      z.string().length(0),
    ])
    .nullish(),
  links: z
    .array(
      z.object({
        site: z.enum(linkSites),
        title: z
          .string()
          .max(100, { message: "Link label max 100 characters" })
          .nullish(),
        url: z
          .string()
          .url({ message: "Link URL must be a valid URL" })
          .max(100, { message: "Link URL max 100 characters" }),
      })
    )
    .nullish(),
  profileId: z.string().uuid(),
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
  const validationResult = profileLinksSchema.safeParse(rawData);
  const { success } = validationResult;
  if (!success) {
    const errors = validationResult.error.formErrors.fieldErrors;
    returnData = { ...returnData, data: rawData, errors, success };
    return json(returnData, { status: 422 });
  }
  const { data } = validationResult;

  //validate auth
  if (
    !(await validateAuth({
      profileId: data.profileId,
      supabase,
      userId: data.userId,
    }))
  ) {
    return redirect("/sign-in");
  }

  //update profile bio
  try {
    await db
      .delete(profileLinksTable)
      .where(eq(profileLinksTable.profileId, data.profileId));
    if (data.links?.length) {
      await db
        .insert(profileLinksTable)
        .values(
          data.links.map((link) => ({ ...link, profileId: data.profileId }))
        );
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
        form: "Error updating profile",
      },
      success: false,
    };
    return json(returnData, { status: 400 });
  }
}

export default function EditProfileLinksTab() {
  const { onCancel, setIsDirty } = useOutletContext<EditProfileOutletContext>();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const form = useForm<IProfileLinks>({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? {
      contactEmail: profile?.contactEmail ?? "",
      links: profile?.links ?? [],
      profileId: profile?.id ?? "",
      userId: profile?.userId ?? "",
    },
    validate: zodResolver(profileLinksSchema),
  });

  useEffect(() => {
    setIsDirty(form.isDirty());
  }, [form]);

  useEffect(() => {
    if (actionData?.success) {
      //show success notification
      notifications.update(getProfileSuccessNotification("links-update"));
      navigate("../..");
    } else if (actionData?.errors) {
      //show error notification
      notifications.update(getProfileErrorNotification("links-update"));
      //sync back-end errors with form
      if (Object.keys(actionData?.errors ?? {}).length) {
        form.setErrors({ ...form.errors, ...actionData.errors });
      }
    }
  }, [actionData]);

  const [searchValue, setSearchValue] = useState("");
  const [newSite, setNewSite] = useState<any>("");
  const [newUrl, setNewUrl] = useState("");

  const addLink = () => {
    if (newSite && newUrl) {
      form.setFieldValue("links", [
        ...(form.getTransformedValues().links || []),
        { site: newSite, url: newUrl },
      ]);
      setNewSite("");
      setNewUrl("");
      setSearchValue("");
    }
  };

  const removeLink = (site: string) => {
    form.setFieldValue(
      "links",
      form.getTransformedValues()?.links?.filter((link) => link.site !== site)
    );
  };

  return (
    <Form
      method="post"
      onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
    >
      <input name="profileId" type="hidden" value={profile.id} />
      <input name="userId" type="hidden" value={profile.userId!} />
      <TextInput
        description="Public email address"
        label="Contact Email"
        leftSection={<IconAt size="1rem" />}
        name="contactEmail"
        placeholder="Enter your public contact email"
        {...form.getInputProps("contactEmail")}
      />
      {form.getTransformedValues().links?.map((link, index) => (
        <Fragment key={`${index}-${link.site}`}>
          <input
            name={`links.${index}.site`}
            type="hidden"
            value={link.site!}
          />
          <input name={`links.${index}.url`} type="hidden" value={link.url!} />
          {link.title && (
            <input
              name={`links.${index}.title`}
              type="hidden"
              value={link.title}
            />
          )}
        </Fragment>
      ))}
      <Fieldset mt="xl">
        <Stack gap="md">
          <Collapse in={!!form.values.links?.length}>
            <PillsInput
              description="Links to your social media profiles"
              label="Social Links"
              mt="md"
            >
              {form.getTransformedValues().links?.map((link, index) => {
                return (
                  <Tooltip key={link.site} label={link.url}>
                    <Pill
                      onRemove={() => removeLink(link?.site as string)}
                      withRemoveButton
                    >
                      {link.title || link.site}
                    </Pill>
                  </Tooltip>
                );
              })}
            </PillsInput>
          </Collapse>
          <Select
            data={linkSites.filter(
              (site) =>
                !form
                  .getTransformedValues()
                  .links?.some((link) => link.site === site)
            )}
            label="Add a Site"
            onChange={setNewSite}
            onSearchChange={setSearchValue}
            searchValue={searchValue}
            searchable
            value={newSite}
          />
          <TextInput
            label="URL"
            onChange={(e) => setNewUrl(e.currentTarget.value)}
            placeholder="https://example.com/yourprofile"
            value={newUrl}
          />
          <Flex justify="end">
            <Button color="green" onClick={addLink}>
              Add Link
            </Button>
          </Flex>
        </Stack>
      </Fieldset>
      {Object.values(form?.errors ?? []).map((error, i) => (
        <Text c="red" key={i}>
          {error}
        </Text>
      ))}
      <SaveCancelButtons
        disabled={!form.isDirty()}
        onCancel={onCancel}
        onSubmitClick={() => {
          notifications.show(getProfileSavingNotification("links-update"));
        }}
      />
    </Form>
  );
}
