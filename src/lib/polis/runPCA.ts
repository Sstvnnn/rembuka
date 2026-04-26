import { PCA } from "ml-pca";

export function runPCA(matrix: number[][], users: string[]) {
    const pca = new PCA(matrix);

    const transformed = pca.predict(matrix, {
        nComponents: 2,
    });

    const coords: number[][] = transformed.to2DArray();

    return coords.map((row: number[], i: number) => ({
        user: users[i],
        x: row[0],
        y: row[1],
    }));
}
