"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckInButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; warning?: string } | null>(null);

  async function handleCheckIn() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/attendance/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: "Check-in failed" });
    }
    setLoading(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue/30 bg-kaizen-black/95 p-4 backdrop-blur lg:relative lg:border-0 lg:bg-transparent lg:p-0">
      <Button
        onClick={handleCheckIn}
        disabled={loading || result?.success}
        variant="primary"
        size="xl"
        className="check-in-pulse w-full text-xl font-display tracking-wider"
      >
        {loading ? "CHECKING IN..." : result?.success ? "✓ CHECKED IN" : "CHECK IN"}
      </Button>
      {result && (
        <p className={`mt-3 text-center text-sm ${result.success ? "text-green-400" : "text-red-400"}`}>
          {result.message}
          {result.warning && <span className="block text-yellow-400 mt-1">{result.warning}</span>}
        </p>
      )}
    </div>
  );
}
