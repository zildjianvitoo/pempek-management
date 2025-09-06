export type Role = "OWNER" | "KASIR";

export function isOwner(role?: string | null): boolean {
  return role === "OWNER";
}

export function isKasir(role?: string | null): boolean {
  return role === "KASIR";
}

