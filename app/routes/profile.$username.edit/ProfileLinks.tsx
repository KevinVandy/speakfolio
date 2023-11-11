import { useState } from "react";
import {
  Button,
  Fieldset,
  Pill,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { type useForm } from "@mantine/form";
import {
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
  backNextButtons: React.ReactNode;
  form: ReturnType<typeof useForm<IProfileFull>>;
}

export function ProfileLinksFieldset({ backNextButtons, form }: Props) {
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

  console.log(form.errors);

  return (
    <Fieldset legend="Social Links">
      {/* <input name="links" type="hidden" {...form.getInputProps("links")} /> */}
      {form.getTransformedValues().links?.map((link, index) => (
        <>
          <input
            key={`${index}-${link.site}`}
            name={`links.${index}.site`}
            type="hidden"
            value={link.site!}
          />
          <input
            key={`${index}-${link.url}`}
            name={`links.${index}.url`}
            type="hidden"
            value={link.url!}
          />
          {link.title && (
            <input
              key={`${index}-${link.title}`}
              name={`links.${index}.title`}
              type="hidden"
              value={link.title}
            />
          )}
        </>
      ))}
      <Stack gap="md">
        {form.getTransformedValues().links?.map((link, index) => {
          return (
            <>
              <Pill
                key={index}
                onRemove={() => removeLink(link?.site as string)}
                withRemoveButton
              >
                {link.site}
              </Pill>
            </>
          );
        })}
        <Stack>
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
        {backNextButtons}
      </Stack>
    </Fieldset>
  );
}
