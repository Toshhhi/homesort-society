"use client";

import { useEffect, useState } from "react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

type AdminProfile = {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
};

export default function AdminProfilePage() {
  const [adminId, setAdminId] = useState<number | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordCard, setShowPasswordCard] = useState(false);

  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function fetchMe() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/me", {
        credentials: "include",
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to fetch logged-in user");
      }

      setAdminId(result.user?.id ?? result.id ?? null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while fetching user");
      }
      setLoading(false);
    }
  }

  async function fetchProfile(id: number) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`http://localhost:5000/api/admin/profile/${id}`, {
        credentials: "include",
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to fetch profile");
      }

      setProfile(result);
      setProfileForm({
        username: result.username || "",
        email: result.email || "",
        phone: result.phone || "",
      });
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
    fetchMe();
  }, []);

  useEffect(() => {
    if (adminId) {
      fetchProfile(adminId);
    }
  }, [adminId]);

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEditProfile(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsEditingProfile(true);
    setShowPasswordCard(false);
  }

  function handleCancelEditProfile(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsEditingProfile(false);
    setSuccess("");
    setError("");

    if (profile) {
      setProfileForm({
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }

  function handleShowPasswordCard(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setSuccess("");
    setError("");
    setShowPasswordCard(true);
    setIsEditingProfile(false);
  }

  function handleCancelPasswordChange(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setShowPasswordCard(false);
    setSuccess("");
    setError("");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!adminId) {
      setError("Admin not found");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        `http://localhost:5000/api/admin/profile/${adminId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileForm),
        },
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to update profile");
      }

      setSuccess(result?.message || "Profile updated successfully");
      setIsEditingProfile(false);
      await fetchProfile(adminId);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while updating profile");
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    await logout();
    window.location.href = "/login";
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!adminId) {
      setError("Admin not found");
      return;
    }

    try {
      setSavingPassword(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        `http://localhost:5000/api/admin/profile/${adminId}/password`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwordForm),
        },
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to update password");
      }

      setSuccess(result?.message || "Password updated successfully");
      setShowPasswordCard(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while updating password");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your account details.
        </p>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Profile Details</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your personal and contact information.
            </p>
          </div>

          <div className="flex gap-2">
            {!isEditingProfile && (
              <button
                type="button"
                onClick={handleEditProfile}
                className="rounded bg-black px-4 py-2 text-white"
              >
                Edit Profile
              </button>
            )}

            {!showPasswordCard && (
              <button
                type="button"
                onClick={handleShowPasswordCard}
                className="rounded border px-4 py-2"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
              className={`w-full rounded border px-3 py-2 ${
                !isEditingProfile ? "bg-gray-100 text-gray-500" : ""
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
              className={`w-full rounded border px-3 py-2 ${
                !isEditingProfile ? "bg-gray-100 text-gray-500" : ""
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              disabled={!isEditingProfile}
              className={`w-full rounded border px-3 py-2 ${
                !isEditingProfile ? "bg-gray-100 text-gray-500" : ""
              }`}
            />
          </div>

          {isEditingProfile && (
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancelEditProfile}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {showPasswordCard && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Change Password</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your password for better account security.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>

              <button
                type="button"
                onClick={handleCancelPasswordChange}
                className="rounded border px-4 py-2"
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
            </div>
          </form>
        </div>
      )}

      {!showPasswordCard && !isEditingProfile && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded border border-red-400 px-4 py-2 text-red-500 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
