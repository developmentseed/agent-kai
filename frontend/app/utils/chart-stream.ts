import { clog } from './dev';

/**
 * Custom error class for chat stream operations.
 * Includes error type and optional details for better error handling.
 */
export class ChatStreamError extends Error {
  type: string;
  details?: any;

  constructor(message: string, type: string, details?: any) {
    super(message);
    this.type = type;
    this.details = details || {};
  }
}

/**
 * Reads a streaming response line-by-line and invokes the onData callback for
 * each line. Handles partial chunks and supports aborting via AbortController.
 */
export async function readDataStream({
  abortController,
  reader,
  onData
}: {
  abortController: AbortController;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  onData: (data: string) => void | Promise<void>;
}) {
  // Process the simplified streaming response
  const utf8Decoder = new TextDecoder('utf-8');
  let { value: chunk, done: readerDone } = await reader.read();
  let decodedChunk = chunk ? utf8Decoder.decode(chunk, { stream: true }) : '';

  let buffer = ''; // Accumulate partial chunks

  while (!readerDone && !abortController.signal.aborted) {
    buffer += decodedChunk; // Append current chunk to buffer

    let lineBreakIndex;
    // Extract complete lines from the buffer
    while ((lineBreakIndex = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, lineBreakIndex).trim(); // Extract the line
      buffer = buffer.slice(lineBreakIndex + 1); // Remove processed line

      if (line) {
        await onData(line);
      }
    }

    // Read next chunk
    ({ value: chunk, done: readerDone } = await reader.read());
    decodedChunk = chunk ? utf8Decoder.decode(chunk, { stream: true }) : '';
  }

  // Handle any remaining data in the buffer, even if aborted
  if (buffer.trim()) {
    await onData(buffer);
  }
}

/**
 * ChatStream handles sending messages to a server endpoint and processing
 * streaming responses.
 */
export class ChatStream {
  url: string;
  timeout: number;
  abortController: AbortController | null = null;

  /**
   * @param options.url - The server endpoint URL.
   * @param options.timeout - Optional timeout in milliseconds (default: 310000
   * ms).
   */
  constructor(options: { url: string; timeout?: number }) {
    const { url, timeout } = options;
    this.url = url;
    // Default timeout of 5 minutes 10 seconds.
    this.timeout = timeout || 310000;
  }

  /**
   * Sends a message payload to the server and processes the streaming response.
   * @param payload - Data to send in the POST request body.
   * @param onData - Callback invoked with each parsed response chunk.
   */
  async sendMessage(payload: any, onData: (data: any) => void) {
    if (this.abortController) {
      clog('There is an ongoing request. Aborting');
      this.abortController.abort();
    }

    // Set up abort controller for client-side timeout.
    this.abortController = new AbortController();
    const abortController = this.abortController;
    // 5 minutes 10 seconds (slightly longer than server timeout)
    const timeoutId = setTimeout(() => abortController.abort(), 310000);

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new ChatStreamError(
          `Server responded with status ${response.status}`,
          'NetworkError',
          { status: response.status }
        );
      }

      if (!response.body) {
        throw new ChatStreamError(
          'No response body received from server',
          'NetworkError'
        );
      }

      const reader = response.body.getReader();

      // Read and process the streaming response
      await readDataStream({
        abortController,
        reader,
        onData: async (data) => onData(JSON.parse(data))
      });

      const { done: readerDone } = await reader.read();

      if (readerDone) {
        clearTimeout(timeoutId);
        return;
      }

      abortController.signal.throwIfAborted();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ChatStreamError) {
        throw error;
      }

      // Check if error was due to abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ChatStreamError(
          'Request aborted due to timeout',
          'AbortError'
        );
      }

      // Check if error was due to network issues
      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes('network')
      ) {
        throw new ChatStreamError(
          'Unable to connect to the server. Please check your internet connection and try again.',
          'NetworkError'
        );
      }

      if (error instanceof Error) {
        throw new ChatStreamError(error.message, error.name);
      }

      throw new ChatStreamError(
        (error as any).message || 'Unknown error',
        'unknown'
      );
    } finally {
      this.abortController = null;
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort(
        new ChatStreamError('Request aborted by user', 'AbortError')
      );
      this.abortController = null;
    }
  }
}
