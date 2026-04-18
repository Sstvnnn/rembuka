function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const API_KEY = process.env.OPENROUTER_API_KEY!;

async function callLLM(messages: any) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages,
            temperature: 0.3,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content;
}

export async function summarizeChunks(chunks: string[]) {
    const results: any[] = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        try {
            const content = await callLLM([
                {
                    role: "system",
                    content:
                        "You are a legal text simplifier. Output JSON only.",
                },
                {
                    role: "user",
                    content: `
Simplify this legal text into Indonesian.

Return JSON:
{
  "summary": "...",
  "key_points": ["...", "..."]
}

TEXT:
${chunk}
          `,
                },
            ]);

            let parsed;
            try {
                parsed = JSON.parse(content);
            } catch {
                parsed = { summary: content, key_points: [] };
            }

            results.push(parsed);
        } catch (e) {
            results.push({
                summary: "Error processing chunk",
                key_points: [],
            });
        }

        await sleep(800); // penting: hindari rate limit
    }

    return results;
}

export async function combineSummaries(chunkSummaries: any[]) {
    const combinedText = chunkSummaries
        .map((c, i) => `Chunk ${i + 1}: ${c.summary}`)
        .join("\n");

    const content = await callLLM([
        {
            role: "system",
            content:
                "You combine multiple summaries into one coherent summary.",
        },
        {
            role: "user",
            content: `
Gabungkan ringkasan berikut menjadi satu ringkasan utuh yang mudah dipahami.

Return JSON:
{
  "final_summary": "...",
  "key_points": ["...", "..."]
}

DATA:
${combinedText}
      `,
        },
    ]);

    try {
        return JSON.parse(content);
    } catch {
        return { final_summary: content, key_points: [] };
    }
}
