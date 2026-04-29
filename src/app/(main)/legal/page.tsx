import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";

export default async function LegacyPolisPage() {
  const { userType } = await getCurrentProfile();
  redirect(userType === "governance" ? "/governance/polis" : "/citizen/polis");
}
