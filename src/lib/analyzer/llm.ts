import { extractText, getDocumentProxy } from "unpdf";

// --- Interfaces ---

export interface PasalChunk {
    title: string;
    content: string;
}

export interface SummarizedPasal {
    title: string;
    summary: string;
    key_points: string[];
}

export interface FinalSummary {
    final_summary: string;
    key_points: string[];
}

// --- Helpers ---

const API_KEY = process.env.OPENROUTER_API_KEY!;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Membersihkan output LLM dari markdown code blocks agar bisa di-parse JSON
 */
function cleanJsonResponse(text: string): string {
    return text.replace(/```json|```/g, "").trim();
}

async function callLLM(messages: any) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b:free", // Atau model lain yang tersedia di OpenRouter
            messages,
            temperature: 0.3,
            response_format: { type: "json_object" }, // Memaksa output JSON jika didukung model
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content;
}

// --- Core Functions ---

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    const uint8Array = new Uint8Array(buffer);
    const pdf = await getDocumentProxy(uint8Array);
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
}

/**
 * Membagi teks berdasarkan Pasal.
 * Regex ini mencari "Pasal" yang diawali baris baru, titik, atau titik dua
 */
export function chunkByPasal(text: string): PasalChunk[] {
    const pasalRegex =
        /(?:\r?\n|\. |: | {2,}|^)\s*(Pasal\s+(?:[0-9]+[A-Z]*|[IVX]+))\b/g;
    const parts = text.split(pasalRegex);
    const chunks: PasalChunk[] = [];

    // Bagian 0 biasanya Judul/Menimbang/Mengingat
    if (parts[0]?.trim()) {
        chunks.push({ title: "Pembukaan/Judul", content: parts[0].trim() });
    }

    for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i].trim();
        const content = parts[i + 1] ? parts[i + 1].trim() : "";
        if (content) chunks.push({ title, content });
    }

    return chunks;
}

export async function summarizeChunks(
    chunks: PasalChunk[],
): Promise<SummarizedPasal[]> {
    const results: SummarizedPasal[] = [];

    for (const chunk of chunks) {
        try {
            const rawResponse = await callLLM([
                {
                    role: "system",
                    content:
                        "You are a legal text simplifier. Always respond in valid JSON format.",
                },
                {
                    role: "user",
                    content: `Sederhanakan teks hukum berikut dalam bahasa Indonesia.
                    Judul: ${chunk.title}
                    Teks: ${chunk.content}

                    Format JSON:
                    {
                        "summary": "penjelasan singkat",
                        "key_points": ["poin 1", "poin 2"]
                    }`,
                },
            ]);

            const cleanJson = cleanJsonResponse(rawResponse);
            const parsed = JSON.parse(cleanJson);

            results.push({
                title: chunk.title,
                summary: parsed.summary,
                key_points: parsed.key_points,
            });
        } catch (e) {
            console.error(`Error processing ${chunk.title}:`, e);
            results.push({
                title: chunk.title,
                summary: "Gagal memproses bagian ini.",
                key_points: [],
            });
        }

        await sleep(800); // Rate limiting
    }

    return results;
}

export async function combineSummaries(
    chunkSummaries: SummarizedPasal[],
): Promise<FinalSummary> {
    const combinedText = chunkSummaries
        .map((c) => `[${c.title}]: ${c.summary}`)
        .join("\n");

    try {
        const rawResponse = await callLLM([
            {
                role: "system",
                content:
                    "You combine multiple summaries into one coherent summary. Output JSON only.",
            },
            {
                role: "user",
                content: `Gabungkan ringkasan pasal-pasal berikut menjadi satu kesimpulan utuh yang mudah dipahami oleh masyarakat awam.
                
                DATA:
                ${combinedText}

                Format JSON:
                {
                    "final_summary": "...",
                    "key_points": ["...", "..."]
                }`,
            },
        ]);

        const cleanJson = cleanJsonResponse(rawResponse);
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("Error in combineSummaries:", e);
        return {
            final_summary: "Gagal menggabungkan ringkasan.",
            key_points: [],
        };
    }
}
