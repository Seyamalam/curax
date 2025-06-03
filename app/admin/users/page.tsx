import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { user } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "password", header: "Password" },
];

export default async function UsersAdminPage() {
  const users = await db.select().from(user);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button>Add User</Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
} 