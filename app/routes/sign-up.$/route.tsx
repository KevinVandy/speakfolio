import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import { SignUp } from "@clerk/remix";
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
    { title: "Sign up for Speakfolio" },
    {
      content: "Sign up for Speakfolio",
      property: "og:title",
    },
    {
      content: "Sign up for Speakfolio",
      name: "description",
    },
  ];
};

export default function SignUpPage() {
  const colorScheme = colorSchemeManager.get("auto");
  return (
    <Flex justify="center" m="auto">
      <SignUp
        appearance={{
          baseTheme: colorScheme === "dark" ? dark : undefined,
        }}
      />
    </Flex>
  );
}
