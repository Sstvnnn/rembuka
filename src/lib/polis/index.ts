import { fetchVotes } from "./fetchVotes";
import { extractEntities, buildMatrix } from "./buildMatrix";
import { runPCA } from "./runPCA";
import { runKMeans } from "./runKMeans";
import { detectConsensus } from "./consensus";

export async function runAnalysis(legalAnalysisId: string) {
    const votes = await fetchVotes(legalAnalysisId);

    if (votes.length === 0) {
        return {
            clustered: [],
            consensus: [],
        };
    }

    console.log("Votes:", votes.length);

    const { users, statements } = extractEntities(votes);

    console.log("Users:", users.length);
    console.log("Statements:", statements.length);

    const matrix = buildMatrix(votes, users, statements);

    console.log("Matrix shape:", matrix.length, matrix[0]?.length);

    // 🧠 PCA
    const points = runPCA(matrix, users);

    console.log("PCA Points:", points);

    // 🧠 CLUSTERING
    const clustered = runKMeans(points, 2);

    console.log("Clustered:", clustered);

    const consensus = detectConsensus(votes, clustered);

    console.log("Consensus Results:");
    console.log(consensus);

    return {
        users,
        statements,
        matrix,
        points,
        clustered,
        consensus,
    };
}
