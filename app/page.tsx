"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const setupProfileAndRedirect = async () => {
      // 1. Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const user = session.user;

      // 2. Fetch profile (INCLUDING gym_id)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, gym_id")
        .eq("id", user.id)
        .single();

      // 3. Create profile if it does not exist
      if (!profile) {
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0],
          climbing_level: "beginner",
        });

        if (error) {
          console.error("Profile creation failed:", error);
          return;
        }

        // After creating profile, force gym onboarding
        router.replace("/onboarding/gym");
        return;
      }

      // 4. Profile exists but no gym selected
      if (!profile.gym_id || profile.gym_id.trim() === "") {
        router.replace("/onboarding/gym");
        return;
      }


      // 5. Fully onboarded
      router.replace("/feed");
    };

    setupProfileAndRedirect();
  }, [router]);

  return null;
}