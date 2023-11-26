import { useEffect } from "react";
import { Stack, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Link, RichTextEditor } from "@mantine/tiptap";
import Highlight from "@tiptap/extension-highlight";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface Props {
  value: string;
  onChangeDebounced: (value: string) => void;
  showTextAlign?: boolean;
  showHeadings?: boolean;
  label: string;
  description: string;
}

export function RichTextInput({
  onChangeDebounced,
  value,
  showTextAlign,
  showHeadings,
  label,
  description,
}: Props) {
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ].filter(Boolean),
  });

  const [debouncedValue] = useDebouncedValue(editor?.getHTML() || "", 500);

  useEffect(() => {
    if (!debouncedValue) return;
    if (debouncedValue !== value) {
      onChangeDebounced(debouncedValue);
    }
  }, [debouncedValue]);

  return (
    <>
      <Stack gap="0">
        <Text mt="xs">{label}</Text>
        <Text c="dimmed" size="xs">
          {description}
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
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>
          {showHeadings && (
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H4 />
              <RichTextEditor.H5 />
              <RichTextEditor.H6 />
            </RichTextEditor.ControlsGroup>
          )}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
          {showTextAlign && (
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>
          )}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.ClearFormatting />
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
    </>
  );
}
