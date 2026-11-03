import type { Config } from "@netlify/functions";
import { drizzle } from "drizzle-orm/netlify-db";
import { desc, eq, sql } from "drizzle-orm";
import { todos } from "../../db/schema.js";

export default async (req: Request) => {
  const path = new URL(req.url).pathname;
  const match = path.match(/^\/todo\/([\da-f-]+)\/(update|delete)$/i);
  const validId = match && /^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(match[1]);
  const isList = path === "/todo/all" && req.method === "GET";
  const isCreate = path === "/todo/create" && req.method === "POST";
  const isUpdate = validId && match[2] === "update" && req.method === "PUT";
  const isDelete = validId && match[2] === "delete" && req.method === "DELETE";
  if (!isList && !isCreate && !isUpdate && !isDelete) {
    return Response.json({ message: "Route not found" }, { status: 404 });
  }

  try {
    const db = drizzle();
    if (isCreate) {
      let body;
      try { body = await req.json(); } catch {
        return Response.json({ message: "Invalid JSON" }, { status: 400 });
      }
      const task = typeof body?.task === "string" ? body.task.trim() : "";
      if (!task || task.length > 2000) {
        return Response.json({ message: "Enter a task of up to 2000 characters" }, { status: 400 });
      }
      await db.insert(todos).values({ task });
    } else if (isUpdate) {
      await db.update(todos).set({ status: sql`not ${todos.status}` }).where(eq(todos.id, match![1]));
    } else if (isDelete) {
      await db.delete(todos).where(eq(todos.id, match![1]));
    }
    const items = await db.select().from(todos).orderBy(desc(todos.createdAt));
    return Response.json({ todos: items }, {
      status: isCreate ? 201 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ message: "Unable to save or load tasks. Please try again." }, { status: 500 });
  }
};

export const config: Config = { path: "/todo/*" };
