"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";


type Profile = {
  id: string;
  username: string;
  gym_id: string;
};

type Post = {
  id: string;
  description: string;
  username: string;
  user_id: string;
  created_at: string;
};

export default function FeedPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Load profile + posts
  // -----------------------------
  useEffect(() => {
    const loadProfileAndPosts = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !profileData) {
        console.error("Failed to load profile", error);
        return;
      }

      setProfile(profileData);
      loadPosts(profileData.gym_id);
    };

    loadProfileAndPosts();
  }, []);

  // -----------------------------
  // Load posts for gym
  // -----------------------------
  const loadPosts = async (gymId: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, description, username, user_id, created_at")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load posts", error);
      return;
    }

    setPosts(data || []);
  };

  // -----------------------------
  // Create post
  // -----------------------------
  const handleCreatePost = async () => {
    if (!content.trim()) return;
    if (!profile) return;

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      description: content,
      user_id: profile.id,
      username: profile.username,
      gym_id: profile.gym_id, // ✅ REQUIRED
    });

    if (error) {
      console.error("Insert error:", error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setContent("");
    setLoading(false);
    loadPosts(profile.gym_id); // refresh feed immediately
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <h1>BetaSpray Feed</h1>

      {/* Create Post */}
      <textarea
        placeholder="Share beta, tips, or thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          width: "100%",
          minHeight: 100,
          padding: 12,
          background: "black",
          color: "white",
          border: "1px solid white",
          marginTop: 12,
        }}
      />

      <button
        onClick={handleCreatePost}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          border: "1px solid white",
          background: "black",
          color: "white",
          cursor: "pointer",
        }}
      >
        {loading ? "Posting..." : "Post"}
      </button>

      <hr style={{ margin: "24px 0" }} />

      {/* Feed */}
      {posts.length === 0 ? (
        <p>No beta yet 👀</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ marginBottom: 24 }}>
            <p>{post.description}</p>
            <small>
              <Link
                href={`/profile/${post.user_id}`}
                style={{ color: "white", textDecoration: "underline" }}
              >
                @{post.username}
              </Link>{" "}
              • {new Date(post.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </main>
  );
}
