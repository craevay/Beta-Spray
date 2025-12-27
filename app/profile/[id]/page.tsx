"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const { id } = useParams(); // this is the UUID
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      // 1️⃣ Fetch profile by UUID
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError || !profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 2️⃣ Fetch posts by this user
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setPosts(postsData || []);
      setLoading(false);
    };

    loadProfile();
  }, [id]);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>@{profile.username}</h1>
      <p>Climbing level: {profile.climbing_level}</p>
      {profile.gym_id && <p>Gym: {profile.gym_id}</p>}

      <hr style={{ margin: "2rem 0" }} />

      <h2>Posts</h2>

      {posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((post) => (
        <div key={post.id} style={{ marginBottom: "1rem" }}>
          <p>{post.description}</p>
          <small>
            {new Date(post.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}
