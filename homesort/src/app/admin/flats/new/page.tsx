"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FlatForm = {
  flatNumber: string;
  flatType: string;
  ownerName: string;
  email: string;
};

export default function AddFlatPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FlatForm>({
    flatNumber: "",
    flatType: "",
    ownerName: "",
    email: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveFlat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        flat_no: formData.flatNumber,
        flat_type: formData.flatType,
        owner: formData.ownerName,
        email: formData.email,
      };

      const res = await fetch("http://localhost:5000/api/flats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to add flat");
      }

      router.push("/admin/flats");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while adding flat");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Add Flat</h1>

      <div className="max-w-xl rounded border bg-white p-6 shadow-sm">
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSaveFlat} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Flat No</label>
            <input
              type="text"
              name="flatNumber"
              value={formData.flatNumber}
              onChange={handleInputChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Flat Type</label>
            <input
              type="text"
              name="flatType"
              value={formData.flatType}
              onChange={handleInputChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Owner Name
            </label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
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
              {saving ? "Adding..." : "Add Flat"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/flats")}
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