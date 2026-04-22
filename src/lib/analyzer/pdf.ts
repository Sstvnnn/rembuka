import { extractText, getDocumentProxy } from "unpdf";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // Convert Node Buffer to Uint8Array (required by unpdf)
    const uint8Array = new Uint8Array(buffer);

    const pdf = await getDocumentProxy(uint8Array);
    const { text } = await extractText(pdf, { mergePages: true });

    return text;
}
