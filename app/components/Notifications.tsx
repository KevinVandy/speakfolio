import { IconCheck, IconX } from "@tabler/icons-react";

export function getProfileSuccessNotification(id: string) {
  return {
    color: "green",
    icon: <IconCheck />,
    id,
    loading: false,
    message: "Your changes have been saved",
    title: "Success",
  };
}

export function getProfileErrorNotification(id: string) {
  return {
    color: "red",
    icon: <IconX />,
    id,
    loading: false,
    message: "Error updating your profile",
    title: "Error",
  };
}

export function getProfileSavingNotification(id: string) {
  return {
    color: "blue",
    id,
    loading: true,
    message: "Updating your profile...",
    title: "Saving Your Changes",
  };
}
