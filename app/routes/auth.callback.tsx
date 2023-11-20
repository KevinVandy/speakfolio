import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabaseClient = createServerClient(
      process.env.SUPABASE_UR!,
      process.env.SUPABASE_ANON_KEY!,
      { request, response },
    );
    await supabaseClient.auth.exchangeCodeForSession(code);
  }

  return redirect("/", {
    headers: response.headers,
  });
}
