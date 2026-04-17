import { HomeClient } from "./home-client";
import { getCurrentProfile } from "@/lib/profile";

export default async function HomePage() {
  const { user, profile } = await getCurrentProfile();

  return <HomeClient user={user} profile={profile} />;
}
