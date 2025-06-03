import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { labBookings } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "userId", header: "User ID" },
  { accessorKey: "labId", header: "Lab ID" },
  { accessorKey: "labTestId", header: "Lab Test ID" },
  { accessorKey: "time", header: "Time" },
  { accessorKey: "locationType", header: "Location Type" },
  { accessorKey: "status", header: "Status" },
];

export default async function LabBookingsAdminPage() {
  const allLabBookings = await db.select().from(labBookings);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lab Bookings</h2>
      <DataTable columns={columns} data={allLabBookings} />
    </div>
  );
} 