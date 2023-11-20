import { createContext, useContext, useEffect, useState } from "react";
import { useRevalidator } from "@remix-run/react";
import {
  type Session,
  type SupabaseClient,
  createBrowserClient,
} from "@supabase/auth-helpers-remix";
import { type IProfile } from "db/schemas/profilesTable";

const SupabaseContext = createContext<SupabaseClient>({} as SupabaseClient);

interface Props {
  children: React.ReactNode;
  env: {
    SUPABASE_ANON_KEY: string;
    SUPABASE_URL: string;
  };
  loggedInUserProfile: IProfile | null;
  session: Session;
}

export function SupabaseProvider({ children, env, session }: Props) {
  const { revalidate } = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
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
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);
