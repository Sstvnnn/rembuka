"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Proposal } from "@/types/musrenbang";

export async function createProposalAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const location = formData.get("location") as string;
  const estimated_cost = Number(formData.get("estimated_cost"));
  const images = formData.getAll("images") as File[];

  // 1. Insert the main proposal
  const { data: proposal, error: pError } = await supabase
    .from("proposals")
    .insert({
      author_id: user.id,
      title,
      description,
      category,
      location,
      estimated_cost,
      status: "pending"
    })
    .select()
    .single();

  if (pError) throw new Error(pError.message);

  // 2. Upload images and link them
  if (images && images.length > 0) {
    const uploadPromises = images.map(async (file) => {
      if (file.size === 0) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${proposal.id}/${Math.random()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("proposal-attachments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Insert path into database
      const { error: imgError } = await supabase
        .from("proposal_images")
        .insert({
          proposal_id: proposal.id,
          image_path: uploadData.path
        });

      if (imgError) throw imgError;
      return uploadData.path;
    });

    await Promise.all(uploadPromises);
  }
  
  revalidatePath("/proposals");
  return proposal;
}

export async function castVoteAction(proposalId: string, rank: 1 | 2 | 3) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("proposal_votes")
    .upsert({
      user_id: user.id,
      proposal_id: proposalId,
      rank: rank
    }, {
      onConflict: "user_id, rank"
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/proposals");
  return data;
}

export async function updateTaxProfileAction(income: number, taxPaid: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("user_tax_profiles")
    .upsert({
      user_id: user.id,
      annual_income: income,
      estimated_tax_paid: taxPaid,
      last_updated: new Date().toISOString()
    });

  if (error) throw error;
  revalidatePath("/budget");
}

export async function verifyProposalAction(proposalId: string, expiryDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is governance
  const { data: govProfile } = await supabase
    .from("governance")
    .select("id, role, location")
    .eq("id", user.id)
    .maybeSingle();

  if (!govProfile) throw new Error("Only governance officials can verify proposals.");

  // If not admin, check if location matches
  if (govProfile.role !== "admin") {
    const { data: proposal } = await supabase
      .from("proposals")
      .select("location")
      .eq("id", proposalId)
      .single();

    if (!proposal || proposal.location !== govProfile.location) {
      throw new Error("You can only verify proposals within your assigned location.");
    }
  }

  // Set expiry to the end of the day (23:59:59.999)
  const endOfDay = new Date(expiryDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { error } = await supabase
    .from("proposals")
    .update({
      status: "voting",
      expiry_date: endOfDay.toISOString()
    })
    .eq("id", proposalId);

  if (error) throw error;
  
  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
}
