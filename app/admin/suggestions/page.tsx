"use client";
import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

const suggestions = [
  { id: "1", documentId: "1", documentCreatedAt: "2024-01-01", originalText: "Old text", suggestedText: "New text", description: "Typo fix", isResolved: false, userId: "1", createdAt: "2024-01-02" },
  { id: "2", documentId: "2", documentCreatedAt: "2024-01-02", originalText: "Wrong code", suggestedText: "Correct code", description: "Bug fix", isResolved: true, userId: "2", createdAt: "2024-01-03" },
];

const columns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "documentId", header: "Document ID" },
  { accessorKey: "documentCreatedAt", header: "Document Created At" },
  { accessorKey: "originalText", header: "Original Text" },
  { accessorKey: "suggestedText", header: "Suggested Text" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "isResolved", header: "Resolved" },
  { accessorKey: "userId", header: "User ID" },
  { accessorKey: "createdAt", header: "Created At" },
];

export default function SuggestionsAdminPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Suggestions</h2>
      <DataTable columns={columns} data={suggestions} />
    </div>
  );
} 