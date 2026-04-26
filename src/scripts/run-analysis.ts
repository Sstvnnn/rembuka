import { runAnalysis } from "../lib/polis/index";

async function main() {
    const result = await runAnalysis();

    console.log("PCA Points:");
    console.log(result.points);
}

main();
