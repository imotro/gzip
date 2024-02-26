class Gzip {
  static async compress(data) {
    const encoder = new TextEncoder();
    const input = encoder.encode(data);
    const start = performance.now();
    const compressedChunks = [];

    const compressor = new CompressionStream('gzip');
    const writableStream = new WritableStream({
      write(chunk) {
        compressedChunks.push(chunk);
      },
      close() {
        console.log('Compression complete');
      },
      abort(reason) {
        console.error('Compression failed:', reason);
      },
    });

    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(input);
        controller.close();
      }
    });

    await readableStream.pipeThrough(compressor).pipeTo(writableStream);

    const end = performance.now();
    const totalTime = end - start;
    const averageTimePerChunk = totalTime / compressedChunks.length;

    const concatenated = new Uint8Array(compressedChunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of compressedChunks) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }

    return {
      chunks: compressedChunks.length,
      averageTimePerChunk,
      compressedData: concatenated
    };
  }

  static async decompress(data) {
    const decoder = new TextDecoder();
    const start = performance.now();
    const decompressedChunks = [];

    const input = new Response(data).body;
    const decompressor = new DecompressionStream('gzip');
    const writableStream = new WritableStream({
      write(chunk) {
        decompressedChunks.push(chunk);
      },
      close() {
        console.log('Decompression complete');
      },
      abort(reason) {
        console.error('Decompression failed:', reason);
      },
    });

    await input.pipeThrough(decompressor).pipeTo(writableStream);

    const end = performance.now();
    const totalTime = end - start;
    const averageTimePerChunk = totalTime / decompressedChunks.length;

    const concatenated = new Uint8Array(decompressedChunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of decompressedChunks) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }

    const result = decoder.decode(concatenated);

    return {
      chunks: decompressedChunks.length,
      averageTimePerChunk,
      decompressedData: result
    };
  }
}

module.exports = Gzip

// you can just include it in a script tag and forget about it
window.Gzip = Gzip
