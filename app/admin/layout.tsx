import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/admin" },
  { name: "Users", href: "/admin/users" },
  { name: "Doctors", href: "/admin/doctors" },
  { name: "Appointments", href: "/admin/appointments" },
  { name: "Ambulance Bookings", href: "/admin/ambulance-bookings" },
  { name: "Labs", href: "/admin/labs" },
  { name: "Lab Tests", href: "/admin/lab-tests" },
  { name: "Lab Bookings", href: "/admin/lab-bookings" },
  { name: "Medications", href: "/admin/medications" },
  { name: "Documents", href: "/admin/documents" },
  { name: "Suggestions", href: "/admin/suggestions" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="w-64 bg-background border-r flex flex-col py-6 px-4 sticky top-0 h-screen">
        <div className="mb-8 text-2xl font-bold tracking-tight">Admin Panel</div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} legacyBehavior passHref>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base font-medium",
                  // Add active state styling if needed
                )}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
} 