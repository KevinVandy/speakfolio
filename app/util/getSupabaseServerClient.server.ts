import { createServerClient } from "@supabase/auth-helpers-remix";

export function getSupabaseServerClient({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response },
  );
}
