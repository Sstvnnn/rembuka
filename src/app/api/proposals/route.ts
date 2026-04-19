import { NextResponse } from "next/server";
import { createProposal, getProposals } from "@/lib/proposals";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proposal = await createProposal(body);
    return NextResponse.json(proposal);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create proposal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
