"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";

type TrainTodayButtonProps = {
  initialCheckedIn: boolean;
  initialCheckedOut: boolean;
  initialCheckedInAt?: string | null;
  initialCheckedOutAt?: string | null;
};

export function TrainTodayButton({
  initialCheckedIn,
  initialCheckedOut,
  initialCheckedInAt = null,
  initialCheckedOutAt = null,
}: TrainTodayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [checkedOut, setCheckedOut] = useState(initialCheckedOut);
  const [checkedInAt, setCheckedInAt] = useState(initialCheckedInAt);
  const [checkedOutAt, setCheckedOutAt] = useState(initialCheckedOutAt);
  const [message, setMessage] = useState("");

  async function handleCheckIn() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      setMessage(data.message + (data.warning ? ` ${data.warning}` : ""));
      if (data.success) {
        setCheckedIn(true);
        setCheckedInAt(new Date().toISOString());
      }
    } catch {
      setMessage("Check-in failed");
    }
    setLoading(false);
  }

  async function handleCheckOut() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/attendance/checkout", { method: "POST" });
      const data = await res.json();
      setMessage(data.message);
      if (data.success) {
        setCheckedOut(true);
        setCheckedOutAt(new Date().toISOString());
      }
    } catch {
      setMessage("Check-out failed");
    }
    setLoading(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/30 bg-kaizen-black/95 p-4 backdrop-blur lg:relative lg:border-0 lg:bg-transparent lg:p-0">
      <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl border border-blue/20 bg-kaizen-dark px-4 py-3 text-center lg:mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-kaizen-muted">Time in</p>
          <p className="mt-1 font-display text-lg font-bold">{formatTime(checkedInAt) || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-kaizen-muted">Time out</p>
          <p className="mt-1 font-display text-lg font-bold">{formatTime(checkedOutAt) || "—"}</p>
        </div>
      </div>
      {!checkedIn && (
        <Button
          onClick={handleCheckIn}
          disabled={loading}
          variant="gold"
          size="xl"
          className="check-in-pulse w-full text-xl font-display tracking-wider"
        >
          {loading ? "..." : "TRAIN TODAY — CHECK IN"}
        </Button>
      )}
      {checkedIn && !checkedOut && (
        <Button
          onClick={handleCheckOut}
          disabled={loading}
          variant="primary"
          size="xl"
          className="w-full text-xl font-display tracking-wider"
        >
          {loading ? "..." : "FINISH SESSION — CHECK OUT"}
        </Button>
      )}
      {checkedOut && (
        <p className="text-center font-display text-lg text-green-400">Session complete. See you next time!</p>
      )}
      {message && <p className="mt-3 text-center text-sm text-kaizen-silver">{message}</p>}
    </div>
  );
}
