import { getCurrentProfile } from "@/lib/profile";
import UploadClient from "./upload-client";

export default async function AnalyzePageTest() {
    const { profile } = await getCurrentProfile();

    return <UploadClient lockedLocation={profile?.location} />;
}
