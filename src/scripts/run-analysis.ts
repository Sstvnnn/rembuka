import "dotenv/config";
import { runAnalysis } from "../lib/polis";

async function main() {
    const legalAnalysisId = process.argv[2] || process.env.LEGAL_ANALYSIS_ID;

    if (!legalAnalysisId) {
        throw new Error("Provide a legal analysis id via argv or LEGAL_ANALYSIS_ID.");
    }

    const result = await runAnalysis(legalAnalysisId);

    console.log("PCA Points:");
    console.log(result.points);
}

main();
