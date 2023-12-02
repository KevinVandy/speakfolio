import { createClerkClient } from "@clerk/remix/api.server";

export async function getClerkServerClient() {
  return await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}
