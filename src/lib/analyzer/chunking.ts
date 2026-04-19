export function chunkByPasal(text: string, maxWords = 2000): string[] {
    if (!text) return [];

    const normalized = normalizeText(text);

    const rawChunks = normalized.split(/(?=^Pasal\s+\d+)/gm);

    const validChunks = rawChunks.filter((chunk) => isValidPasalHeader(chunk));

    return validChunks.flatMap((chunk) => splitLongChunk(chunk, maxWords));
}

function isValidPasalHeader(chunk: string): boolean {
    if (!chunk) return false;

    const firstLine = chunk.split("\n")[0].trim();

    return /^Pasal\s+\d+$/.test(firstLine);
}

function normalizeText(text: string) {
    return text
        .replace(/\r/g, "")

        .replace(/(Pasal\s+\d+)/g, "\n$1")

        .replace(/(Pasal\s+\d+)\s+(diubah|berbunyi|sebagai)/gi, "$1\n")

        .replace(/\n{2,}/g, "\n")
        .trim();
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).length;
}

function splitLongChunk(chunk: string, maxWords: number): string[] {
    if (countWords(chunk) <= maxWords) return [chunk];

    const sentences = chunk.split(/(?<=[.!?])\s+/);

    const result: string[] = [];
    let current = "";

    for (const sentence of sentences) {
        const combined = current + " " + sentence;

        if (countWords(combined) > maxWords) {
            if (current) result.push(current.trim());
            current = sentence;
        } else {
            current = combined;
        }
    }

    if (current) result.push(current.trim());

    return result.flatMap((c) => hardSlice(c, maxWords));
}

function hardSlice(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(" "));
    }

    return chunks;
}

function chunkBySentence(text: string, maxLength = 1000) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const chunks: string[] = [];
    let current = "";

    for (const s of sentences) {
        if ((current + s).length > maxLength) {
            chunks.push(current);
            current = s;
        } else {
            current += s;
        }
    }

    if (current) chunks.push(current);

    return chunks;
}
