import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { db } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const stats = await db.blog.aggregate({
    _count: {
      id: true,
    },
    _max: {
      updatedAt: true,
    },
  });

  const publishedCount = await db.blog.count({
    where: {
      published: true,
    },
  });

  const draftCount = await db.blog.count({
    where: {
      published: false,
    },
  });

  return json({
    totalPosts: stats._count.id,
    publishedPosts: publishedCount,
    draftPosts: draftCount,
    lastUpdated: stats._max.updatedAt,
  });
}

export default function AdminLayout() {
  const stats = useLoaderData<typeof loader>();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-8">
          <Link
            to="/admin"
            className={`block px-4 py-2 hover:bg-gray-800 ${
              currentPath === "/admin" ? "bg-gray-800" : ""
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/blog"
            className={`block px-4 py-2 hover:bg-gray-800 ${
              currentPath.startsWith("/admin/blog") ? "bg-gray-800" : ""
            }`}
          >
            Blog Posts
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {currentPath === "/admin" ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Posts Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Total Posts</h3>
                    <p className="text-2xl font-semibold">{stats.totalPosts}</p>
                  </div>
                </div>
              </div>

              {/* Published Posts Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Published</h3>
                    <p className="text-2xl font-semibold">
                      {stats.publishedPosts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Draft Posts Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Drafts</h3>
                    <p className="text-2xl font-semibold">{stats.draftPosts}</p>
                  </div>
                </div>
              </div>

              {/* Last Updated Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Last Updated</h3>
                    <p className="text-sm font-semibold">
                      {stats.lastUpdated
                        ? new Date(stats.lastUpdated).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex gap-4">
                <Link
                  to="/admin/blog/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Post
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
} 