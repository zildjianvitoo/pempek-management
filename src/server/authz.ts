import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export async function requireOwner() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "OWNER") {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }
  return { ok: true as const, session };
}

