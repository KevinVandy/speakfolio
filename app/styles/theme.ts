import type { MantineThemeOverride } from "@mantine/core";

const theme: MantineThemeOverride = {
  components: {
    button: {
      defaultProps: {},
    },
  },
  cursorType: "pointer",
  headings: {
    sizes: {
      h2: { fontSize: "30pt", lineHeight: "2rem" },
    },
  },
  primaryColor: "pink",
};

export default theme;
