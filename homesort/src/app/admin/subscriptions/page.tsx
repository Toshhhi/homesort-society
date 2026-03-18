"use client";

import { useEffect, useState } from "react";

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

export default function SubscriptionsPage() {
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    monthly_amount: "",
    effective_from: "",
  });

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/subscriptions");

      if (!res.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const result = await res.json();
      setData(result);
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
    fetchSubscriptions();
  }, []);

  function handleEdit(plan: Subscription) {
    setSelectedPlan(plan);
    setFormData({
      monthly_amount: String(plan.monthly_amount),
      effective_from: plan.effective_from
        ? plan.effective_from.split("T")[0]
        : "",
    });
    setIsModalOpen(true);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedPlan) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(
        `http://localhost:5000/api/subscriptions/${selectedPlan.id}`,
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

      await fetchSubscriptions();
      setIsModalOpen(false);
      setSelectedPlan(null);
      setFormData({
        monthly_amount: "",
        effective_from: "",
      });
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

  if (loading) return <div className="p-6">Loading subscriptions...</div>;
  if (error && !isModalOpen)
    return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Subscription Plans</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage monthly subscription rates flat type wise.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b px-4 py-3 text-left">Flat Type</th>
              <th className="border-b px-4 py-3 text-left">Monthly Amount</th>
              <th className="border-b px-4 py-3 text-left">Effective From</th>
              <th className="border-b px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((plan) => (
                <tr key={plan.id}>
                  <td className="border-b px-4 py-3">{plan.flat_type}</td>
                  <td className="border-b px-4 py-3">
                    ₹{Number(plan.monthly_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="border-b px-4 py-3">
                    {plan.effective_from
                      ? new Date(plan.effective_from).toLocaleDateString(
                          "en-IN",
                        )
                      : "-"}
                  </td>
                  <td className="border-b px-4 py-3">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="rounded bg-blue-500 px-3 py-1 text-white"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  No subscription plans found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="mt-6 rounded border bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Edit Subscription Plan</h2>

          {selectedPlan && (
            <p className="mb-4 text-sm text-gray-600">
              Updating rate for <strong>{selectedPlan.flat_type}</strong>
            </p>
          )}

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <form onSubmit={handleUpdate} className="space-y-4">
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
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPlan(null);
                  setError("");
                }}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
