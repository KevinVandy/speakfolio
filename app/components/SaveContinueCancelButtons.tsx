import { useOutletContext } from "@remix-run/react";
import { Button, SimpleGrid } from "@mantine/core";
import { type EditProfileOutletContext } from "~/routes/profile.$username.edit/route";

interface Props {
  disabled?: boolean;
  loading?: boolean;
}

export function SaveContinueCancelButtons({ disabled, loading }: Props) {
  const { onCancel } = useOutletContext<EditProfileOutletContext>();

  return (
    <SimpleGrid
      bg="inherit"
      bottom={0}
      cols={2}
      mt="xl"
      p="2px"
      pos="sticky"
      w="100%"
    >
      <Button onClick={onCancel} type="button" variant="default">
        Cancel
      </Button>
      <Button color="blue" disabled={disabled} loading={loading} type="submit">
        Save
      </Button>
    </SimpleGrid>
  );
}
