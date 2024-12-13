import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { db } from "~/utils/db.server";
import { type Blog } from "@prisma/client";

export async function loader({ request }: LoaderFunctionArgs) {
  const blogs = await db.blog.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return json({ blogs });
}

const columnHelper = createColumnHelper<Blog>();

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => (
      <Link to={`/admin/blog/${info.row.original.id}`} className="text-blue-600 hover:underline">
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("published", {
    header: "Status",
    cell: (info) => (
      <span className={`px-2 py-1 rounded ${info.getValue() ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {info.getValue() ? 'Published' : 'Draft'}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("id", {
    header: "Actions",
    cell: (info) => (
      <div className="space-x-2">
        <Link
          to={`/admin/blog/${info.getValue()}/edit`}
          className="text-blue-600 hover:underline"
        >
          Edit
        </Link>
        <button
          onClick={() => handleDelete(info.getValue())}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    ),
  }),
];

export default function AdminBlog() {
  const { blogs } = useLoaderData<typeof loader>();
  const [globalFilter, setGlobalFilter] = useState("");
  const fetcher = useFetcher();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      fetcher.submit(null, {
        method: "post",
        action: `/admin/blog/${id}/delete`,
      });
    }
  };

  const table = useReactTable({
    data: blogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="p-8 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link
          to="new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="px-4 py-2 border rounded w-full max-w-xs"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
      </div>
    </div>
  );
}