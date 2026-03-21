"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

type ResidentProfile = {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  role: "resident";
  flat_id: number | null;
  created_at?: string;
};

export default function ResidentProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const user = await getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "resident") {
        router.push("/admin/dashboard");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/resident-profile/${encodeURIComponent(user.email)}`,
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to fetch profile");
      }

      setProfile(result);
      setPhone(result.phone || "");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!profile?.email) {
        throw new Error("Resident profile not found");
      }

      const payload: { phone?: string; password?: string } = {};

      if (phone.trim()) {
        payload.phone = phone.trim();
      }

      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(
        `http://localhost:5000/api/resident-profile/${encodeURIComponent(profile.email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to update profile");
      }

      setSuccess(result?.message || "Profile updated successfully");
      setPassword("");
      setIsEditing(false);

      await fetchProfile();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while updating profile");
      }
    } finally {
      setSaving(false);
    }
  }

  // UPDATED: prevent form/navigation side effects on Edit click
  function handleEdit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsEditing(true);
  }

  // UPDATED: prevent form/navigation side effects on Cancel click
  function handleCancel(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPhone(profile?.phone || "");
    setPassword("");
    setIsEditing(false);
  }

  // UPDATED: prevent form submit side effects before logout
  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    await logout();
    router.push("/login");
  }

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (error && !profile) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your phone number or password, and manage your account.
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm">
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              type="text"
              value={profile?.username || ""}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2 text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2 text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              disabled={!isEditing}
              className={`w-full rounded border px-3 py-2 ${
                isEditing ? "bg-white" : "bg-gray-100 text-gray-600"
              }`}
            />
          </div>

          {isEditing && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded border px-3 py-2"
              />
            </div>
          )}

          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded border border-red-400 px-4 py-2 text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded border px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded border border-red-400 px-4 py-2 text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
