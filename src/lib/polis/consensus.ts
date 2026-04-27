type Vote = {
    user_id: string;
    statement_id: string;
    value: number; // -1, 0, 1
};

type ClusteredUser = {
    user: string;
    cluster: number;
};

export function detectConsensus(votes: Vote[], clustered: ClusteredUser[]) {
    const userCluster: Record<string, number> = {};

    clustered.forEach((u) => {
        userCluster[u.user] = u.cluster;
    });

    // group by statement
    const statementMap: Record<string, Vote[]> = {};

    votes.forEach((v) => {
        if (!statementMap[v.statement_id]) {
            statementMap[v.statement_id] = [];
        }
        statementMap[v.statement_id].push(v);
    });

    const results: any[] = [];

    for (const statementId in statementMap) {
        const votesList = statementMap[statementId];

        const clusterStats: Record<
            number,
            {
                agree: number;
                disagree: number;
                pass: number;
                total: number;
            }
        > = {};

        votesList.forEach((v) => {
            const cluster = userCluster[v.user_id];

            if (cluster === undefined) return;

            if (!clusterStats[cluster]) {
                clusterStats[cluster] = {
                    agree: 0,
                    disagree: 0,
                    pass: 0,
                    total: 0,
                };
            }

            const stat = clusterStats[cluster];

            if (v.value === 1) stat.agree++;
            else if (v.value === -1) stat.disagree++;
            else stat.pass++;

            stat.total++;
        });

        // evaluate
        let isConsensus = true;
        let isPolarized = false;

        const clusterKeys = Object.keys(clusterStats);

        for (const key of clusterKeys) {
            const stat = clusterStats[Number(key)];

            if (stat.total === 0) continue;

            const agreeRatio = stat.agree / stat.total;
            const disagreeRatio = stat.disagree / stat.total;

            if (agreeRatio <= 0.5) {
                isConsensus = false;
            }

            if (agreeRatio > 0.6) {
                for (const otherKey of clusterKeys) {
                    if (otherKey === key) continue;

                    const other = clusterStats[Number(otherKey)];
                    if (other.total === 0) continue;

                    const otherDisagree = other.disagree / other.total;

                    if (otherDisagree > 0.6) {
                        isPolarized = true;
                    }
                }
            }
        }

        let label: "consensus" | "polarized" | "neutral" = "neutral";

        if (isConsensus) label = "consensus";
        else if (isPolarized) label = "polarized";

        results.push({
            statement_id: statementId,
            label,

            clusters: Object.entries(clusterStats).map(([cluster, stat]) => ({
                cluster: Number(cluster),
                agree: stat.agree,
                disagree: stat.disagree,
                total: stat.total,
                agreeRatio: stat.total > 0 ? stat.agree / stat.total : 0,
            })),
        });
    }

    return results;
}
