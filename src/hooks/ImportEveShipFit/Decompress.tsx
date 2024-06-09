export async function decompress(base64compressedBytes: string): Promise<string> {
  const stream = new Blob([
    Uint8Array.from(atob(base64compressedBytes.replace(/ /g, "+")), (c) => c.charCodeAt(0)),
  ]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));
  const reader = decompressedStream.pipeThrough(new TextDecoderStream()).getReader();

  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    result += value;
  }

  return result;
}
