"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const setupProfileAndRedirect = async () => {
      /**
       * 1. Get auth session
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Not logged in → login
      if (!session) {
        router.replace("/login");
        return;
      }

      const user = session.user;

      /**
       * 2. Fetch profile
       */
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, gym_id")
        .eq("id", user.id)
        .single();

      /**
       * 3. Profile does NOT exist → create it
       */
      if (!profile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: user.email?.split("@")[0],
            climbing_level: "beginner",
            gym_id: null, // IMPORTANT: explicitly null
          });

        if (insertError) {
          console.error("Profile creation failed:", insertError);
          return;
        }

        // New users must pick a gym
        router.replace("/onboarding/gym");
        return;
      }

      /**
       * 4. Profile exists but no gym
       */
      if (!profile.gym_id) {
        router.replace("/onboarding/gym");
        return;
      }

      /**
       * 5. Fully onboarded
       */
      router.replace("/feed");
    };

    setupProfileAndRedirect();
  }, [router]);

  return null;
}