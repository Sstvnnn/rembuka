export default function Result({ data }: any) {
    if (!data) return null;

    return (
        <div>
            <h2>Total Chunks: {data.total_chunks}</h2>

            {data.chunk_summaries?.map((r: any, i: number) => (
                <div key={i} style={{ marginBottom: 16 }}>
                    <strong>Chunk {i + 1}</strong>
                    <p>{r.summary}</p>
                </div>
            ))}

            <hr />

            <h2>Final Summary</h2>
            <p>{data.final?.final_summary}</p>

            <h3>Key Points</h3>
            <ul>
                {data.final?.key_points?.map((kp: string, i: number) => (
                    <li key={i}>{kp}</li>
                ))}
            </ul>
        </div>
    );
}
