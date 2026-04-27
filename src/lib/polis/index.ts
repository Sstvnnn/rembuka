import { fetchVotes } from "./fetchVotes";
import { fetchStatements } from "./fetchStatements";
import { extractEntities, buildMatrix } from "./buildMatrix";
import { runPCA } from "./runPCA";
import { runKMeans } from "./runKMeans";
import { detectConsensus } from "./consensus";
import { fetchUsers } from "./fetchUsers";

export async function runAnalysis(legalAnalysisId: string) {
    const votes = await fetchVotes(legalAnalysisId);
    const statementsData = await fetchStatements(legalAnalysisId);

    if (votes.length === 0) {
        return {
            clustered: [],
            consensus: [],
        };
    }

    console.log("Votes:", votes.length);

    const { users, statements } = extractEntities(votes);

    console.log("Users:", users.length);
    console.log("Statements:", statements);

    const matrix = buildMatrix(votes, users, statements);

    console.log("Matrix shape:", matrix.length, matrix[0]?.length);

    // PCA
    const points = runPCA(matrix, users);

    // CLUSTERING
    const clustered = runKMeans(points, 2);

    // CONSENSUS (pure)
    const rawConsensus = detectConsensus(votes, clustered);

    // 🧠 inject TEXT (clean mapping)
    const statementMap: Record<string, string> = {};

    statementsData.forEach((s: any) => {
        statementMap[s.id] = s.text;
    });

    const consensus = rawConsensus.map((c) => ({
        ...c,
        text: statementMap[c.statement_id] || "",
    }));

    const userIds = clustered.map((u) => u.user);

    const usersData = await fetchUsers(userIds);

    const userMap: Record<string, string> = {};

    usersData.forEach((u: any) => {
        userMap[u.id] = u.full_name;
    });

    const enrichedPoints = clustered.map((p: any) => {
        const name = userMap[p.user] || "Unknown";

        return {
            ...p,
            label: getInitials(name),
            full_name: name,
        };
    });

    return {
        users,
        statements,
        matrix,
        points,
        clustered: enrichedPoints,
        consensus,
        votes,
    };
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
