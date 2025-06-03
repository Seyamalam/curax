import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { user, doctors, appointments, ambulanceBookings, labs, document } from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export default async function AdminDashboard() {
  const [users, doctorsList, appointmentsList, ambulanceList, labsList, documentsList] = await Promise.all([
    db.select().from(user),
    db.select().from(doctors),
    db.select().from(appointments),
    db.select().from(ambulanceBookings),
    db.select().from(labs),
    db.select().from(document),
  ]);

  const stats = [
    { label: "Users", value: users.length },
    { label: "Doctors", value: doctorsList.length },
    { label: "Appointments", value: appointmentsList.length },
    { label: "Ambulance Bookings", value: ambulanceList.length },
    { label: "Labs", value: labsList.length },
    { label: "Documents", value: documentsList.length },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 