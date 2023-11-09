import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { db } from "db/connection";
import { profilesTable } from "db/schemas/profilesTable";

export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params;

  let returnData = { isAvailable: false, username };

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
