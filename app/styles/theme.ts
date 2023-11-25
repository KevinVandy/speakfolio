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
    TypographyStylesProvider: {
      defaultProps: {
        p: 0,
      }
    }
  },
  cursorType: "pointer",
  headings: {
    sizes: {
      h2: { fontSize: "30pt", lineHeight: "3rem" },
      h3: { fontSize: "20pt", lineHeight: "2rem" },
      h4: { fontSize: "15pt", lineHeight: "1.5rem" },
      h5: { fontSize: "12pt", lineHeight: "1.2rem" },
      h6: { fontSize: "10pt", lineHeight: "1rem" },
    },
  },
  primaryColor: "pink",
};

export default theme;
