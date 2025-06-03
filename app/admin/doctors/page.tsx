import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { doctors } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "specialty", header: "Specialty" },
  { accessorKey: "hospital", header: "Hospital" },
  { accessorKey: "experience", header: "Experience (years)" },
  { accessorKey: "availability", header: "Availability" },
  { accessorKey: "fees", header: "Fees" },
  { accessorKey: "bio", header: "Bio" },
];

export default async function DoctorsAdminPage() {
  const allDoctors = await db.select().from(doctors);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Doctors</h2>
      <DataTable columns={columns} data={allDoctors} />
    </div>
  );
} 