export function normalizeMatrix(matrix: number[][]) {
    return matrix.map((row) => {
        const mean = row.reduce((a, b) => a + b, 0) / (row.length || 1);

        let variance =
            row.reduce((a, b) => a + (b - mean) ** 2, 0) / (row.length || 1);

        let std = Math.sqrt(variance);

        if (std === 0) std = 1; // 🔥 FIX

        return row.map((v) => (v - mean) / std);
    });
}
