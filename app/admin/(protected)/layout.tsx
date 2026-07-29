import { redirect } from "next/navigation";

import { verifyAdminSession } from "@/app/lib/adminAuth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return children;
}
