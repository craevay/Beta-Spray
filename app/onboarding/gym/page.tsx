"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function GymOnboardingPage() {
  const router = useRouter();
  const [gyms, setGyms] = useState<any[]>([]);
  const [selectedGym, setSelectedGym] = useState<string | null>(null);

  useEffect(() => {
    const loadGyms = async () => {
      const { data } = await supabase
        .from("gyms")
        .select("id, name, city, state")
        .order("name");

      setGyms(data || []);
    };

    loadGyms();
  }, []);

  const handleSave = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !selectedGym) return;

    await supabase
      .from("profiles")
      .update({ gym_id: selectedGym })
      .eq("id", session.user.id);

    router.replace("/feed");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 500 }}>
      <h1>Select Your Gym</h1>
      <p>You must choose a gym to continue.</p>

      <select
        value={selectedGym ?? ""}
        onChange={(e) => setSelectedGym(e.target.value)}
      >
        <option value="">Select a gym</option>
        {gyms.map((gym) => (
          <option key={gym.id} value={gym.id}>
            {gym.name} — {gym.city}
          </option>
        ))}
      </select>

      <button
        onClick={handleSave}
        disabled={!selectedGym}
        style={{ marginTop: 16 }}
      >
        Continue
      </button>
    </div>
  );
}
