import type { MantineThemeOverride } from "@mantine/core";

const theme: MantineThemeOverride = {
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33",
      "#25262b",
      "#1A1B1E",
      "#141517",
      "#101113",
    ],
  },
  components: {
    ActionIcon: {
      defaultProps: {
        variant: "transparent",
      },
    },
    Button: {
      defaultProps: {},
    },
    Notification: {
      defaultProps: {
        withBorder: true,
      },
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
      },
    },
    TypographyStylesProvider: {
      defaultProps: {
        p: 0,
      },
    },
  },
  cursorType: "pointer",
  headings: {
    sizes: {
      h2: { fontSize: "30pt", lineHeight: "3rem" },
      h3: { fontSize: "20pt", lineHeight: "2rem" },
      h4: { fontSize: "18pt", lineHeight: "1.5rem" },
      h5: { fontSize: "16pt", lineHeight: "1.2rem" },
      h6: { fontSize: "14pt", lineHeight: "1rem" },
    },
  },
  primaryColor: "pink",
  primaryShade: { dark: 6, light: 8 },
};

export default theme;
