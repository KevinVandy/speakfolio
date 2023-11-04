import { LoaderFunctionArgs, json } from "@remix-run/node";
import { db } from "db/connection";
import { profilesTable } from "db/schemas/profiles";
import { eq } from "drizzle-orm";

export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params;

  let returnData = { username, isAvailable: false };

  if (username) {
    returnData.isAvailable = !(
      await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.username, username))
        .limit(1)
        .catch(() => {
          console.error("Error checking username availability");
        })
    )?.[0];
  }

  return json(returnData);
}
