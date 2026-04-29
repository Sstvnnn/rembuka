import { DBSCAN } from "density-clustering";

type Point = {
    user: string;
    x: number;
    y: number;
};

export function runDBSCAN(points: Point[]) {
    const dbscan = new DBSCAN();

    const dataset = points.map((p) => [p.x, p.y]);

    const clusters = dbscan.run(dataset, 0.8, 2); // eps, minPts

    const result: any[] = [];

    clusters.forEach((cluster: number[], clusterId: number) => {
        cluster.forEach((index: number) => {
            result[index] = {
                ...points[index],
                cluster: clusterId,
            };
        });
    });

    // noise
    dbscan.noise.forEach((index: number) => {
        result[index] = {
            ...points[index],
            cluster: -1,
        };
    });

    return result;
}
