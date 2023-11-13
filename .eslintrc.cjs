/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "plugin:perfectionist/recommended-natural",
  ],
  ignorePatterns: ["node_modules/", ".cache/", "build/"],
  plugins: ["perfectionist"],
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        disallowTypeAnnotations: true,
        fixStyle: "inline-type-imports",
        prefer: "type-imports",
      },
    ],
    "perfectionist/sort-imports": [
      "warn",
      {
        "custom-groups": {
          type: {
            react: "react",
          },
          value: {
            db: ["db/connection", "db/schemas/*", "db/schema"],
            drizzle: ["drizzle-orm*", "drizzle-orm/**"],
            internal: ["~*", "./*", "./**", "../*", "../**"],
            mantine: ["@mantine/**", "@tiptap/**", "dayjs"],
            postgres: ["postgres"],
            react: ["react", "react-*"],
            remix: ["@remix-run/*"],
            supabase: ["@supabase/**"],
            tabler: ["@tabler/*"],
            tanstack: ["@tanstack/*"],
            zod: ["zod"],
          },
        },
        groups: [
          "react",
          "remix",
          "tanstack",
          "mantine",
          "tabler",
          "zod",
          "supabase",
          "drizzle",
          "postgres",
          "db",
          "siblings",
          "sibling-type",
          "parent",
          "parent-type",
          "style",
          "internal",
        ],
        "newlines-between": "never",
        order: "asc",
        type: "natural",
      },
    ],
    "react-hooks/exhaustive-deps": "off",
  },
};
