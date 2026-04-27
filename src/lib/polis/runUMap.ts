import { UMAP } from "umap-js";

function deduplicateMatrix(matrix: number[][], users: string[]) {
    const map = new Map<string, number>();

    const uniqueMatrix: number[][] = [];
    const uniqueUsers: string[] = [];

    matrix.forEach((row, i) => {
        const key = JSON.stringify(row);

        if (!map.has(key)) {
            map.set(key, uniqueMatrix.length);
            uniqueMatrix.push(row);
            uniqueUsers.push(users[i]);
        }
    });

    return { matrix: uniqueMatrix, users: uniqueUsers };
}

function normalizeMatrix(matrix: number[][]) {
    return matrix.map((row) => {
        const mean = row.reduce((a, b) => a + b, 0) / (row.length || 1);

        let variance =
            row.reduce((a, b) => a + (b - mean) ** 2, 0) / (row.length || 1);

        let std = Math.sqrt(variance);

        if (std === 0) std = 1;

        return row.map((v) => (v - mean) / std);
    });
}

export function runUMAP(matrix: number[][], users: string[]) {
    const nSamples = matrix.length;

    // 🔥 Hard fallback (too small)
    if (nSamples < 3) {
        return users.map((u, i) => ({
            user: u,
            x: i,
            y: 0,
        }));
    }

    // 🔥 Deduplicate
    const { matrix: m2, users: u2 } = deduplicateMatrix(matrix, users);

    // 🔥 Too few unique patterns → PCA better
    if (m2.length < 4) {
        console.log("⚠️ UMAP skipped → too few unique rows");
        return users.map((u, i) => ({
            user: u,
            x: i,
            y: 0,
        }));
    }

    // 🔥 Normalize
    const normalized = normalizeMatrix(m2);

    // 🔥 Adaptive neighbors
    const nNeighbors = Math.max(2, Math.min(5, m2.length - 1));

    const umap = new UMAP({
        nNeighbors,
        minDist: 0.3,
        nComponents: 2,
        random: () => 42, // biar stabil
    });

    let embedding: number[][];

    try {
        embedding = umap.fit(normalized);
    } catch (err) {
        console.error("❌ UMAP failed, fallback:", err);

        return users.map((u, i) => ({
            user: u,
            x: i,
            y: 0,
        }));
    }

    return embedding.map((point, i) => ({
        user: u2[i],
        x: point[0],
        y: point[1],
    }));
}
