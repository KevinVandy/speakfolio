import type { MantineThemeOverride } from "@mantine/core";

const theme: MantineThemeOverride = {
  components: {
    ActionIcon: {
      defaultProps: {
        variant: "transparent",
      },
    },
    Button: {
      defaultProps: {},
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
      },
    },
  },
  cursorType: "pointer",
  headings: {
    sizes: {
      h2: { fontSize: "30pt", lineHeight: "3rem" },
    },
  },
  primaryColor: "pink",
};

export default theme;
