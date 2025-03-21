export function SplitFile(file: File, chunkSize: number): Blob[] {
    const chunks: Blob[] = [];
    let start = 0;
  
    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      chunks.push(chunk);
      start = end;
    }
    return chunks;
  }