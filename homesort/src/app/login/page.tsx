"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { saveUser } from "@/lib/auth";

export default function Login() {
  const router = useRouter();

  const [role, setRole] = useState<"resident" | "admin">("resident");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogIn() {
    window.location.href = "http://localhost:5000/api/googleAuth";
  }
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      setLoading(false);
      return;
    }

    saveUser({
      role: data.role,
      email,
    });

    if (data.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/login-bg.jpg')", // Assuming you have a background image
      }}
    >
      <div className="absolute inset-0 bg-brand-dark/60"></div>

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-brand-silver/20 bg-brand-surface shadow-2xl">
        {/* Toggle Header */}
        <div className="flex w-full border-b border-brand-silver/10">
          <button
            onClick={() => setRole("resident")}
            className={`flex-1 py-4 text-center text-sm font-bold uppercase tracking-wider transition-colors ${
              role === "resident"
                ? "bg-brand-accent text-white"
                : "text-brand-gray hover:bg-white/5 hover:text-brand-silver"
            }`}
          >
            Resident
          </button>
          <button
            onClick={() => setRole("admin")}
            className={`flex-1 py-4 text-center text-sm font-bold uppercase tracking-wider transition-colors ${
              role === "admin"
                ? "bg-brand-accent text-white"
                : "text-brand-gray hover:bg-white/5 hover:text-brand-silver"
            }`}
          >
            Admin
          </button>
        </div>

        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">
              Welcome Home
            </h1>
            <p className="text-sm font-medium tracking-wide text-brand-silver">
              Homesort... <i className="text-brand-accent">sort it your way.</i>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-silver">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-brand-silver/20 bg-brand-dark px-4 py-3 text-white placeholder-brand-gray focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-silver">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-brand-silver/20 bg-brand-dark px-4 py-3 text-white placeholder-brand-gray focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-accent py-3 font-bold text-white shadow-md shadow-brand-accent/20 transition-all hover:bg-[#049b88] hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              )}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {role === "admin" && (
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-silver/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-brand-surface px-4 text-xs font-bold uppercase tracking-wider text-brand-gray">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-silver/20 bg-brand-dark px-4 py-3 font-semibold text-white transition-all hover:bg-white/5"
                onClick={handleGoogleLogIn}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
