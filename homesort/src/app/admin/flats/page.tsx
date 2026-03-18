"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";

type Flat = {
  id: number;
  flatNumber: string;
  flatType: string;
  ownerName: string;
  email: string;
};

type FlatForm = {
  flatNumber: string;
  flatType: string;
  ownerName: string;
  email: string;
};

const columnHelper = createColumnHelper<Flat>();

export default function FlatsPage() {
  const [data, setData] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FlatForm>({
    flatNumber: "",
    flatType: "",
    ownerName: "",
    email: "",
  });

  async function fetchFlats() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/flats");

      if (!res.ok) {
        throw new Error("Failed to fetch flats");
      }

      const result = await res.json();

      const formatted: Flat[] = result.map((flat: any) => ({
        id: flat.id,
        flatNumber: flat.flatNumber,
        flatType: flat.flatType,
        ownerName: flat.ownerName,
        email: flat.email,
      }));

      setData(formatted);
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
    fetchFlats();
  }, []);

  function handleAddFlat() {
    setSelectedFlat(null);
    setFormData({
      flatNumber: "",
      flatType: "",
      ownerName: "",
      email: "",
    });
    setIsModalOpen(true);
  }

  function handleEditFlat(flat: Flat) {
    setSelectedFlat(flat);
    setFormData({
      flatNumber: flat.flatNumber,
      flatType: flat.flatType,
      ownerName: flat.ownerName,
      email: flat.email,
    });
    setIsModalOpen(true);
  }

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

      let res: Response;

      if (selectedFlat) {
        res = await fetch(
          `http://localhost:5000/api/flats/${selectedFlat.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );
      } else {
        res = await fetch("http://localhost:5000/api/flats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to save flat");
      }

      await fetchFlats();
      setIsModalOpen(false);
      setSelectedFlat(null);
      setFormData({
        flatNumber: "",
        flatType: "",
        ownerName: "",
        email: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while saving");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFlat(id: number) {
    try {
      const res = await fetch(`http://localhost:5000/api/flats/${id}`, {
        method: "DELETE",
      });
      console.log("Deleting flat id:", id);
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete flat");
      }

      await fetchFlats();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while deleting");
      }
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor("flatNumber", {
        header: "Flat No",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("flatType", {
        header: "Flat Type",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("ownerName", {
        header: "Owner Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEditFlat(row.original)}
              className="rounded bg-blue-500 px-3 py-1 text-white"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteFlat(row.original.id)}
              className="rounded bg-red-500 px-3 py-1 text-white"
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) return <div className="p-6">Loading flats...</div>;
  if (error && !isModalOpen)
    return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Flats</h1>

        <button
          onClick={handleAddFlat}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Add Flat
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search flats..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full max-w-sm rounded border px-3 py-2"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="cursor-pointer border-b px-4 py-3 text-left"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border-b px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center">
                  No flats found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="mt-6 rounded border bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            {selectedFlat ? "Edit Flat" : "Add Flat"}
          </h2>

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
              <label className="mb-1 block text-sm font-medium">
                Flat Type
              </label>
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
                {saving
                  ? selectedFlat
                    ? "Updating..."
                    : "Adding..."
                  : selectedFlat
                    ? "Update Flat"
                    : "Add Flat"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFlat(null);
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
