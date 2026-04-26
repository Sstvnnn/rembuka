export function extractEntities(votes: any[]) {
    const userSet = new Set<string>();
    const statementSet = new Set<string>();

    votes.forEach((v) => {
        userSet.add(v.user_id);
        statementSet.add(v.statement_id);
    });

    return {
        users: Array.from(userSet),
        statements: Array.from(statementSet),
    };
}

export function buildMatrix(
    votes: any[],
    users: string[],
    statements: string[],
) {
    const userIndex: any = {};
    const statementIndex: any = {};

    users.forEach((u, i) => (userIndex[u] = i));
    statements.forEach((s, i) => (statementIndex[s] = i));

    const matrix = Array(users.length)
        .fill(0)
        .map(() => Array(statements.length).fill(0));

    votes.forEach((v) => {
        const u = userIndex[v.user_id];
        const s = statementIndex[v.statement_id];

        if (u !== undefined && s !== undefined) {
            matrix[u][s] = v.value;
        }
    });

    return matrix;
}
