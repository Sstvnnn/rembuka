import { fetchVotes } from "./fetchVotes";
import { extractEntities, buildMatrix } from "./buildMatrix";
import { runPCA } from "./runPCA";

export async function runAnalysis() {
    const votes = await fetchVotes();

    console.log("Votes:", votes.length);

    const { users, statements } = extractEntities(votes);

    console.log("Users:", users.length);
    console.log("Statements:", statements.length);

    const matrix = buildMatrix(votes, users, statements);

    console.log("Matrix shape:", matrix.length, matrix[0]?.length);

    const points = runPCA(matrix, users);

    return {
        users,
        statements,
        matrix,
        points,
    };
}
