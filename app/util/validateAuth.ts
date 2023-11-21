import { type SupabaseClient } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { db } from "db/connection";
import { profilesTable } from "db/schema";

interface Params {
  profileId: string;
  supabase: SupabaseClient;
  userId: string;
}

/**
 * Validate that the user is logged in and that the profileId belongs to the logged in user
 */
export async function validateAuth({ profileId, supabase, userId }: Params) {
  const sessionPromise = supabase.auth.getSession();

  const profilePromise = db.query.profilesTable.findFirst({
    columns: { id: true, userId: true, username: true },
    //profileId and userId must belong to each other
    where: and(
      eq(profilesTable.id, profileId),
      eq(profilesTable.userId, userId)
    ),
  });

  const [session, profile] = await Promise.all([
    sessionPromise,
    profilePromise,
  ]);

  return !!(
    session?.data?.session?.user?.id &&
    session.data.session.user.id === userId &&
    profile
  );
}
