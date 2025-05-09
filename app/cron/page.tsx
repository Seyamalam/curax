"use client";
import { useState } from "react";

export default function CronDemoPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSendReminders() {
    setStatus("Sending...");
    const res = await fetch("/api/push/send-reminders", { method: "POST" });
    if (res.ok) {
      setStatus("Reminders sent! (Check your device)");
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error || "Unknown error"}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Manual Cron Demo</h1>
      <button
        onClick={handleSendReminders}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send Medication Reminders Now
      </button>
      {status && <div className="mt-4">{status}</div>}
    </div>
  );
} 