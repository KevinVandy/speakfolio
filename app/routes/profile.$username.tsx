import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const username = { params };
  console.log(username);
  return {};
}

export default function ProfileIdPage() {
  const data = useLoaderData();
  console.log(data);
  return (
    <div>
      <h1>Profile id route</h1>
    </div>
  );
}
