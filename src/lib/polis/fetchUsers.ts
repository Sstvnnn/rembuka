import { createClient } from "../supabase/server";

export async function fetchUsers(userIds: string[]) {
    const supabase = createClient();

    const { data, error } = await (await supabase)
        .from("users")
        .select("id, full_name")
        .in("id", userIds);

    if (error) {
        console.error("Fetch users error:", error);
        return [];
    }

    return data || [];
}
