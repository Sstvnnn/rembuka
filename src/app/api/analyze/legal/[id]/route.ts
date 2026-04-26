import { runAnalysis } from "@/lib/polis";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const { id } = await context.params;

    const result = await runAnalysis(id);

    return Response.json(result);
}
