import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { appointments } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "doctorId", header: "Doctor ID" },
  { accessorKey: "userId", header: "User ID" },
  { accessorKey: "time", header: "Time" },
  { accessorKey: "status", header: "Status" },
];

export default async function AppointmentsAdminPage() {
  const allAppointments = await db.select().from(appointments);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Appointments</h2>
      <DataTable columns={columns} data={allAppointments} />
    </div>
  );
} 