import "dotenv/config";
import { runAnalysis } from "../lib/polis";

async function main() {
    const result = await runAnalysis();

    console.log("PCA Points:");
    console.log(result.points);
}

main();
