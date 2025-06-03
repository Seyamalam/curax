import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { ambulanceBookings } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "userId", header: "User ID" },
  { accessorKey: "pickupLocation", header: "Pickup Location" },
  { accessorKey: "destination", header: "Destination" },
  { accessorKey: "time", header: "Time" },
  { accessorKey: "status", header: "Status" },
];

export default async function AmbulanceBookingsAdminPage() {
  const allAmbulanceBookings = await db.select().from(ambulanceBookings);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ambulance Bookings</h2>
      <DataTable columns={columns} data={allAmbulanceBookings} />
    </div>
  );
} 