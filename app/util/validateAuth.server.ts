import { type ActionFunctionArgs } from "@remix-run/node";
import { getAuth } from "@clerk/remix/ssr.server";
import { and, eq } from "drizzle-orm";
import { db } from "db/connection";
import { profilesTable } from "db/schema";

interface Params {
  args: ActionFunctionArgs;
  profileId: string;
  userId?: string;
}

/**
 * Validate that the user is logged in and that the profileId belongs to the logged in user
 */
export async function validateAuth({
  args,
  profileId,
  userId: _userId,
}: Params) {
  try {
    const userId = _userId || (await getAuth(args)).userId;
    if (!userId) return false;

    const profile = await db.query.profilesTable.findFirst({
      columns: { id: true, userId: true },
      where: and(
        eq(profilesTable.id, profileId),
        eq(profilesTable.userId, userId)
      ),
    });
    return !!profile;
  } catch (error) {
    console.error(error);
    return false;
  }
}
