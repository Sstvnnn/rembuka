import { polygonHull } from "d3-polygon";

type Point = { x: number; y: number };

export function getHull(points: Point[]): Point[] {
    if (points.length < 3) return [];

    const coords: [number, number][] = points.map(
        (p) => [p.x, p.y] as [number, number],
    );

    const hull = polygonHull(coords);

    if (!hull) return [];

    return hull.map(([x, y]) => ({ x, y }));
}
