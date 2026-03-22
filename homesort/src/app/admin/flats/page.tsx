"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const columnHelper = createColumnHelper<Flat>();

export default function FlatsPage() {
  const router = useRouter();

  const [data, setData] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

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

  // UPDATED: Add now navigates to a new page
  function handleAddFlat() {
    router.push("/admin/flats/new");
  }

  // UPDATED: Edit now navigates to a new page
  function handleEditFlat(flat: Flat) {
    router.push(`/admin/flats/${flat.id}`);
  }

  // UPDATED: Delete now asks for confirmation first
  async function handleDeleteFlat(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this flat?",
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/flats/${id}`, {
        method: "DELETE",
      });

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
  if (error) return <div className="p-6 text-red-500">{error}</div>;

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
    </div>
  );
}