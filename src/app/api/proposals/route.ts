import { NextResponse } from "next/server";
import { getProposals } from "@/lib/proposals";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    
    const proposals = await getProposals({ status, category });
    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
  }
}
