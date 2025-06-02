"use client";

import {useSession, signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function LoginForm() {
  const router = useRouter();
  const {data: session} = useSession();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Redirect if logged in
  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      console.log("result", result);

      if (result && !result.error) {
        router.push("/");
      } else {
        setError(result?.error || "Invalid email or password.");
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
        {error && <p style={{color: "red"}}>{error}</p>}
      </form>
    </div>
  );
}
