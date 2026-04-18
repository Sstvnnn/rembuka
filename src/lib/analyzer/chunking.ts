export function chunkByPasal(text: string): string[] {
    const pasalChunks = text.split(/(?=Pasal\s+\d+)/g);

    if (pasalChunks.length > 1) return pasalChunks;

    // fallback: sentence chunking
    return chunkBySentence(text);
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
