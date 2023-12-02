import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { SignIn } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { dark } from "@clerk/themes";
import { Flex } from "@mantine/core";
import { colorSchemeManager } from "~/root";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (userId) {
    return redirect("/");
  }
  return {};
}

export const meta: MetaFunction = () => {
  return [
    { title: "Sign into Speakfolio" },
    {
      content: "Sign into Speakfolio",
      property: "og:title",
    },
    {
      content: "Sign into Speakfolio",
      name: "description",
    },
  ];
};

export default function SignUpPage() {
  const colorScheme = colorSchemeManager.get("auto");
  return (
    <Flex justify="center" m="auto">
      <SignIn
        appearance={{
          baseTheme: colorScheme === "dark" ? dark : undefined,
        }}
      />
    </Flex>
  );
}
