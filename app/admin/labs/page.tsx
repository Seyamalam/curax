import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { labs } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export default async function LabsAdminPage() {
  const allLabs = await db.select().from(labs);
  // Map timeSlots to string for client rendering
  const labsData = allLabs.map(lab => ({ ...lab, timeSlots: JSON.stringify(lab.timeSlots) }));

  const columns: ColumnDef<any>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "timeSlots", header: "Time Slots" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Labs</h2>
      <DataTable columns={columns} data={labsData} />
    </div>
  );
} 