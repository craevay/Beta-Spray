"use client";

/**
 * ================================
 * Imports
 * ================================
 */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * ================================
 * Profile Page
 * ================================
 */
export default function ProfilePage() {
  /**
   * 1. Read profile ID from URL
   */
  const params = useParams();
  const profileId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : null;

  /**
   * 2. State
   */
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [gyms, setGyms] = useState<any[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<any[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * 3. Editable fields
   */
  const [username, setUsername] = useState("");
  const [climbingLevel, setClimbingLevel] = useState("");
  const [gymId, setGymId] = useState<string | null>(null);

  /**
   * 4. Gym search
   */
  const [cityQuery, setCityQuery] = useState("");

  /**
   * 5. Load everything
   */
  useEffect(() => {
    if (!profileId) return;

    const loadData = async () => {
      /**
       * ---- Session ----
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSessionUserId(session?.user.id ?? null);

      /**
       * ---- Gyms ----
       */
      const { data: gymsData } = await supabase
        .from("gyms")
        .select("id, name, city, state")
        .order("name");

      setGyms(gymsData || []);
      setFilteredGyms(gymsData || []);

      /**
       * ---- Profile (CRITICAL FIX) ----
       */
      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          `
          id,
          username,
          climbing_level,
          gym_id,
          gyms (
            name
          )
        `
        )
        .eq("id", profileId)
        .maybeSingle(); // <-- IMPORTANT FIX

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setUsername(profileData.username || "");
      setClimbingLevel(profileData.climbing_level || "");
      setGymId(profileData.gym_id || null);

      /**
       * ---- Posts ----
       */
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, description, created_at")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      setPosts(postsData || []);
      setLoading(false);
    };

    loadData();
  }, [profileId]);

  /**
   * 6. Filter gyms by city
   */
  useEffect(() => {
    if (!cityQuery) {
      setFilteredGyms(gyms);
    } else {
      setFilteredGyms(
        gyms.filter((gym) =>
          gym.city?.toLowerCase().includes(cityQuery.toLowerCase())
        )
      );
    }
  }, [cityQuery, gyms]);

  /**
   * 7. Save profile (owner only)
   */
  const handleSaveProfile = async () => {
    if (!sessionUserId) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        climbing_level: climbingLevel,
        gym_id: gymId,
      })
      .eq("id", sessionUserId);

    if (error) {
      alert(error.message);
    } else {
      setProfile({
        ...profile,
        username,
        climbing_level: climbingLevel,
        gym_id: gymId,
      });
      alert("Profile updated");
    }

    setSaving(false);
  };

  /**
   * 8. Ownership
   */
  const isOwner = sessionUserId === profile?.id;

  /**
   * 9. States
   */
  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Profile not found.</p>;

  /**
   * 10. Render
   */
  return (
    <div style={{ padding: "2rem", maxWidth: "600px" }}>
      <h1>@{profile.username}</h1>
      <p>Climbing level: {profile.climbing_level || "—"}</p>
      <p>Gym: {profile.gyms?.name || "Not selected"}</p>

      {isOwner && (
        <>
          <hr />
          <h2>Edit Profile</h2>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            placeholder="Climbing level"
            value={climbingLevel}
            onChange={(e) => setClimbingLevel(e.target.value)}
          />

          <input
            placeholder="Search gyms by city"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
          />

          <select
            value={gymId ?? ""}
            onChange={(e) => setGymId(e.target.value || null)}
          >
            <option value="">Select a gym</option>
            {filteredGyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name} — {gym.city}, {gym.state}
              </option>
            ))}
          </select>

          <button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </>
      )}

      <hr />
      <h2>Posts</h2>

      {posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.description}</p>
          <small>{new Date(post.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
