"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type FlatForm = {
  flatNumber: string;
  flatType: string;
  ownerName: string;
  email: string;
};

export default function EditFlatPage() {
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<FlatForm>({
    flatNumber: "",
    flatType: "",
    ownerName: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchFlat() {
    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5000/api/flats/${params.id}`);

      const flat = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(flat?.message || "Failed to fetch flat details");
        return;
      }

      setFormData({
        flatNumber: flat.flatNumber,
        flatType: flat.flatType,
        ownerName: flat.ownerName,
        email: flat.email,
      });
    } catch {
      toast.error("Something went wrong while fetching flat");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchFlat();
    }
  }, [params.id]);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleUpdateFlat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        flat_no: formData.flatNumber,
        flat_type: formData.flatType,
        owner: formData.ownerName,
        email: formData.email,
      };

      const res = await fetch(`http://localhost:5000/api/flats/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to update flat");
        return;
      }

      toast.success("Flat details updated successfully");

      router.push("/admin/flats");
    } catch {
      toast.error("Something went wrong while updating flat");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading flat details...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Edit Flat</h1>

      <div className="max-w-xl rounded border bg-white p-6 shadow-sm">
        <form onSubmit={handleUpdateFlat} className="space-y-4">
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
            <label className="mb-1 block text-sm font-medium">Owner Name</label>
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
              {saving ? "Updating..." : "Update Flat"}
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
