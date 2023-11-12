import { Fragment, useState } from "react";
import {
  Button,
  Fieldset,
  Pill,
  PillsInput,
  Select,
  Stack,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { type useForm } from "@mantine/form";
import {
  IconAt,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandMedium,
  IconBrandTiktok,
  IconBrandTwitch,
  IconBrandTwitter,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { type IProfileFull, linkSites } from "db/schema";

export const linkIconMap = {
  Facebook: <IconBrandFacebook />,
  GitHub: IconBrandGithub,
  Instagram: IconBrandInstagram,
  LinkedIn: IconBrandLinkedin,
  Medium: IconBrandMedium,
  Other: IconBrandX,
  TikTok: IconBrandTiktok,
  Twitch: IconBrandTwitch,
  Twitter: IconBrandTwitter,
  YouTube: IconBrandYoutube,
};

interface Props {
  form: ReturnType<typeof useForm<IProfileFull>>;
}

export function EditProfileLinksFieldset({ form }: Props) {
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
    <Fieldset variant="unstyled">
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
          <Button color="blue" onClick={addLink}>
            Add
          </Button>
        </Stack>
      </Fieldset>
    </Fieldset>
  );
}
