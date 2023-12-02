import { Button, SimpleGrid, type SimpleGridProps, Space } from "@mantine/core";

interface Props extends SimpleGridProps {
  disabled?: boolean;
  loading?: boolean;
  onCancel?: () => void;
  onSubmitClick?: () => void;
}

export function SaveCancelButtons({
  disabled,
  loading,
  onCancel,
  onSubmitClick,
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
      {onCancel ? (
        <Button onClick={onCancel} type="button" variant="default">
          Cancel
        </Button>
      ) : (
        <Space />
      )}
      <Button
        color="blue"
        disabled={disabled}
        loading={loading}
        onClick={onSubmitClick}
        type="submit"
      >
        Save
      </Button>
    </SimpleGrid>
  );
}
