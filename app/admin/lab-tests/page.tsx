import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { labTests } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "labId", header: "Lab ID" },
];

export default async function LabTestsAdminPage() {
  const allLabTests = await db.select().from(labTests);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lab Tests</h2>
      <DataTable columns={columns} data={allLabTests} />
    </div>
  );
} 