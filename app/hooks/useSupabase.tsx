import { useRevalidator } from "@remix-run/react";
import {
  type Session,
  createBrowserClient,
  type SupabaseClient,
} from "@supabase/auth-helpers-remix";
import { Profile } from "db/schemas/profiles";
import { createContext, useContext, useEffect, useState } from "react";

interface SupabaseContextValues {
  currentUserProfile: Profile | null;
  supabase: SupabaseClient;
  session: Session | null;
}

const SupabaseContext = createContext<SupabaseContextValues>(
  {} as SupabaseContextValues
);

interface Props {
  children: React.ReactNode;
  env: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  };
  session: Session;
  currentUserProfile: Profile | null;
}

export function SupabaseProvider({
  children,
  currentUserProfile,
  env,
  session,
}: Props) {
  const { revalidate } = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "INITIAL_SESSION" &&
        session?.access_token !== serverAccessToken
      ) {
        // server and client are out of sync.
        revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, revalidate]);

  return (
    <SupabaseContext.Provider value={{ currentUserProfile, supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);
