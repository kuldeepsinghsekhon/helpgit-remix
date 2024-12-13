import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { db } from "~/utils/db.server";

export async function action({ params }: ActionFunctionArgs) {
  await db.blog.delete({
    where: { id: params.id },
  });

  return redirect("/admin/blog");
} 