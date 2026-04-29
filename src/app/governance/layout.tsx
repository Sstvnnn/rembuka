import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/sidebar";

export default function GovernanceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F6F5F2]">
      <AdminSidebar scope="governance" />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
