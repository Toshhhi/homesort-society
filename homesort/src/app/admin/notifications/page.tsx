"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";

type Notification = {
  id: number;
  title: string;
  message: string;
  sent_to: string;
  created_at: string;
};

export default function NotificationsPage() {
  const today = new Date();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    sent_to: "all",
    month: String(today.getMonth() + 1),
    year: String(today.getFullYear()),
  });

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/notifications");
      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to fetch notifications");
      }

      setNotifications(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload =
        formData.sent_to === "pending_payment"
          ? formData
          : {
              title: formData.title,
              message: formData.message,
              sent_to: formData.sent_to,
            };

      const res = await fetch("http://localhost:5000/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to send notification");
      }

      toast.success(result?.message || "Notification sent successfully");
      setFormData({
        title: "",
        message: "",
        sent_to: "all",
        month: String(today.getMonth() + 1),
        year: String(today.getFullYear()),
      });

      await fetchNotifications();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        toast.error("Something went wrong while sending notification");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Send reminders and announcements to users.
        </p>
      </div>

      <div className="mb-8 max-w-2xl rounded-lg border bg-white p-6 shadow-sm">
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Send To</label>
            <select
              name="sent_to"
              value={formData.sent_to}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            >
              <option value="all">All</option>
              <option value="resident">Residents</option>
              <option value="admin">Admins</option>
              <option value="pending_payment">Pending Payment</option>
            </select>
          </div>

          {formData.sent_to === "pending_payment" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Month</label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Sending..." : "Send Notification"}
          </button>
        </form>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Sent Notifications</h2>

        {loading ? (
          <Loader text="Loading notifications..." />
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded border p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {notification.sent_to}
                  </span>
                </div>

                <p className="mb-2 text-sm text-gray-700">
                  {notification.message}
                </p>

                <p className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No notifications sent yet.</p>
        )}
      </div>
    </div>
  );
}
