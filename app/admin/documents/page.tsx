import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { document } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "createdAt", header: "Created At" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "content", header: "Content" },
  { accessorKey: "kind", header: "Kind" },
  { accessorKey: "userId", header: "User ID" },
];

export default async function DocumentsAdminPage() {
  const allDocuments = await db.select().from(document);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Documents</h2>
      <DataTable columns={columns} data={allDocuments} />
    </div>
  );
} 