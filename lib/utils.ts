import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PESO = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function formatPeso(amount: number) {
  return PESO.format(amount);
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function calculateAge(birthday: string | null): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getAgeGroup(birthday: string | null): "child" | "teen" | "adult" {
  const age = calculateAge(birthday);
  if (age === null) return "adult";
  if (age < 13) return "child";
  if (age < 18) return "teen";
  return "adult";
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function daysSince(date: string | null): number | null {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function getRetentionRisk(
  lastVisit: string | null
): "green" | "yellow" | "orange" | "red" {
  const days = daysSince(lastVisit);
  if (days === null) return "red";
  if (days <= 7) return "green";
  if (days <= 14) return "yellow";
  if (days <= 30) return "orange";
  return "red";
}
