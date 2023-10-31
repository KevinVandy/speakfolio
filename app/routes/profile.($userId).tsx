import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunction } from "@remix-run/node";
import { json } from "stream/consumers";

// export const loader: LoaderFunction = async (args) => {
//   const user = await getAuth(args);
//   return json({ user });
// };

export default function ProfileIdPage() {
  return (
    <div>
      <h1>Profile id route</h1>
    </div>
  );
}
