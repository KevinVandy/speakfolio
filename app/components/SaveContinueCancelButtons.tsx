import { Button, SimpleGrid, type SimpleGridProps } from "@mantine/core";

interface Props extends SimpleGridProps {
  disabled?: boolean;
  loading?: boolean;
  onCancel: () => void;
}

export function SaveContinueCancelButtons({
  disabled,
  loading,
  onCancel,
  ...rest
}: Props) {
  return (
    <SimpleGrid
      bg="inherit"
      bottom={0}
      cols={2}
      mt="xl"
      p="2px"
      pos="sticky"
      w="100%"
      {...rest}
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
