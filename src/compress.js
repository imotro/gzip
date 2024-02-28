async function compress(data) {
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

let Gzip = {
  compress:compress
}
try{
    module.exports = {Gzip}
}catch(e){
    window.Gzip = {
        compress:compress
    }
}
