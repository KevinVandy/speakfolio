import { useOutletContext } from "@remix-run/react";
import { Box, Spoiler } from "@mantine/core";
import xss from "xss";
import { type IProfileOutletContext } from "../profile.$username/route";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { xssOptions } from "~/util/xssOptions";

export default function ProfileBioTab() {
  const { setTab } = useOutletContext<IProfileOutletContext>();
  const profile = useProfileLoader();

  const dirtyBio = profile.bio?.richText || "";
  const cleanBio = xss(dirtyBio, xssOptions);

  return (
    <Spoiler
      hideLabel="Hide"
      maxHeight={150}
      onClick={() => setTab("bio")}
      showLabel="Read Full Bio"
    >
      <>
        {profile.bio?.richText ? (
          <Box dangerouslySetInnerHTML={{ __html: cleanBio }} />
        ) : (
          "No bio yet."
        )}{" "}
      </>
    </Spoiler>
  );
}
