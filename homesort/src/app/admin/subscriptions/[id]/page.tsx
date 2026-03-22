"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Subscription = {
  id: number;
  flat_type: string;
  monthly_amount: number;
  effective_from: string;
  created_at: string;
};

type FormDataType = {
  monthly_amount: string;
  effective_from: string;
};

export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    monthly_amount: "",
    effective_from: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchSubscriptionById() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:5000/api/subscriptions/${params.id}`,
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to fetch subscription");
      }

      setSubscription(result);
      setFormData({
        monthly_amount: String(result.monthly_amount),
        effective_from: result.effective_from
          ? result.effective_from.split("T")[0]
          : "",
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
    if (params.id) {
      fetchSubscriptionById();
    }
  }, [params.id]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const res = await fetch(
        `http://localhost:5000/api/subscriptions/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthly_amount: Number(formData.monthly_amount),
            effective_from: formData.effective_from,
          }),
        },
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to update subscription");
      }

      router.push("/admin/subscriptions");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while updating");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading subscription...</div>;
  if (error && !subscription)
    return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-semibold">Edit Subscription Plan</h1>

      {subscription && (
        <p className="mb-6 text-sm text-gray-600">
          Updating rate for <strong>{subscription.flat_type}</strong>
        </p>
      )}

      <div className="max-w-xl rounded-lg border bg-white p-6 shadow-sm">
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* ADDED: show flat type as read-only */}
          <div>
            <label className="mb-1 block text-sm font-medium">Flat Type</label>
            <input
              type="text"
              value={subscription?.flat_type || ""}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-2 text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Monthly Amount
            </label>
            <input
              type="number"
              name="monthly_amount"
              value={formData.monthly_amount}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Effective From
            </label>
            <input
              type="date"
              name="effective_from"
              value={formData.effective_from}
              onChange={handleInputChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Plan"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/subscriptions")}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
