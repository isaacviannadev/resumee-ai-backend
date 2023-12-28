import { decode, encode } from 'gpt-3-encoder';

export function splitTranscription(
  transcription: string,
  chunkSize: number = 2000
): string[] {
  const encoded = encode(transcription);
  const tokens = encoded.length;

  if (tokens <= chunkSize) {
    return [decode(encoded)];
  }

  const chunkLength = Math.ceil(tokens / chunkSize);
  const chunks: string[] = [];

  for (let i = 0; i < chunkLength; i++) {
    const start = i * chunkSize;
    const end = i + 1 < chunkLength ? (i + 1) * chunkSize : undefined;

    chunks.push(decode(encoded.slice(start, end)));
  }

  return chunks;
}
