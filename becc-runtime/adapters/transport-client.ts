import { ITransportClient } from './types.js';
import { ProviderTimeoutException, ProviderNetworkException } from './exceptions.js';

export class TransportClientService implements ITransportClient {
  public async post(
    url: string,
    headers: Record<string, string>,
    body: unknown,
    timeoutMs: number,
    signal?: AbortSignal
  ): Promise<{ status: number; data: any; headers: Record<string, string> }> {
    const controller = new AbortController();
    const timeoutSignal = controller.signal;

    // Set up cleanup and abort propagation
    const onAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      signal.addEventListener('abort', onAbort);
    }

    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: timeoutSignal
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      let responseData: any;
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { text };
      }

      return {
        status: response.status,
        data: responseData,
        headers: responseHeaders
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        throw new ProviderTimeoutException(timeoutMs);
      }
      throw new ProviderNetworkException(err.message || String(err));
    } finally {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
    }
  }
}
