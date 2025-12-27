"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function GymOnboardingPage() {
  const [gym, setGym] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ gym_id: gym })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert("Failed to save gym");
    } else {
      router.replace("/feed");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Select Your Gym</h1>

      <input
        type="text"
        placeholder="Gym name (for now)"
        value={gym}
        onChange={(e) => setGym(e.target.value)}
        style={{ display: "block", marginBottom: 12 }}
      />

      <button onClick={handleSave} disabled={loading || !gym}>
        {loading ? "Saving..." : "Continue"}
      </button>
    </main>
  );
}
