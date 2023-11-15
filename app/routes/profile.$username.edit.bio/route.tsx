import { useEffect } from "react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useOutletContext } from "@remix-run/react";
import { Stack, Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
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
import { and, eq } from "drizzle-orm";
import { db } from "db/connection";
import { profileBiosTable } from "db/schema";
import { type EditProfileOutletContext } from "../profile.$username.edit/route";
import { SaveContinueCancelButtons } from "~/components/SaveContinueCancelButtons";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { getSupabaseServerClient } from "~/util/getSupabaseServerClient";
import { transformDotNotation } from "~/util/transformDotNotation";

const profileBioSchema = z.object({
  bio: z.object({
    id: z.string().uuid(),
    richText: z.string().max(6000, { message: "Bio max 6000 characters" }),
  }),
  id: z.string().uuid(),
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
  const validationResult = profileBioSchema.safeParse(rawData);
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
    const cleanBio = xss(data.bio?.richText ?? "");
    await db
      .update(profileBiosTable)
      .set({ richText: cleanBio })
      .where(
        and(
          eq(profileBiosTable.id, data.bio.id),
          eq(profileBiosTable.profileId, data.id)
        )
      );
    return redirect("../..");
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

export default function EditProfileBioTab() {
  const { setIsDirty } = useOutletContext<EditProfileOutletContext>();
  const actionData = useActionData<typeof action>();
  const profile = useProfileLoader();

  const form = useForm({
    initialErrors: actionData?.errors,
    initialValues: actionData?.data ?? {
      bio: {
        id: profile.bio?.id ?? "",
        richText: profile.bio?.richText ?? "",
      },
      id: profile.id,
      userId: profile.userId!,
    },
    validate: zodResolver(profileBioSchema),
  });

  useEffect(() => {
    setIsDirty(form.isDirty());
  }, [form]);

  //sync back-end errors with form
  useEffect(() => {
    if (actionData && Object.keys(actionData?.errors ?? {}).length) {
      form.setErrors({ ...form.errors, ...actionData.errors });
    }
  }, [actionData]);

  const editor = useEditor({
    content: form.values.bio?.richText || "",
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

  const [dirtyDebouncedBio] = useDebouncedValue(
    editor?.getHTML().trim() || "",
    500
  );

  useEffect(() => {
    if (!dirtyDebouncedBio) return;
    const cleanBio = dirtyDebouncedBio;
    if (cleanBio !== form.values.bio?.richText) {
      form.setFieldValue("bio.richText", cleanBio);
    }
  }, [dirtyDebouncedBio]);

  return (
    <Form
      method="post"
      onSubmit={(e) => form.validate().hasErrors && e.preventDefault()}
    >
      <input name="id" type="hidden" value={profile.id} />
      <input name="userId" type="hidden" value={profile.userId!} />
      <input name="bio.id" type="hidden" value={form.values.bio?.id ?? ""} />
      <input
        name="bio.richText"
        type="hidden"
        value={form.values.bio?.richText ?? ""}
      />
      <Stack
        gap="md"
        h="clamp(400px, 70vh, 1000px)"
        style={{ overflow: "auto" }}
      >
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
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
              <RichTextEditor.H5 />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Subscript />
              <RichTextEditor.Superscript />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
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
      </Stack>
      {Object.values(form?.errors ?? []).map((error, i) => (
        <Text c="red" key={i}>
          {error}
        </Text>
      ))}
      <SaveContinueCancelButtons disabled={!form.isDirty()} />
    </Form>
  );
}
