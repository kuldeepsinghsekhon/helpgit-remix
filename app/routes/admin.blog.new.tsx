import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { db } from "~/utils/db.server";
import RichTextEditor from "~/components/RichTextEditor";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "true";

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  await db.blog.create({
    data: {
      title,
      content,
      published,
      slug,
    },
  });

  return redirect("/admin/blog");
}

export default function NewBlog() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [content, setContent] = useState("");

  useEffect(() => {
    if (isSubmitting) {
      setContent("");
    }
  }, [isSubmitting]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
        </div>

        <Form method="post" className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter post title"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <input type="hidden" name="content" value={content} />
            <div className="prose-container border border-gray-300 rounded-md">
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="published"
              type="checkbox"
              name="published"
              value="true"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Publish immediately
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
} 