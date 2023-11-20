import { useEffect } from "react";
import { Link } from "@remix-run/react";
import { Alert, Anchor, Collapse } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";

export function ProfileAlerts() {
  const profile = useProfileLoader();
  const { isOwnProfile, visibility } = profile;

  const [isAlertVisible, setIsAlertVisible] = useSessionStorage({
    defaultValue: false,
    key: "profileVisibilityAlert",
  });

  useEffect(() => {
    const storedAlertVisibility = sessionStorage.getItem(
      "profileVisibilityAlert",
    );
    if (
      isOwnProfile &&
      profile.visibility !== "public" &&
      storedAlertVisibility !== "false"
    ) {
      setIsAlertVisible(true);
    }
  }, []);

  return isOwnProfile && visibility !== "public" ? (
    <Collapse in={isAlertVisible}>
      <>
        {visibility === "private" ? (
          <Alert
            color="orange"
            onClose={() => setIsAlertVisible(false)}
            title="Your profile is currently private."
            withCloseButton
          >
            Only you can see your profile. You can change your{" "}
            <Anchor component={Link} to="edit/settings">
              visibility settings here
            </Anchor>
          </Alert>
        ) : (
          <Alert
            color="blue"
            onClose={() => setIsAlertVisible(false)}
            title="Your profile is hidden from search engines."
            withCloseButton
          >
            Only you and other logged in Speakfolio users can see your profile.
            You can change your{" "}
            <Anchor component={Link} to="edit/settings">
              visibility settings here
            </Anchor>
          </Alert>
        )}
      </>
    </Collapse>
  ) : null;
}
