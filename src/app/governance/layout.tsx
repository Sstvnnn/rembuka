import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import { getCurrentProfile } from "@/lib/profile";

export default async function GovernanceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile } = await getCurrentProfile();
  return (
    <div className="flex min-h-screen bg-[#F6F5F2]">
      <AdminSidebar scope="governance" location={profile?.location} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
