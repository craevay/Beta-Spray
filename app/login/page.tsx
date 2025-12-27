"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

const handleAuth = async () => {
  setError(null);
  setLoading(true);

  const { error } = isSignUp
    ? await supabase.auth.signUp({ email, password })
    : await supabase.auth.signInWithPassword({ email, password });

  setLoading(false);

  if (error) {
    setError(error.message);
    return;
  }

  // ✅ SUCCESS: redirect user
  router.push("/");
};

  return (
    <main style={{ padding: 24 }}>
      <h1>{isSignUp ? "Sign Up" : "Login"}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 8 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 8 }}
      />

      <button onClick={handleAuth} disabled={loading}>
        {loading ? "Loading..." : isSignUp ? "Create Account" : "Login"}
        </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </button>
    </main>
  );
}
