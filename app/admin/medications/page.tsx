import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { medications } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "userId", header: "User ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "dosage", header: "Dosage" },
  { accessorKey: "notes", header: "Notes" },
  { accessorKey: "startDate", header: "Start Date" },
  { accessorKey: "endDate", header: "End Date" },
];

export default async function MedicationsAdminPage() {
  const allMedications = await db.select().from(medications);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Medications</h2>
      <DataTable columns={columns} data={allMedications} />
    </div>
  );
} 