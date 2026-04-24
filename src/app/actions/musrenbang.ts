"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type GovernanceProfile = {
  id: string;
  role: string;
  position: string;
  location: string;
};

type CitizenProfile = {
  location: string | null;
  verification_status: string;
};

function parseDateTimeInput(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Tanggal yang dimasukkan tidak valid.");
  }

  return parsed;
}

async function getCitizenProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("location, verification_status")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("Profil warga tidak ditemukan.");
  }

  return data as CitizenProfile;
}

async function getGovernanceProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("governance")
    .select("id, role, position, location")
    .eq("id", userId)
    .maybeSingle();

  return (data ?? null) as GovernanceProfile | null;
}

export async function createProposalAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const governanceProfile = await getGovernanceProfile(user.id);
  if (governanceProfile) {
    throw new Error("Hanya warga yang dapat mengajukan aspirasi daerah.");
  }

  const profile = await getCitizenProfile(user.id);

  if (!profile.location) {
    throw new Error("Lokasi domisili belum tersedia di profil Anda.");
  }

  if (profile.verification_status !== "verified") {
    throw new Error("Hanya warga terverifikasi yang dapat mengajukan aspirasi daerah.");
  }

  const now = new Date().toISOString();
  const { data: period, error: periodError } = await supabase
    .from("proposal_periods")
    .select("id")
    .eq("location", profile.location)
    .lte("proposal_start_at", now)
    .gte("proposal_end_at", now)
    .order("proposal_start_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (periodError || !period) {
    throw new Error("Saat ini belum ada jadwal pengajuan yang aktif untuk wilayah Anda.");
  }

  const { count, error: duplicateError } = await supabase
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .eq("period_id", period.id);

  if (duplicateError) {
    throw new Error("Gagal memeriksa kuota pengajuan warga.");
  }

  if ((count ?? 0) > 0) {
    throw new Error("Setiap warga hanya dapat mengajukan satu aspirasi pada satu jadwal pengajuan.");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const estimatedCost = Number(formData.get("estimated_cost"));
  const images = formData.getAll("images") as File[];

  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .insert({
      author_id: user.id,
      period_id: period.id,
      title,
      description,
      category,
      location: profile.location,
      estimated_cost: estimatedCost,
      status: "pending",
    })
    .select()
    .single();

  if (proposalError) {
    throw new Error(proposalError.message);
  }

  if (images.length > 0) {
    const uploadPromises = images.map(async (file) => {
      if (file.size === 0) {
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${proposal.id}/${Math.random()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("proposal-attachments")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { error: imageError } = await supabase
        .from("proposal_images")
        .insert({
          proposal_id: proposal.id,
          image_path: uploadData.path,
        });

      if (imageError) {
        throw imageError;
      }

      return uploadData.path;
    });

    await Promise.all(uploadPromises);
  }

  revalidatePath("/proposals");
  revalidatePath("/proposals/submit");
  return proposal;
}

export async function castVoteAction(proposalId: string, rank: 1 | 2 | 3) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const governanceProfile = await getGovernanceProfile(user.id);
  if (governanceProfile) {
    throw new Error("Hanya warga yang dapat memberikan suara.");
  }

  const profile = await getCitizenProfile(user.id);
  if (!profile.location || profile.verification_status !== "verified") {
    throw new Error("Hanya warga terverifikasi yang dapat memberikan suara.");
  }

  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("id, period_id, location, status")
    .eq("id", proposalId)
    .single();

  if (proposalError || !proposal) {
    throw new Error("Proposal tidak ditemukan.");
  }

  if (proposal.location !== profile.location) {
    throw new Error("Anda hanya dapat memilih proposal dari wilayah Anda sendiri.");
  }

  if (proposal.status !== "approved") {
    throw new Error("Hanya proposal yang sudah disetujui pemerintah yang dapat dipilih.");
  }

  const { data: period, error: periodError } = await supabase
    .from("proposal_periods")
    .select("id, voting_start_at, voting_end_at")
    .eq("id", proposal.period_id)
    .single();

  if (periodError || !period) {
    throw new Error("Jadwal voting untuk proposal ini tidak ditemukan.");
  }

  const now = new Date();
  if (now < new Date(period.voting_start_at) || now > new Date(period.voting_end_at)) {
    throw new Error("Sesi pemungutan suara untuk wilayah Anda belum aktif atau sudah berakhir.");
  }

  const { error: deleteError } = await supabase
    .from("proposal_votes")
    .delete()
    .eq("user_id", user.id)
    .eq("period_id", proposal.period_id)
    .eq("rank", rank)
    .neq("proposal_id", proposalId);

  if (deleteError) {
    throw deleteError;
  }

  const { data, error } = await supabase
    .from("proposal_votes")
    .upsert(
      {
        user_id: user.id,
        proposal_id: proposalId,
        period_id: proposal.period_id,
        rank,
      },
      {
        onConflict: "user_id,period_id,proposal_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
  return data;
}

export async function updateTaxProfileAction(income: number, taxPaid: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("user_tax_profiles").upsert({
    user_id: user.id,
    annual_income: income,
    estimated_tax_paid: taxPaid,
    last_updated: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  revalidatePath("/budget");
}

export async function scheduleProposalPeriodAction(input: {
  periodId?: string;
  proposalStart: string;
  proposalEnd: string;
  votingStart: string;
  votingEnd: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const governanceProfile = await getGovernanceProfile(user.id);
  if (!governanceProfile || governanceProfile.role === "admin") {
    throw new Error("Hanya akun pemerintah wilayah yang dapat mengatur jadwal aspirasi daerah.");
  }

  const proposalStartAt = parseDateTimeInput(input.proposalStart);
  const proposalEndAt = parseDateTimeInput(input.proposalEnd);
  const votingStartAt = parseDateTimeInput(input.votingStart);
  const votingEndAt = parseDateTimeInput(input.votingEnd);

  if (!(proposalStartAt < proposalEndAt && proposalEndAt < votingStartAt && votingStartAt < votingEndAt)) {
    throw new Error("Urutan jadwal harus: mulai pengajuan < akhir pengajuan < mulai voting < akhir voting.");
  }

  const { data: existingPeriods, error: existingError } = await supabase
    .from("proposal_periods")
    .select("id, proposal_start_at, voting_end_at")
    .eq("location", governanceProfile.location);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const hasOverlap = (existingPeriods || []).some((period) => {
    if (period.id === input.periodId) {
      return false;
    }

    const existingStart = new Date(period.proposal_start_at);
    const existingEnd = new Date(period.voting_end_at);
    return proposalStartAt <= existingEnd && votingEndAt >= existingStart;
  });

  if (hasOverlap) {
    throw new Error("Sudah ada jadwal lain yang tumpang tindih untuk wilayah ini.");
  }

  if (input.periodId) {
    const { error } = await supabase
      .from("proposal_periods")
      .update({
        proposal_start_at: proposalStartAt.toISOString(),
        proposal_end_at: proposalEndAt.toISOString(),
        voting_start_at: votingStartAt.toISOString(),
        voting_end_at: votingEndAt.toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.periodId)
      .eq("location", governanceProfile.location);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("proposal_periods").insert({
      location: governanceProfile.location,
      proposal_start_at: proposalStartAt.toISOString(),
      proposal_end_at: proposalEndAt.toISOString(),
      voting_start_at: votingStartAt.toISOString(),
      voting_end_at: votingEndAt.toISOString(),
      created_by: user.id,
      updated_by: user.id,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/proposals");
}

export async function reviewProposalAction(proposalId: string, status: "approved" | "rejected") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const governanceProfile = await getGovernanceProfile(user.id);
  if (!governanceProfile || governanceProfile.role === "admin") {
    throw new Error("Hanya akun pemerintah wilayah yang dapat meninjau proposal.");
  }

  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("id, period_id, location, status")
    .eq("id", proposalId)
    .single();

  if (proposalError || !proposal) {
    throw new Error("Proposal tidak ditemukan.");
  }

  if (proposal.location !== governanceProfile.location) {
    throw new Error("Anda hanya dapat meninjau proposal dari wilayah tugas Anda.");
  }

  const { data: period, error: periodError } = await supabase
    .from("proposal_periods")
    .select("voting_start_at")
    .eq("id", proposal.period_id)
    .single();

  if (periodError || !period) {
    throw new Error("Jadwal proposal tidak ditemukan.");
  }

  if (new Date() >= new Date(period.voting_start_at)) {
    throw new Error("Status proposal tidak dapat diubah setelah sesi voting dimulai.");
  }

  const { error } = await supabase
    .from("proposals")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId);

  if (error) {
    throw error;
  }

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
}



