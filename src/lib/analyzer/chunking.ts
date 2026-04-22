export interface PasalChunk {
    title: string;
    content: string;
}

export function chunkByPasal(text: string): PasalChunk[] {
    if (!text) return [];

    /**
     * REGEX IMPROVED:
     * 1. (?:\r?\n|\. |: | {2,}|^): Mencari Pasal yang diawali newline,
     * titik (akhir kalimat), titik dua, dua spasi, atau awal dokumen.
     * 2. \s*(Pasal\s+(?:[0-9]+[A-Z]*|[IVX]+)): Menangkap "Pasal 1" atau "Pasal I".
     * 3. \b: Memastikan batas kata.
     */
    const pasalRegex =
        /(?:\r?\n|\. |: | {2,}|^)\s*(Pasal\s+(?:[0-9]+[A-Z]*|[IVX]+))\b/g;

    // Gunakan split dengan regex
    const parts = text.split(pasalRegex);
    const chunks: PasalChunk[] = [];

    // Bagian pertama biasanya adalah Judul/Pembukaan
    if (parts[0] && parts[0].trim().length > 0) {
        chunks.push({
            title: "Pembukaan / Judul Peraturan",
            content: parts[0].trim(),
        });
    }

    for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i].trim();
        const content = parts[i + 1] ? parts[i + 1].trim() : "";

        // Validasi Sederhana:
        // Header Pasal biasanya diikuti oleh teks yang panjang.
        // Jika content sangat pendek (misal hanya referensi),
        // Anda bisa menggabungkannya kembali, tapi untuk chunking dasar ini sudah cukup.
        chunks.push({ title, content });
    }
    console.log(`Found ${chunks.length} Pasal chunks.`);
    console.log(chunks);
    return chunks;
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
