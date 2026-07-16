export class ProviderNetworkException extends Error {
  constructor(message: string) {
    super(`Provider network connection failed: ${message}`);
    this.name = 'ProviderNetworkException';
  }
}

export class ProviderTimeoutException extends Error {
  constructor(timeoutMs: number) {
    super(`Provider request timed out after ${timeoutMs}ms.`);
    this.name = 'ProviderTimeoutException';
  }
}

export class ProviderRateLimitException extends Error {
  constructor(message: string) {
    super(`Provider rate limit exceeded: ${message}`);
    this.name = 'ProviderRateLimitException';
  }
}

export class CapacityExceededException extends Error {
  constructor(estimatedTokens: number, limitTokens: number) {
    super(`Context capacity exceeded. Requested ${estimatedTokens} tokens, limit is ${limitTokens} tokens.`);
    this.name = 'CapacityExceededException';
  }
}

export class AuthenticationException extends Error {
  constructor(message: string) {
    super(`Provider authentication failed: ${message}`);
    this.name = 'AuthenticationException';
  }
}

export class InvalidRequestException extends Error {
  constructor(message: string) {
    super(`Provider request payload is invalid: ${message}`);
    this.name = 'InvalidRequestException';
  }
}

export class AdapterResolutionException extends Error {
  constructor(providerId: string) {
    super(`No registered adapter found for provider ID: ${providerId}`);
    this.name = 'AdapterResolutionException';
  }
}
