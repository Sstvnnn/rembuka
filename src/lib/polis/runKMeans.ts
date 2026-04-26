import { kmeans } from "ml-kmeans";

type Point = {
    user: string;
    x: number;
    y: number;
};

export function runKMeans(points: Point[], k: number = 2) {
    const data = points.map((p) => [p.x, p.y]);

    const result = kmeans(data, k, {
        initialization: "kmeans++", // penting biar stabil
    });

    return points.map((p, i) => ({
        user: p.user,
        x: p.x,
        y: p.y,
        cluster: result.clusters[i],
    }));
}
